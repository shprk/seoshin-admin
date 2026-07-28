import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  CheckCircle,
  AlertCircle,
  Timer,
  HelpCircle,
  CircleOff,
} from 'lucide-react'

export const labels = [
  {
    value: 'bug',
    label: '버그',
  },
  {
    value: 'feature',
    label: '기능',
  },
  {
    value: 'documentation',
    label: '문서',
  },
]

export const statuses = [
  {
    label: '백로그',
    value: 'backlog' as const,
    icon: HelpCircle,
  },
  {
    label: '할 일',
    value: 'todo' as const,
    icon: Circle,
  },
  {
    label: '진행 중',
    value: 'in progress' as const,
    icon: Timer,
  },
  {
    label: '완료',
    value: 'done' as const,
    icon: CheckCircle,
  },
  {
    label: '취소됨',
    value: 'canceled' as const,
    icon: CircleOff,
  },
]

export const priorities = [
  {
    label: '낮음',
    value: 'low' as const,
    icon: ArrowDown,
  },
  {
    label: '보통',
    value: 'medium' as const,
    icon: ArrowRight,
  },
  {
    label: '높음',
    value: 'high' as const,
    icon: ArrowUp,
  },
  {
    label: '긴급',
    value: 'critical' as const,
    icon: AlertCircle,
  },
]
