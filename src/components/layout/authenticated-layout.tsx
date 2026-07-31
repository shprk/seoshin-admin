import { useQuery } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getMe } from '@/lib/api/auth'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

/**
 * The access token survives a reload via cookie but the user object does not,
 * so it is fetched back. A rejected token surfaces as a 401 here, which the
 * api client turns into the session-expired dialog.
 */
function useRestoreUser() {
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const hasUser = useAuthStore((state) => state.auth.user !== null)

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await getMe()
      useAuthStore.getState().auth.setUser(user)
      return user
    },
    enabled: Boolean(accessToken) && !hasUser,
    staleTime: Infinity,
    retry: false,
  })
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  useRestoreUser()

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
