export type TaskPriority = 'High' | 'Medium' | 'Low' | 'Not specified'

export interface ExtractedTask {
  id: string
  task: string
  owner: string
  due_date: string
  due_date_text: string
  priority: TaskPriority
  warnings: string[]
}
