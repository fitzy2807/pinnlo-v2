-- Migration: Task List System Enhancements
-- Created: 2025-07-11  
-- Purpose: Add task list specific optimizations and constraints

-- Add task list specific card types to the check constraint
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check;
ALTER TABLE cards ADD CONSTRAINT cards_card_type_check 
  CHECK (card_type ~ '^[a-z-]+$' AND card_type IN (
    -- Existing types
    'strategic-context', 'vision', 'value-proposition', 'personas', 'customer-journey', 
    'swot-analysis', 'competitive-analysis', 'okrs', 'business-model', 'go-to-market',
    'risk-assessment', 'roadmap', 'kpis', 'financial-projections', 'feature',
    'technical-requirement-structured',
    -- Task system types
    'task-list', 'task'
  ));

-- Create indexes for task list queries
CREATE INDEX IF NOT EXISTS idx_cards_task_list_type ON cards(card_type) 
  WHERE card_type IN ('task-list', 'task');

CREATE INDEX IF NOT EXISTS idx_cards_task_list_id ON cards((card_data->>'task_list_id')) 
  WHERE card_type = 'task' AND card_data->>'task_list_id' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cards_task_category ON cards((card_data->>'category_id')) 
  WHERE card_type = 'task' AND card_data->>'category_id' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cards_task_status ON cards((card_data->>'status')) 
  WHERE card_type = 'task' AND card_data->>'status' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cards_task_priority ON cards((card_data->>'priority')) 
  WHERE card_type = 'task' AND card_data->>'priority' IS NOT NULL;

-- Create a function to validate task list hierarchy
CREATE OR REPLACE FUNCTION validate_task_list_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that task cards reference valid task lists
  IF NEW.card_type = 'task' AND NEW.card_data->>'task_list_id' IS NOT NULL THEN
    -- Check if referenced task list exists
    IF NOT EXISTS (
      SELECT 1 FROM cards 
      WHERE id = (NEW.card_data->>'task_list_id')::uuid 
      AND card_type = 'task-list'
      AND strategy_id = NEW.strategy_id
    ) THEN
      RAISE EXCEPTION 'Referenced task_list_id does not exist or belongs to different strategy';
    END IF;
  END IF;

  -- Validate task list metadata structure
  IF NEW.card_type = 'task-list' THEN
    -- Ensure required metadata fields exist
    IF NEW.card_data->'metadata' IS NULL THEN
      RAISE EXCEPTION 'Task list must have metadata object';
    END IF;
    
    IF NEW.card_data->'metadata'->>'name' IS NULL THEN
      RAISE EXCEPTION 'Task list metadata must have name field';
    END IF;
    
    IF NEW.card_data->'categories' IS NULL OR jsonb_array_length(NEW.card_data->'categories') = 0 THEN
      RAISE EXCEPTION 'Task list must have at least one category';
    END IF;
  END IF;

  -- Validate task structure
  IF NEW.card_type = 'task' THEN
    -- Ensure required task fields exist
    IF NEW.card_data->'metadata' IS NULL THEN
      RAISE EXCEPTION 'Task must have metadata object';
    END IF;
    
    IF NEW.card_data->'metadata'->>'taskId' IS NULL THEN
      RAISE EXCEPTION 'Task metadata must have taskId field';
    END IF;
    
    IF NEW.card_data->>'status' IS NULL THEN
      RAISE EXCEPTION 'Task must have status field';
    END IF;
    
    -- Validate status values
    IF NEW.card_data->>'status' NOT IN ('not-started', 'in-progress', 'completed', 'blocked') THEN
      RAISE EXCEPTION 'Invalid task status. Must be one of: not-started, in-progress, completed, blocked';
    END IF;
    
    -- Validate priority values
    IF NEW.card_data->>'priority' IS NOT NULL AND 
       NEW.card_data->>'priority' NOT IN ('low', 'medium', 'high', 'critical') THEN
      RAISE EXCEPTION 'Invalid task priority. Must be one of: low, medium, high, critical';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task list validation
DROP TRIGGER IF EXISTS validate_task_list_hierarchy_trigger ON cards;
CREATE TRIGGER validate_task_list_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON cards
  FOR EACH ROW
  WHEN (NEW.card_type IN ('task-list', 'task'))
  EXECUTE FUNCTION validate_task_list_hierarchy();

