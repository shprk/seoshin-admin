import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { getCustomers } from '@/lib/api/customers'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CustomersTable } from './components/customers-table'

const route = getRouteApi('/_authenticated/customers/')

export function Customers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
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
            <h2 className='text-2xl font-bold tracking-tight'>고객 목록</h2>
            <p className='text-muted-foreground'>
              등록된 고객을 조회하고 관리합니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='text-sm text-muted-foreground'>불러오는 중...</div>
        ) : isError ? (
          <div className='text-sm text-destructive'>
            {error instanceof Error
              ? error.message
              : '고객 목록을 불러오지 못했습니다.'}
          </div>
        ) : (
          <CustomersTable
            data={data?.items ?? []}
            search={search}
            navigate={navigate}
            onCustomerUpdated={() => {
              void refetch()
            }}
          />
        )}
      </Main>
    </>
  )
}
