-- Fix task_category constraint to allow 'harvest'
-- Run this script to fix the constraint

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_task_category_valid;

ALTER TABLE tasks ADD CONSTRAINT tasks_task_category_valid CHECK (
    task_category IS NULL OR task_category IN (
        'planting',
        'maintenance',
        'watering',
        'nutrition',
        'pest_disease',
        'harvesting',
        'harvest',
        'preparation',
        'observation'
    )
);