-- Create a function to calculate task list progress
CREATE OR REPLACE FUNCTION calculate_task_list_progress(task_list_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_tasks INTEGER;
  completed_tasks INTEGER;
  in_progress_tasks INTEGER;
  blocked_tasks INTEGER;
  total_effort INTEGER;
  completed_effort INTEGER;
BEGIN
  -- Count tasks by status
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE card_data->>'status' = 'completed') as completed,
    COUNT(*) FILTER (WHERE card_data->>'status' = 'in-progress') as in_progress,
    COUNT(*) FILTER (WHERE card_data->>'status' = 'blocked') as blocked,
    COALESCE(SUM((card_data->>'effortPoints')::integer), 0) as total_effort_points,
    COALESCE(SUM(CASE WHEN card_data->>'status' = 'completed' 
                      THEN (card_data->>'effortPoints')::integer 
                      ELSE 0 END), 0) as completed_effort_points
  INTO total_tasks, completed_tasks, in_progress_tasks, blocked_tasks, total_effort, completed_effort
  FROM cards 
  WHERE card_type = 'task' 
  AND card_data->>'task_list_id' = task_list_id::text;

  -- Build result JSON
  result := jsonb_build_object(
    'totalTasks', total_tasks,
    'completedTasks', completed_tasks,
    'inProgressTasks', in_progress_tasks,
    'blockedTasks', blocked_tasks,
    'notStartedTasks', total_tasks - completed_tasks - in_progress_tasks - blocked_tasks,
    'totalEffortPoints', total_effort,
    'completedEffortPoints', completed_effort,
    'progressPercentage', CASE WHEN total_tasks > 0 
                               THEN ROUND((completed_tasks::numeric / total_tasks::numeric) * 100, 2)
                               ELSE 0 
                          END,
    'effortProgressPercentage', CASE WHEN total_effort > 0 
                                     THEN ROUND((completed_effort::numeric / total_effort::numeric) * 100, 2)
                                     ELSE 0 
                                END,
    'updatedAt', NOW()
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update task list progress automatically
CREATE OR REPLACE FUNCTION update_task_list_progress()
RETURNS TRIGGER AS $$
DECLARE
  task_list_uuid UUID;
  progress_data JSONB;
BEGIN
  -- Only process task cards that have a task_list_id
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.card_type = 'task' THEN
    task_list_uuid := (NEW.card_data->>'task_list_id')::UUID;
  ELSIF TG_OP = 'DELETE' AND OLD.card_type = 'task' THEN
    task_list_uuid := (OLD.card_data->>'task_list_id')::UUID;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Skip if no task list reference
  IF task_list_uuid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate new progress
  progress_data := calculate_task_list_progress(task_list_uuid);

  -- Update the task list card with new progress
  UPDATE cards 
  SET 
    card_data = jsonb_set(
      jsonb_set(card_data, '{metadata,progress}', progress_data->'progressPercentage'),
      '{metadata,progressData}', progress_data
    ),
    updated_at = NOW()
  WHERE id = task_list_uuid AND card_type = 'task-list';

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update task list progress
DROP TRIGGER IF EXISTS update_task_list_progress_trigger ON cards;
CREATE TRIGGER update_task_list_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cards
  FOR EACH ROW
  WHEN (
    (TG_OP = 'INSERT' AND NEW.card_type = 'task') OR
    (TG_OP = 'UPDATE' AND NEW.card_type = 'task' AND 
     (OLD.card_data->>'status' IS DISTINCT FROM NEW.card_data->>'status' OR
      OLD.card_data->>'effortPoints' IS DISTINCT FROM NEW.card_data->>'effortPoints')) OR
    (TG_OP = 'DELETE' AND OLD.card_type = 'task')
  )
  EXECUTE FUNCTION update_task_list_progress();

-- Create a view for task list summaries
CREATE OR REPLACE VIEW task_list_summaries AS
SELECT 
  tl.id,
  tl.strategy_id,
  tl.title,
  tl.description,
  tl.created_at,
  tl.updated_at,
  tl.card_data->'metadata'->>'name' as name,
  tl.card_data->'metadata'->>'status' as status,
  tl.card_data->'metadata'->>'priority' as priority,
  tl.card_data->'metadata'->>'owner' as owner,
  (tl.card_data->'metadata'->>'totalTasks')::integer as total_tasks,
  (tl.card_data->'metadata'->>'totalEffortPoints')::integer as total_effort_points,
  (tl.card_data->'metadata'->>'progress')::numeric as progress_percentage,
  jsonb_array_length(tl.card_data->'categories') as category_count,
  COUNT(t.id) as actual_task_count,
  COUNT(t.id) FILTER (WHERE t.card_data->>'status' = 'completed') as completed_task_count,
  COUNT(t.id) FILTER (WHERE t.card_data->>'status' = 'in-progress') as in_progress_task_count,
  COUNT(t.id) FILTER (WHERE t.card_data->>'status' = 'blocked') as blocked_task_count
FROM cards tl
LEFT JOIN cards t ON t.card_type = 'task' AND t.card_data->>'task_list_id' = tl.id::text
WHERE tl.card_type = 'task-list'
GROUP BY tl.id, tl.strategy_id, tl.title, tl.description, tl.created_at, tl.updated_at, tl.card_data;

-- Create a view for task details with list context
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id,
  t.strategy_id,
  t.title,
  t.description,
  t.created_at,
  t.updated_at,
  t.card_data->'metadata'->>'taskId' as task_id,
  t.card_data->'metadata'->>'title' as task_title,
  t.card_data->>'status' as status,
  t.card_data->>'priority' as priority,
  t.card_data->>'assignee' as assignee,
  (t.card_data->>'effortPoints')::integer as effort_points,
  t.card_data->>'category_id' as category_id,
  (t.card_data->>'task_list_id')::uuid as task_list_id,
  tl.title as task_list_title,
  tl.card_data->'metadata'->>'name' as task_list_name,
  t.card_data->'description'->>'objective' as objective,
  t.card_data->'description'->>'businessValue' as business_value,
  jsonb_array_length(t.card_data->'acceptanceCriteria') as acceptance_criteria_count,
  t.card_data->'trdSource'->>'trdName' as source_trd_name,
  t.card_data->'trdSource'->>'section' as source_trd_section
FROM cards t
LEFT JOIN cards tl ON tl.id = (t.card_data->>'task_list_id')::uuid AND tl.card_type = 'task-list'
WHERE t.card_type = 'task';

-- Grant permissions on views
GRANT SELECT ON task_list_summaries TO authenticated;
GRANT SELECT ON task_details TO authenticated;

-- Add RLS policies for the views
ALTER VIEW task_list_summaries SET (security_invoker = on);
ALTER VIEW task_details SET (security_invoker = on);

-- Create helpful functions for API usage
CREATE OR REPLACE FUNCTION get_task_list_with_tasks(p_task_list_id UUID)
RETURNS JSONB AS $$
DECLARE
  task_list JSONB;
  tasks JSONB;
BEGIN
  -- Get task list data
  SELECT to_jsonb(c.*) INTO task_list
  FROM cards c
  WHERE c.id = p_task_list_id AND c.card_type = 'task-list';

  IF task_list IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get associated tasks
  SELECT jsonb_agg(to_jsonb(c.*) ORDER BY c.card_data->'metadata'->>'taskId') INTO tasks
  FROM cards c
  WHERE c.card_type = 'task' 
  AND c.card_data->>'task_list_id' = p_task_list_id::text;

  -- Combine data
  RETURN jsonb_set(task_list, '{tasks}', COALESCE(tasks, '[]'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all task lists for a strategy
CREATE OR REPLACE FUNCTION get_strategy_task_lists(p_strategy_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_set(
        to_jsonb(tls.*),
        '{taskCount}', 
        to_jsonb(tls.actual_task_count)
      )
      ORDER BY tls.created_at DESC
    )
    FROM task_list_summaries tls
    WHERE tls.strategy_id = p_strategy_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_task_list_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_list_with_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_strategy_task_lists(UUID) TO authenticated;

-- Comment on key components
COMMENT ON TABLE cards IS 'Universal card table supporting task lists and tasks among other card types';
COMMENT ON FUNCTION validate_task_list_hierarchy IS 'Ensures task list and task cards maintain proper hierarchical relationships and required fields';
COMMENT ON FUNCTION update_task_list_progress IS 'Automatically updates task list progress when tasks are created, updated, or deleted';
COMMENT ON VIEW task_list_summaries IS 'Provides aggregated view of task lists with progress metrics';
COMMENT ON VIEW task_details IS 'Provides detailed task information with parent task list context';
COMMENT ON FUNCTION get_task_list_with_tasks IS 'Returns complete task list with all associated tasks in a single query';
COMMENT ON FUNCTION get_strategy_task_lists IS 'Returns all task lists for a strategy with summary information';
