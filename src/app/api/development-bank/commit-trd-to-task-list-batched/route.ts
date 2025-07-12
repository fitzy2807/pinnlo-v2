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
    console.log('🌐 API: Received batched TRD commit to task list request')
    
    const body = await request.json()
    const { trdId, trdTitle, trdContent, strategyId, userId } = body
    
    if (!trdId || !trdTitle || !strategyId || !userId) {
      throw new Error('Missing required fields: trdId, trdTitle, strategyId, userId')
    }
    
    // Step 1: Get orchestration plan from MCP
    console.log('📤 API: Getting orchestration plan from MCP')
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/api/tools/commit_trd_to_task_list_batched`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_SERVER_TOKEN}`
      },
      body: JSON.stringify({
        trdId, trdTitle, trdContent, strategyId, userId
      })
    })
    
    if (!mcpResponse.ok) {
      throw new Error(`MCP server error: ${mcpResponse.status}`)
    }
    
    const mcpResult = await mcpResponse.json()
    let parsedMcpResult
    
    if (mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
      try {
        parsedMcpResult = JSON.parse(mcpResult.content[0].text)
      } catch (parseError) {
        throw new Error(`Failed to parse MCP response: ${parseError.message}`)
      }
    } else {
      throw new Error('Invalid MCP response structure')
    }
    
    if (!parsedMcpResult.success) {
      throw new Error(`MCP orchestration failed: ${parsedMcpResult.error}`)
    }
    
    const { orchestrationPlan } = parsedMcpResult
    console.log('📋 API: Got orchestration plan with metadata + 3 batches')
    
    // Step 2: Generate metadata first
    console.log('🏗️ API: Generating task list metadata')
    const metadataResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: orchestrationPlan.config.model,
        messages: [
          { role: 'system', content: orchestrationPlan.metadata.system },
          { role: 'user', content: orchestrationPlan.metadata.user }
        ],
        temperature: orchestrationPlan.config.temperature,
        max_tokens: orchestrationPlan.config.max_tokens,
        response_format: { type: 'json_object' }
      })
    })
    
    if (!metadataResponse.ok) {
      throw new Error(`OpenAI metadata error: ${metadataResponse.status}`)
    }
    
    const metadataResult = await metadataResponse.json()
    const metadata = JSON.parse(metadataResult.choices[0].message.content)
    console.log('✅ API: Generated metadata:', metadata.taskListMetadata.name)
    
    // Step 3: Generate tasks batch by batch  
    const allTasks = []
    const batchNames = ['batch1', 'batch2', 'batch3']
    
    for (let i = 0; i < batchNames.length; i++) {
      const batchName = batchNames[i]
      console.log(`🔄 API: Generating ${batchName} (${metadata.batches[i].description})`)
      
      const batchResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: orchestrationPlan.config.model,
          messages: [
            { role: 'system', content: orchestrationPlan.batches[batchName].system },
            { role: 'user', content: orchestrationPlan.batches[batchName].user }
          ],
          temperature: orchestrationPlan.config.temperature,
          max_tokens: orchestrationPlan.config.max_tokens,
          response_format: { type: 'json_object' }
        })
      })
      
      if (!batchResponse.ok) {
        throw new Error(`OpenAI batch ${batchName} error: ${batchResponse.status}`)
      }
      
      const batchResult = await batchResponse.json()
      const batchTasks = JSON.parse(batchResult.choices[0].message.content)
      allTasks.push(...batchTasks.tasks)
      
      console.log(`✅ API: Generated ${batchTasks.tasks.length} tasks for ${batchName}`)
    }
    
    console.log(`🎯 API: Total generated: ${allTasks.length} tasks`)
    
    // Step 4: Create the task list container card
    const taskListContainer = {
      title: metadata.taskListMetadata.name,
      description: `Comprehensive implementation plan generated from TRD: ${trdTitle}`,
      card_type: 'task-list',
      card_data: {
        metadata: {
          status: metadata.taskListMetadata.status,
          priority: metadata.taskListMetadata.priority,
          estimatedEffort: metadata.taskListMetadata.estimatedEffort,
          timeline: {
            startDate: null,
            targetDate: null
          },
          owner: '',
          dependencies: [],
          progress: {
            totalTasks: allTasks.length,
            completedTasks: 0,
            percentage: 0
          }
        },
        categories: metadata.categories,
        trdSource: {
          trdId,
          trdTitle,
          committedAt: new Date().toISOString(),
          committedBy: userId
        },
        generationSettings: {
          batchingStrategy: 'three-batch-approach',
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
    
    // Step 5: Create individual task cards
    const taskCards = allTasks.map((task: any) => ({
      title: task.title,
      description: task.description?.objective || task.title,
      card_type: 'task',
      card_data: {
        ...task,
        task_list_id: createdTaskList.id
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
    
    // Step 6: Update the original TRD
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
            totalEffort: metadata.taskListMetadata.estimatedEffort,
            batchingStrategy: 'three-batch-approach'
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
        totalEffort: metadata.taskListMetadata.estimatedEffort,
        categories: metadata.categories.length,
        batchingStrategy: 'three-batch-approach',
        trdId,
        trdTitle
      }
    })
    
  } catch (error: any) {
    console.error('❌ API: Error in batched TRD commit:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to commit TRD to task list'
      },
      { status: 500 }
    )
  }
}
