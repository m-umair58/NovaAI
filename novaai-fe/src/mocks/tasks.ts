import type { ExtractedTask } from '@/types/task'

function mockTask(
  task: Omit<ExtractedTask, 'due_date_text' | 'priority' | 'warnings'> &
    Partial<Pick<ExtractedTask, 'due_date_text' | 'priority' | 'warnings'>>,
): ExtractedTask {
  return {
    due_date_text: task.due_date,
    priority: 'Not specified',
    warnings: [],
    ...task,
  }
}

export const mockExtractionResults: ExtractedTask[][] = [
  [
    mockTask({
      id: 'ext-1-1',
      task: 'Write landing page copy and send it to marketing',
      owner: 'Clara',
      due_date: 'Wednesday, March 12th',
      priority: 'Medium',
    }),
    mockTask({
      id: 'ext-1-2',
      task: 'Integrate the newsletter signup form on the website',
      owner: 'Ben',
      due_date: 'Thursday, March 13th',
      priority: 'High',
    }),
    mockTask({
      id: 'ext-1-3',
      task: 'Schedule the announcement email with the CRM team',
      owner: 'Anna',
      due_date: 'Friday, March 14th',
    }),
    mockTask({
      id: 'ext-1-4',
      task: 'Review final newsletter copy before launch',
      owner: 'Unassigned',
      due_date: 'Friday, March 14th',
      warnings: [
        'Conflicting owners mentioned: Anna and Clara. Final ownership was not clearly confirmed.',
      ],
    }),
  ],
  [
    mockTask({
      id: 'ext-2-1',
      task: 'Ping finance for sandbox credentials',
      owner: 'Rachel',
      due_date: 'Today',
      priority: 'High',
    }),
    mockTask({
      id: 'ext-2-2',
      task: 'Mock up new mobile onboarding screens',
      owner: 'Lisa',
      due_date: 'No date given',
    }),
    mockTask({
      id: 'ext-2-3',
      task: 'Draft updated privacy policy for push notifications',
      owner: 'Lisa',
      due_date: 'Early next week',
    }),
    mockTask({
      id: 'ext-2-4',
      task: 'Fix stale data on the analytics dashboard',
      owner: 'Mark',
      due_date: 'No date given',
    }),
    mockTask({
      id: 'ext-2-5',
      task: 'Coordinate QA regression testing for checkout flow',
      owner: 'Tom',
      due_date: 'No date given',
    }),
    mockTask({
      id: 'ext-2-6',
      task: 'Complete payments API refactor',
      owner: 'Tom',
      due_date: 'In two days',
      priority: 'High',
    }),
  ],
  [
    mockTask({
      id: 'ext-3-1',
      task: 'Fix Okta token refresh edge case before client demo',
      owner: 'Priya',
      due_date: 'End of day Monday',
      priority: 'High',
    }),
    mockTask({
      id: 'ext-3-2',
      task: 'Merge SSO branch after token fix',
      owner: 'Priya',
      due_date: 'Tonight',
      warnings: [
        'Conflicting due dates mentioned: Tonight and End of day Monday. No final deadline was clearly confirmed.',
      ],
    }),
    mockTask({
      id: 'ext-3-3',
      task: 'Run load tests on staging environment',
      owner: 'Marcus',
      due_date: 'No date given',
    }),
    mockTask({
      id: 'ext-3-4',
      task: 'Rewrite outdated onboarding documentation',
      owner: 'Nina',
      due_date: 'No date given',
    }),
    mockTask({
      id: 'ext-3-5',
      task: 'Record onboarding walkthrough video',
      owner: 'Marcus',
      due_date: 'Early next week',
    }),
    mockTask({
      id: 'ext-3-6',
      task: 'Reconcile billing migration numbers for finance',
      owner: 'Priya',
      due_date: 'Next Friday',
    }),
    mockTask({
      id: 'ext-3-7',
      task: 'Respond to security review questionnaire',
      owner: 'James',
      due_date: 'Tonight',
      priority: 'Medium',
    }),
    mockTask({
      id: 'ext-3-8',
      task: 'Document rollback plan in the production runbook',
      owner: 'Priya',
      due_date: 'Before the sprint ends',
    }),
  ],
]
