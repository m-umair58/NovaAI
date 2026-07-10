export interface ExtractionSummary {
  id: string
  transcript_preview: string
  meeting_date: string | null
  task_count: number
  created_at: string
}

export interface ExtractionDetail extends ExtractionSummary {
  transcript: string
  action_items: Array<{
    id: string
    task: string
    owner: string
    due_date: string | null
    due_date_text: string
    priority: string
    warnings: string[]
  }>
}

export interface ExtractionListResponse {
  extractions: ExtractionSummary[]
  count: number
}
