import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { getTasks } from '@/lib/api/tasks'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScanWorksTable } from './components/scan-works-table'

const route = getRouteApi('/_authenticated/tasks/')

export function Tasks() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>스캔 기록</h2>
            <p className='text-muted-foreground'>
              바코드 스캔으로 등록된 기록입니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='text-sm text-muted-foreground'>불러오는 중...</div>
        ) : isError ? (
          <div className='text-sm text-destructive'>
            {error instanceof Error
              ? error.message
              : '작업 목록을 불러오지 못했습니다.'}
          </div>
        ) : (
          <ScanWorksTable
            data={data?.items ?? []}
            search={search}
            navigate={navigate}
            onDeleted={() => {
              void refetch()
            }}
          />
        )}
      </Main>
    </>
  )
}
