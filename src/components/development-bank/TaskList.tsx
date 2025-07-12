'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Clock, User, Target, ArrowRight, ExternalLink, Plus, Edit, Trash2, Copy, MoreHorizontal, X } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { supabase } from '@/lib/supabase'
import TaskEditModal from '@/components/modals/TaskEditModal'

interface TaskListProps {
  strategyId: string
}

interface TaskListItemProps {
  taskList: any
  tasks: any[]
  onTaskUpdate: (taskId: string, updates: any) => void
  onTaskListEdit: (taskListId: string) => void
  onTaskListDelete: (taskListId: string) => void
  onTaskListDuplicate: (taskListId: string) => void
  onTaskAdd: (taskListId: string, categoryId?: string) => void
  onTaskEdit: (taskId: string) => void
  onTaskDelete: (taskId: string) => void
  onTaskDuplicate: (taskId: string) => void
  onCategoryAdd: (taskListId: string) => void
  onCategoryEdit: (taskListId: string, categoryName: string) => void
  onCategoryDelete: (taskListId: string, categoryName: string) => void
}

function TaskListItem({ 
  taskList, 
  tasks, 
  onTaskUpdate, 
  onTaskListEdit, 
  onTaskListDelete, 
  onTaskListDuplicate, 
  onTaskAdd, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskDuplicate,
  onCategoryAdd,
  onCategoryEdit,
  onCategoryDelete
}: TaskListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }
  
  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }
  
  const updateTaskStatus = (taskId: string, status: string) => {
    onTaskUpdate(taskId, { 
      metadata: { 
        status 
      } 
    })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-green-600 bg-green-50 border-green-200'
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'Review': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50'
      case 'High': return 'text-orange-600 bg-orange-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    const categoryId = task.category || task.card_data?.category || task.cardData?.category || 'other'
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(task)
    return acc
  }, {} as Record<string, any[]>)

  const calculateCategoryProgress = (categoryTasks: any[]): number => {
    if (categoryTasks.length === 0) return 0
    const completed = categoryTasks.filter(task => 
      (task.metadata?.status || task.card_data?.metadata?.status || task.status) === 'Done'
    ).length
    return Math.round((completed / categoryTasks.length) * 100)
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Task List Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-black"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div>
              <h3 className="font-semibold text-black">{taskList.title}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(taskList.card_data?.metadata?.status || taskList.status || 'Not Started')}`}>
                  {taskList.card_data?.metadata?.status || taskList.status || 'Not Started'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(taskList.card_data?.metadata?.priority || taskList.priority || 'Medium')}`}>
                  {taskList.card_data?.metadata?.priority || taskList.priority || 'Medium'}
                </span>
                <span className="text-sm text-black">{tasks.length} tasks</span>
                <span className="text-sm text-black">{taskList.card_data?.metadata?.estimatedEffort || tasks.reduce((sum, task) => sum + (task.metadata?.effort || task.effort || 3), 0)} points</span>
                {(taskList.card_data?.metadata?.owner || taskList.card_data?.owner) && (
                  <span className="text-sm text-black flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {taskList.card_data?.metadata?.owner || taskList.card_data?.owner}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-black">
                {tasks.length > 0 ? Math.round((tasks.filter(task => (task.metadata?.status || task.status) === 'Done').length / tasks.length) * 100) : 0}% Complete
              </div>
              <div className="text-xs text-black">
                From TRD: {taskList.card_data?.trdSource?.trdTitle || 'Unknown TRD'}
              </div>
            </div>
            
            {/* Task List Actions */}
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTaskAdd(taskList.id)
                }}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Add Task"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTaskListEdit(taskList.id)
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Task List"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTaskListDuplicate(taskList.id)
                }}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="Duplicate Task List"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this task list? This will also delete all associated tasks.'))
                    onTaskListDelete(taskList.id)
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Task List"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${tasks.length > 0 ? Math.round((tasks.filter(task => (task.metadata?.status || task.status) === 'Done').length / tasks.length) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Categories */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Show tasks directly if no categories, or show by categories */}
          {(taskList.card_data?.categories && taskList.card_data.categories.length > 0) ? (
            // Render by categories
            taskList.card_data.categories.map((category: any) => {
              const isExpanded = expandedCategories.has(category.id)
              const categoryTasks = tasksByCategory[category.id] || []
              const progress = calculateCategoryProgress(categoryTasks)
              
              return (
                <div key={category.id} className="border border-gray-100 rounded-lg">
                  {/* Category Header */}
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="text-gray-600 hover:text-black"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="text-lg">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-black">{category.name}</h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-black">
                              {categoryTasks.length} tasks
                            </span>
                            <span className="text-sm text-black">
                              {category.estimatedEffort} points
                            </span>
                            <span className="text-sm text-black">
                              {progress}% complete
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {/* Category Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onTaskAdd(taskList.id, category.id)
                            }}
                            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Add Task to Category"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onCategoryEdit(taskList.id, category.name)
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Category"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Are you sure you want to delete the "${category.name}" category and all its tasks?`))
                                onCategoryDelete(taskList.id, category.name)
                            }}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Tasks */}
                  {isExpanded && categoryTasks.length > 0 && (
                    <div className="p-3 space-y-3">
                      {categoryTasks.map((task) => {
                        const isTaskExpanded = expandedTasks.has(task.id)
                        return (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            isExpanded={isTaskExpanded} 
                            onToggle={() => toggleTask(task.id)} 
                            onUpdateStatus={updateTaskStatus} 
                            getStatusColor={getStatusColor} 
                            getPriorityColor={getPriorityColor}
                            onEdit={onTaskEdit}
                            onDelete={onTaskDelete}
                            onDuplicate={onTaskDuplicate}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            // No categories - show all tasks directly
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-black">All Tasks ({tasks.length})</h4>
                <button
                  onClick={() => onCategoryAdd(taskList.id)}
                  className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Add Category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tasks.map((task) => {
                const isTaskExpanded = expandedTasks.has(task.id)
                return (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isExpanded={isTaskExpanded} 
                    onToggle={() => toggleTask(task.id)} 
                    onUpdateStatus={updateTaskStatus} 
                    getStatusColor={getStatusColor} 
                    getPriorityColor={getPriorityColor}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                    onDuplicate={onTaskDuplicate}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, isExpanded, onToggle, onUpdateStatus, getStatusColor, getPriorityColor, onEdit, onDelete, onDuplicate }: {
  task: any,
  isExpanded: boolean,
  onToggle: () => void,
  onUpdateStatus: (taskId: string, status: string) => void,
  getStatusColor: (status: string) => string,
  getPriorityColor: (priority: string) => string,
  onEdit: (taskId: string) => void,
  onDelete: (taskId: string) => void,
  onDuplicate: (taskId: string) => void
}) {
  return (
    <div className="border border-gray-100 rounded-lg">
      {/* Task Header */}
      <div className="p-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggle}
              className="text-gray-600 hover:text-black"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="cursor-pointer" onClick={() => onEdit(task?.id || '')}>
              <div className="flex items-center space-x-2">
                <span className="text-black hover:text-blue-600">{task?.title || 'Untitled Task'}</span>
                <Edit className="w-3 h-3 text-gray-400 hover:text-blue-600" />
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task?.metadata?.status || task?.status || 'Not Started')}`}>
                  {task?.metadata?.status || task?.status || 'Not Started'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task?.metadata?.priority || task?.priority || 'Medium')}`}>
                  {task?.metadata?.priority || task?.priority || 'Medium'}
                </span>
                <span className="text-sm text-black">{task?.metadata?.effort || task?.effort || 3} pts</span>
                {(task?.metadata?.assignee || task?.assignee) && (
                  <span className="text-sm text-black flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {task?.metadata?.assignee || task?.assignee}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Task Actions */}
          <div className="flex items-center space-x-2">
            <select
              value={task.metadata?.status || task.status || 'Not Started'}
              onChange={(e) => onUpdateStatus(task.id, e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 text-black"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
            
            {/* Task Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(task.id)
                }}
                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Task"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(task.id)
                }}
                className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="Duplicate Task"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this task?'))
                    onDelete(task.id)
                }}
                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
          {/* Description */}
          <div>
            <h5 className="font-medium text-black mb-2">Description</h5>
            <p className="text-black text-sm">{task.description?.objective || task.description || 'No description provided'}</p>
            {(task.description?.businessValue || task.card_data?.description?.businessValue) && (
              <p className="text-black text-sm mt-1">
                <strong>Business Value:</strong> {task.description?.businessValue || task.card_data?.description?.businessValue}
              </p>
            )}
          </div>

          {/* Acceptance Criteria */}
          {(task.acceptanceCriteria?.length > 0 || task.card_data?.acceptanceCriteria?.length > 0) && (
            <div>
              <h5 className="font-medium text-black mb-2">Acceptance Criteria</h5>
              <div className="space-y-2">
                {(task.acceptanceCriteria || task.card_data?.acceptanceCriteria || []).map((criteria: any, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className={`mt-1 w-4 h-4 ${
                      criteria.status === 'Complete' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm flex-1 ${
                      criteria.status === 'Complete' ? 'line-through text-gray-500' : 'text-black'
                    }`}>
                      {criteria.criterion || criteria}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {((task.dependencies?.blocks?.length > 0 || task.dependencies?.blockedBy?.length > 0) ||
            (task.card_data?.dependencies?.blocks?.length > 0 || task.card_data?.dependencies?.blockedBy?.length > 0)) && (
            <div>
              <h5 className="font-medium text-black mb-2">Dependencies</h5>
              {((task.dependencies?.blockedBy?.length > 0) || (task.card_data?.dependencies?.blockedBy?.length > 0)) && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-black">Blocked by:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(task.dependencies?.blockedBy || task.card_data?.dependencies?.blockedBy || []).map((depId: string) => (
                      <span key={depId} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        {depId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {((task.dependencies?.blocks?.length > 0) || (task.card_data?.dependencies?.blocks?.length > 0)) && (
                <div>
                  <span className="text-sm font-medium text-black">Blocks:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(task.dependencies?.blocks || task.card_data?.dependencies?.blocks || []).map((depId: string) => (
                      <span key={depId} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {depId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technical Implementation */}
          {((task.technicalImplementation?.filesToCreate?.length > 0) || (task.card_data?.technicalImplementation?.filesToCreate?.length > 0)) && (
            <div>
              <h5 className="font-medium text-black mb-2">Files to Create</h5>
              <ul className="list-disc list-inside text-sm text-black ml-4">
                {(task.technicalImplementation?.filesToCreate || task.card_data?.technicalImplementation?.filesToCreate || []).map((file: any, index: number) => (
                  <li key={index} className={file.status === 'Complete' ? 'line-through text-gray-500' : ''}>
                    {file.path || file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Definition of Done */}
          {((task.definitionOfDone?.length > 0) || (task.card_data?.definitionOfDone?.length > 0)) && (
            <div>
              <h5 className="font-medium text-black mb-2">Definition of Done</h5>
              <div className="space-y-1">
                {(task.definitionOfDone || task.card_data?.definitionOfDone || []).map((item: any, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 ${
                      item.status === 'Complete' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      item.status === 'Complete' ? 'line-through text-gray-500' : 'text-black'
                    }`}>
                      {item.criterion || item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRD Source */}
          {(task.trdSource || task.card_data?.trdSource) && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-xs text-black flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                From TRD: {(task.trdSource || task.card_data?.trdSource)?.trdTitle} → {(task.trdSource || task.card_data?.trdSource)?.section}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TaskList({ strategyId }: TaskListProps) {
  const { cards, refreshCards } = useCards(parseInt(strategyId))
  const [taskLists, setTaskLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTask, setEditingTask] = useState<any>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Filter for task list cards with proper error handling - check multiple possible card types
  const taskListCards = cards?.filter(card => card.cardType === 'task-list') || []
  
  // Also get individual tasks to understand the data structure
  const individualTasks = cards?.filter(card => card.cardType === 'task') || []

  // Load tasks for each task list
  useEffect(() => {
    loadTaskLists()
  }, [taskListCards.length]) // Only depend on the length, not the array itself

  const loadTaskLists = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!taskListCards || taskListCards.length === 0) {
        setTaskLists([])
        return
      }

      const taskListsWithTasks = await Promise.all(
        taskListCards.map(async (taskListCard) => {
          try {
            // Query tasks directly using card relationships or parent ID
            const { data: tasks, error } = await supabase
              .from('cards')
              .select('*')
              .eq('strategy_id', parseInt(strategyId))
              .eq('card_type', 'task')  // Use card_type since this is a direct database query
              .order('created_at', { ascending: true })

            if (error) {
              console.error('Error loading tasks for task list:', taskListCard.id, error)
              return {
                ...taskListCard,
                tasks: []
              }
            }

            // Filter tasks that belong to this task list
            // Tasks might reference the parent task list in different ways
            const taskListTasks = (tasks || []).filter(task => {
              const cardData = task.card_data || {}
              return (
                cardData.task_list_id === taskListCard.id ||
                cardData.parentTaskListId === taskListCard.id ||
                cardData.taskListId === taskListCard.id ||
                cardData.parent_id === taskListCard.id
              )
            })

            return {
              ...taskListCard,
              tasks: taskListTasks
            }
          } catch (taskError) {
            console.error('Error processing task list:', taskListCard.id, taskError)
            return {
              ...taskListCard,
              tasks: []
            }
          }
        })
      )

      setTaskLists(taskListsWithTasks)
    } catch (err) {
      console.error('Error loading task lists:', err)
      setError('Failed to load task lists')
      setTaskLists([])
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({
          card_data: {
            ...updates
          }
        })
        .eq('id', taskId)

      if (error) throw error
      await loadTaskLists()
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const handleTaskEdit = (taskId: string) => {
    // Find the task across all task lists
    const task = taskLists
      .flatMap(tl => tl.tasks)
      .find(t => t.id === taskId)
    
    if (task) {
      setEditingTask(task)
      setIsTaskModalOpen(true)
    }
  }

  const handleTaskModalSave = async (updatedTaskData: any) => {
    try {
      if (!editingTask) return
      
      const { error } = await supabase
        .from('cards')
        .update({
          title: updatedTaskData.title,
          description: updatedTaskData.description?.objective || updatedTaskData.description,
          card_data: {
            ...editingTask.card_data,
            ...updatedTaskData,
            metadata: updatedTaskData.metadata
          }
        })
        .eq('id', editingTask.id)

      if (error) throw error
      
      setIsTaskModalOpen(false)
      setEditingTask(null)
      await loadTaskLists()
    } catch (err) {
      console.error('Error saving task:', err)
      setError('Failed to save task changes')
    }
  }

  const handleTaskModalDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      
      setIsTaskModalOpen(false)
      setEditingTask(null)
      await loadTaskLists()
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  const handleTaskListEdit = (taskListId: string) => {
    // TODO: Implement task list editing
    console.log('Edit task list:', taskListId)
  }

  const handleTaskListDelete = async (taskListId: string) => {
    try {
      // Delete all tasks in the task list first
      const { error: tasksError } = await supabase
        .from('cards')
        .delete()
        .eq('strategy_id', strategyId)
        .eq('card_data->>parentTaskListId', taskListId)

      if (tasksError) throw tasksError

      // Delete the task list itself
      const { error: listError } = await supabase
        .from('cards')
        .delete()
        .eq('id', taskListId)

      if (listError) throw listError

      await loadTaskLists()
      refreshCards()
    } catch (err) {
      console.error('Error deleting task list:', err)
    }
  }

  const handleTaskListDuplicate = async (taskListId: string) => {
    // TODO: Implement task list duplication
    console.log('Duplicate task list:', taskListId)
  }

  const handleTaskAdd = (taskListId: string, categoryId?: string) => {
    // TODO: Implement add task
    console.log('Add task to list:', taskListId, 'category:', categoryId)
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      await loadTaskLists()
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  const handleTaskDuplicate = async (taskId: string) => {
    // TODO: Implement task duplication
    console.log('Duplicate task:', taskId)
  }

  const handleCategoryAdd = (taskListId: string) => {
    // TODO: Implement add category
    console.log('Add category to task list:', taskListId)
  }

  const handleCategoryEdit = (taskListId: string, categoryName: string) => {
    // TODO: Implement edit category
    console.log('Edit category:', categoryName, 'in task list:', taskListId)
  }

  const handleCategoryDelete = (taskListId: string, categoryName: string) => {
    // TODO: Implement delete category
    console.log('Delete category:', categoryName, 'from task list:', taskListId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-black">Loading task lists...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Task Lists</h2>
          <p className="text-black mt-1">Manage development tasks from Technical Requirements Documents</p>
        </div>
        <button
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center space-x-2"
          onClick={() => {
            // TODO: Navigate to add task list
            console.log('Add new task list')
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Task List</span>
        </button>
      </div>

      {/* Task Lists */}
      {taskLists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-black mb-4">
            <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-black">No Task Lists Found</h3>
            <p className="text-black">Create task lists from Technical Requirements Documents in the Development Bank.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {taskLists.map((taskList) => (
            <TaskListItem
              key={taskList.id}
              taskList={taskList}
              tasks={taskList.tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskListEdit={handleTaskListEdit}
              onTaskListDelete={handleTaskListDelete}
              onTaskListDuplicate={handleTaskListDuplicate}
              onTaskAdd={handleTaskAdd}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskDuplicate={handleTaskDuplicate}
              onCategoryAdd={handleCategoryAdd}
              onCategoryEdit={handleCategoryEdit}
              onCategoryDelete={handleCategoryDelete}
            />
          ))}
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleTaskModalSave}
        onDelete={handleTaskModalDelete}
      />
    </div>
  )
}
