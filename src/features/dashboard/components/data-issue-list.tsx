import { type DataIssue } from '../data/stats'

const PREVIEW_LIMIT = 3

type DataIssueListProps = {
  issues: DataIssue[]
}

export function DataIssueList({ issues }: DataIssueListProps) {
  const visibleIssues = issues.filter((issue) => issue.count > 0)

  if (visibleIssues.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        확인이 필요한 항목이 없습니다.
      </p>
    )
  }

  return (
    <ul className='divide-y'>
      {visibleIssues.map((issue) => {
        const preview = issue.participantNos.slice(0, PREVIEW_LIMIT)
        const rest = issue.count - preview.length

        return (
          <li
            key={issue.label}
            className='flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0'
          >
            <div className='min-w-0'>
              <p className='text-sm font-medium'>{issue.label}</p>
              <p className='truncate text-xs text-muted-foreground'>
                {preview.join(', ')}
                {rest > 0 ? ` 외 ${rest}건` : ''}
              </p>
            </div>
            <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums'>
              {issue.count}건
            </span>
          </li>
        )
      })}
    </ul>
  )
}
