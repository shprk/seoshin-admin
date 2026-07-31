import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Scan, UserPlus, Users } from 'lucide-react'
import { getCustomers } from '@/lib/api/customers'
import { getTasks } from '@/lib/api/tasks'
import { letterFieldLabels, letterFields } from '@/lib/letter-fields'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
// import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataIssueList } from './components/data-issue-list'
import { Overview } from './components/overview'
import { RecentScans } from './components/recent-scans'
import { SimpleBarList } from './components/simple-bar-list'
import { StatCard } from './components/stat-card'
import {
  buildMonthlyRegistrations,
  countNewCustomers,
  findDataIssues,
  getRecentScans,
  summarizeCustomers,
  toPercent,
} from './data/stats'

export function Dashboard() {
  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })
  const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: getTasks })

  const customers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data]
  )
  const scans = useMemo(() => tasksQuery.data?.items ?? [], [tasksQuery.data])

  const summary = useMemo(() => summarizeCustomers(customers), [customers])
  const monthlyRegistrations = useMemo(
    () => buildMonthlyRegistrations(customers),
    [customers]
  )
  const recentScans = useMemo(() => getRecentScans(scans), [scans])
  const newCustomers = useMemo(() => countNewCustomers(customers), [customers])
  const dataIssues = useMemo(
    () => findDataIssues(customers, scans),
    [customers, scans]
  )

  const isLoading = customersQuery.isLoading || tasksQuery.isLoading
  const error = customersQuery.error ?? tasksQuery.error

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        {/* <TopNav links={topNav} className='me-auto' /> */}
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>대시보드</h1>
          <p className='text-muted-foreground'>
            고객 등록과 편지 진행 현황을 한눈에 확인합니다.
          </p>
        </div>

        {isLoading ? (
          <div className='text-sm text-muted-foreground'>불러오는 중...</div>
        ) : error ? (
          <div className='text-sm text-destructive'>
            {error instanceof Error
              ? error.message
              : '대시보드 데이터를 불러오지 못했습니다.'}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                title='총 고객 수'
                value={`${summary.total}명`}
                description='등록된 전체 고객'
                icon={Users}
              />
              {/* 매칭 완료 카드 (필요 시 되살릴 것, 아이콘 import: ContactRound)
              <StatCard
                title='매칭 완료'
                value={`${summary.matched}명`}
                description={`전체의 ${toPercent(summary.matched, summary.total)}%`}
                icon={ContactRound}
              />
              */}
              <StatCard
                title='편지 3통 완료'
                value={`${summary.allLettersDone}명`}
                description={`전체의 ${toPercent(summary.allLettersDone, summary.total)}%`}
                icon={Mail}
              />
              <StatCard
                title='이번 달 신규 고객'
                value={`${newCustomers.thisMonth}명`}
                description={`지난달 대비 ${newCustomers.diff >= 0 ? '+' : ''}${newCustomers.diff}명`}
                icon={UserPlus}
              />
              <StatCard
                title='총 스캔 기록'
                value={`${scans.length}건`}
                description='바코드로 등록된 기록'
                icon={Scan}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>월별 고객 등록</CardTitle>
                  <CardDescription>최근 12개월 등록 추이</CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview data={monthlyRegistrations} />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>최근 스캔 기록</CardTitle>
                  <CardDescription>
                    가장 최근에 등록된 {recentScans.length}건입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentScans scans={recentScans} />
                </CardContent>
              </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>편지 진행 현황</CardTitle>
                  <CardDescription>편지별 도착 완료 고객 수</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarList
                    items={letterFields.map((field) => ({
                      name: letterFieldLabels[field],
                      value: summary.letterCounts[field],
                    }))}
                    barClass='bg-primary'
                    valueFormatter={(n) =>
                      `${n}명 (${toPercent(n, summary.total)}%)`
                    }
                  />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>연령대 분포</CardTitle>
                  <CardDescription>등록된 고객의 연령대</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.ageGroupCounts.length > 0 ? (
                    <SimpleBarList
                      items={summary.ageGroupCounts}
                      barClass='bg-muted-foreground'
                      valueFormatter={(n) => `${n}명`}
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      표시할 고객이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>확인이 필요한 항목</CardTitle>
                <CardDescription>
                  편지 발송이나 매칭에 문제가 될 수 있는 데이터입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataIssueList issues={dataIssues} />
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}

/* ────────────────────────────────────────────────────────────────
   아래는 shadcn-admin 템플릿의 기존 mock 대시보드입니다.
   실데이터 연동으로 비활성화했으며, 필요 시 참고용으로 남겨둡니다.
   복원하려면 아래 import도 함께 되살려야 합니다.
     import { Button } from '@/components/ui/button'
     import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
     import { TopNav } from '@/components/layout/top-nav'
     import { Analytics } from './components/analytics'
     import { RecentSales } from './components/recent-sales'
   ────────────────────────────────────────────────────────────────

const topNav = [
  {
    title: '개요',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: '고객',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: '상품',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: '설정',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]

<div className='mb-2 flex items-center justify-between space-y-2'>
  <h1 className='text-2xl font-bold tracking-tight'>대시보드</h1>
  <div className='flex items-center space-x-2'>
    <Button>다운로드</Button>
  </div>
</div>
<Tabs orientation='vertical' defaultValue='overview' className='space-y-4'>
  <div className='w-full overflow-x-auto pb-2'>
    <TabsList>
      <TabsTrigger value='overview'>개요</TabsTrigger>
      <TabsTrigger value='analytics'>분석</TabsTrigger>
      <TabsTrigger value='reports' disabled>
        보고서
      </TabsTrigger>
      <TabsTrigger value='notifications' disabled>
        알림
      </TabsTrigger>
    </TabsList>
  </div>
  <TabsContent value='overview' className='space-y-4'>
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>총 매출</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='h-4 w-4 text-muted-foreground'
          >
            <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>$45,231.89</div>
          <p className='text-xs text-muted-foreground'>지난달 대비 +20.1%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>구독 수</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='h-4 w-4 text-muted-foreground'
          >
            <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>+2350</div>
          <p className='text-xs text-muted-foreground'>지난달 대비 +180.1%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>판매 건수</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='h-4 w-4 text-muted-foreground'
          >
            <rect width='20' height='14' x='2' y='5' rx='2' />
            <path d='M2 10h20' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>+12,234</div>
          <p className='text-xs text-muted-foreground'>지난달 대비 +19%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>현재 활성 사용자</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='h-4 w-4 text-muted-foreground'
          >
            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>+573</div>
          <p className='text-xs text-muted-foreground'>지난 1시간 대비 +201</p>
        </CardContent>
      </Card>
    </div>
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
      <Card className='col-span-1 lg:col-span-4'>
        <CardHeader>
          <CardTitle>개요</CardTitle>
        </CardHeader>
        <CardContent className='ps-2'>
          <Overview />
        </CardContent>
      </Card>
      <Card className='col-span-1 lg:col-span-3'>
        <CardHeader>
          <CardTitle>최근 판매</CardTitle>
          <CardDescription>
            이번 달에 265건의 판매가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentSales />
        </CardContent>
      </Card>
    </div>
  </TabsContent>
  <TabsContent value='analytics' className='space-y-4'>
    <Analytics />
  </TabsContent>
</Tabs>
*/
