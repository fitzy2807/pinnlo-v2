import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations like task creation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001'
const MCP_SERVER_TOKEN = process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'

export async function POST(request: NextRequest) {
  try {
    console.log('🌐 API: Received TRD commit to task list request')
    
    // Check environment variables
    console.log('🔍 API: Environment check:')
    console.log('  - MCP_SERVER_URL:', process.env.MCP_SERVER_URL || 'NOT SET')
    console.log('  - MCP_SERVER_TOKEN:', process.env.MCP_SERVER_TOKEN ? 'SET' : 'NOT SET')
    console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET')
    
    const body = await request.json()
    console.log('📦 API: Request body keys:', Object.keys(body))
    
    const { trdId, trdTitle, trdContent, strategyId, userId } = body
    
    if (!trdId || !trdTitle || !strategyId || !userId) {
      throw new Error('Missing required fields: trdId, trdTitle, strategyId, userId')
    }
    
    // Call MCP server to generate structured task list
    console.log('📤 API: Calling MCP server for task list generation')
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/api/tools/commit_trd_to_task_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        trdId,
        trdTitle,
        trdContent,
        strategyId,
        userId
      })
    })
    
    if (!mcpResponse.ok) {
      throw new Error(`MCP server error: ${mcpResponse.status} - ${await mcpResponse.text()}`)
    }
    
    const mcpResult = await mcpResponse.json()
    console.log('📊 API: MCP response:', JSON.stringify(mcpResult, null, 2))
    
    // Parse the MCP response format
    let parsedMcpResult
    if (mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
      try {
        parsedMcpResult = JSON.parse(mcpResult.content[0].text)
      } catch (parseError) {
        console.error('❌ API: Failed to parse MCP JSON response:', parseError)
        throw new Error(`Failed to parse MCP response: ${parseError.message}`)
      }
    } else {
      throw new Error('Invalid MCP response structure')
    }
    
    if (!parsedMcpResult.success) {
      throw new Error(`MCP generation failed: ${parsedMcpResult.error || 'Unknown error'}`)
    }
    
    // Get the generated prompts and call OpenAI
    const { prompts, config } = parsedMcpResult
    
    console.log('🤖 API: Calling OpenAI with generated prompts')
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user }
        ],
        temperature: config.temperature,
        max_tokens: 8000, // Reduced to force shorter responses
        response_format: { type: 'json_object' }
      })
    })
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
    }
    
    const openaiResult = await openaiResponse.json()
    console.log('🔍 API: OpenAI full response:', JSON.stringify(openaiResult, null, 2))
    
    if (!openaiResult.choices || !openaiResult.choices[0] || !openaiResult.choices[0].message) {
      throw new Error('Invalid OpenAI response structure')
    }
    
    const messageContent = openaiResult.choices[0].message.content
    console.log('📝 API: OpenAI message content:', messageContent)
    
    let generatedContent
    try {
      generatedContent = JSON.parse(messageContent)
    } catch (parseError) {
      console.error('❌ API: Failed to parse OpenAI JSON response:', parseError)
      console.error('📝 API: Raw content that failed to parse (first 1000 chars):', messageContent.substring(0, 1000))
      console.error('📝 API: Raw content that failed to parse (last 1000 chars):', messageContent.substring(messageContent.length - 1000))
      
      // Check if it's a truncation issue
      if (messageContent.includes('"acceptanceCriteria": [') && !messageContent.includes('"definitionOfDone"')) {
        throw new Error('OpenAI response was truncated. The JSON is incomplete. Try reducing the TRD content or increasing max_tokens.')
      }
      
      throw new Error(`Failed to parse OpenAI JSON response: ${parseError.message}`)
    }
    
    console.log('✅ API: OpenAI generated structured task list')
    console.log('📋 API: Task list metadata:', generatedContent.taskListMetadata)
    console.log('📊 API: Generated', generatedContent.tasks?.length || 0, 'tasks across', generatedContent.categories?.length || 0, 'categories')
    
    // Create the task list container card
    const taskListContainer = {
      title: generatedContent.taskListMetadata.name,
      description: `Comprehensive implementation plan generated from TRD: ${trdTitle}`,
      card_type: 'task-list',
      card_data: {
        metadata: {
          status: generatedContent.taskListMetadata.status,
          priority: generatedContent.taskListMetadata.priority,
          estimatedEffort: generatedContent.taskListMetadata.estimatedEffort,
          timeline: {
            startDate: null,
            targetDate: null
          },
          owner: '',
          dependencies: [],
          progress: {
            totalTasks: generatedContent.taskListMetadata.totalTasks,
            completedTasks: 0,
            percentage: 0
          }
        },
        categories: generatedContent.categories,
        trdSource: {
          trdId,
          trdTitle,
          committedAt: new Date().toISOString(),
          committedBy: userId
        },
        generationSettings: {
          includedSections: generatedContent.categories.map((c: any) => c.id),
          generatedAt: new Date().toISOString(),
          generatedBy: userId,
          version: '1.0.0'
        }
      },
      strategy_id: parseInt(strategyId),
      created_by: userId
    }
    
    // Insert task list container
    const { data: createdTaskList, error: taskListError } = await supabase
      .from('cards')
      .insert(taskListContainer)
      .select()
      .single()
    
    if (taskListError) throw taskListError
    
    console.log('✅ API: Task list container created:', createdTaskList.id)
    
    // Create individual task cards
    const taskCards = generatedContent.tasks.map((task: any) => ({
      title: task.title,
      description: task.description?.objective || task.title,
      card_type: 'task',
      card_data: {
        task_list_id: createdTaskList.id,
        category: task.category,
        taskId: task.taskId,
        description: task.description,
        acceptanceCriteria: task.acceptanceCriteria || [],
        dependencies: task.dependencies || { blocks: [], blockedBy: [] },
        technicalImplementation: task.technicalImplementation || { filesToCreate: [] },
        definitionOfDone: task.definitionOfDone || [],
        trdSource: {
          trdId,
          trdTitle,
          section: task.category
        },
        metadata: {
          status: task.status || 'Not Started',
          priority: task.priority || 'Medium',
          effort: task.effort || 3,
          taskId: task.taskId,
          assignee: null,
          tags: [task.category, task.priority],
          estimatedHours: (task.effort || 3) * 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      strategy_id: parseInt(strategyId),
      created_by: userId
    }))
    
    const { data: createdTasks, error: tasksError } = await supabase
      .from('cards')
      .insert(taskCards)
      .select()
    
    if (tasksError) throw tasksError
    
    console.log(`✅ API: Successfully created ${createdTasks.length} task cards`)
    
    // Update the original TRD to mark it as committed
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        card_data: {
          ...trdContent,
          implementationRoadmap: {
            ...trdContent.implementationRoadmap,
            committedToTasks: true,
            committedAt: new Date().toISOString(),
            taskListId: createdTaskList.id,
            taskIds: createdTasks.map((task: any) => task.id),
            totalTasks: createdTasks.length,
            totalEffort: generatedContent.taskListMetadata.estimatedEffort
          }
        }
      })
      .eq('id', trdId)
    
    if (updateError) throw updateError
    
    console.log('✅ API: TRD marked as committed to task list')
    
    return NextResponse.json({
      success: true,
      taskList: createdTaskList,
      tasks: createdTasks,
      metadata: {
        totalTasks: createdTasks.length,
        totalEffort: generatedContent.taskListMetadata.estimatedEffort,
        categories: generatedContent.categories.length,
        trdId,
        trdTitle
      }
    })
    
  } catch (error: any) {
    console.error('❌ API: Error committing TRD to task list:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to commit TRD to task list'
      },
      { status: 500 }
    )
  }
}
