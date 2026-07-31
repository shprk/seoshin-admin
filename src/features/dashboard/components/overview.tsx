import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

/* 기존 템플릿 mock 데이터 (실데이터 연동으로 비활성화)
const data = [
  {
    name: '1월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '2월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '3월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '4월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '5월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '6월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '7월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '8월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '9월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '10월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '11월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: '12월',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]
*/

type OverviewProps = {
  data: { name: string; total: number }[]
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(value) => `${value}명`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
