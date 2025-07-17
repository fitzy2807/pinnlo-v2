import { supabase } from '@/lib/supabase'

export interface CommitToTaskListParams {
  requirementId: string
  requirementTitle: string
  requirementCardData: any
  strategyId: string
  userId: string
}

export interface CommitToTaskListResult {
  success: boolean
  taskList?: any
  tasks?: any[]
  metadata?: {
    totalTasks: number
    totalEffort: number
    categories: number
    trdId: string
    trdTitle: string
  }
  error?: string
}

/**
 * Commits a Technical Requirements Document to a structured task list via MCP
 * This function handles the complete flow from TRD to task list creation
 */
export async function commitToTaskList(params: CommitToTaskListParams): Promise<CommitToTaskListResult> {
  try {
    console.log('📋 UTILITY: Committing TRD to structured task list via MCP:', params.requirementTitle)
    
    const { requirementId, requirementTitle, requirementCardData, strategyId, userId } = params
    
    // Get user session for authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')
    
    console.log('🎯 UTILITY: Calling MCP-powered API endpoint')
    console.log('📊 UTILITY: TRD data being sent:', {
      trdId: requirementId,
      trdTitle: requirementTitle,
      strategyId: strategyId,
      userId: userId,
      trdContentKeys: Object.keys(requirementCardData)
    })
    
    // Call the MCP-powered API endpoint
    const response = await fetch('/api/development-bank/commit-trd-to-task-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        trdId: requirementId,
        trdTitle: requirementTitle,
        trdContent: requirementCardData,
        strategyId: strategyId,
        userId: userId
      })
    })
    
    console.log('📞 UTILITY: API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ UTILITY: API error response:', errorText)
      throw new Error(`Failed to commit TRD to task list: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('✅ UTILITY: MCP API response:', result)
    
    if (!result.success) {
      throw new Error(`Task list generation failed: ${result.error}`)
    }
    
    console.log('🎉 UTILITY: Successfully committed TRD to structured task list!')
    console.log('📊 UTILITY: Generated task list metadata:', result.metadata)
    
    return {
      success: true,
      taskList: result.taskList,
      tasks: result.tasks,
      metadata: result.metadata
    }
    
  } catch (error: any) {
    console.error('❌ UTILITY: Error committing TRD to task list:', error)
    return {
      success: false,
      error: error.message || 'Failed to commit TRD to task list'
    }
  }
}

/**
 * Updates a TRD card to mark it as committed to tasks
 */
export async function markTrdAsCommitted(
  requirementId: string, 
  requirementCardData: any,
  taskListResult: CommitToTaskListResult
): Promise<void> {
  if (!taskListResult.success || !taskListResult.taskList || !taskListResult.tasks) {
    throw new Error('Invalid task list result')
  }

  const updatedCardData = {
    ...requirementCardData,
    implementationRoadmap: {
      ...requirementCardData.implementationRoadmap,
      committedToTasks: true,
      committedAt: new Date().toISOString(),
      taskListId: taskListResult.taskList.id,
      taskIds: taskListResult.tasks.map((task: any) => task.id),
      totalTasks: taskListResult.metadata?.totalTasks || 0,
      totalEffort: taskListResult.metadata?.totalEffort || 0
    }
  }

  const { error } = await supabase
    .from('cards')
    .update({ card_data: updatedCardData })
    .eq('id', requirementId)

  if (error) {
    console.error('❌ UTILITY: Error updating TRD card:', error)
    throw error
  }

  console.log('✅ UTILITY: TRD marked as committed to tasks')
}

/**
 * Triggers a refresh of task lists by dispatching a custom event
 */
export function triggerTaskListRefresh(taskListResult: CommitToTaskListResult): void {
  if (taskListResult.success && taskListResult.taskList) {
    window.dispatchEvent(new CustomEvent('taskListCreated', {
      detail: {
        taskListId: taskListResult.taskList.id,
        taskCount: taskListResult.metadata?.totalTasks || 0,
        effort: taskListResult.metadata?.totalEffort || 0
      }
    }))
  }
}