import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { setOpenMobile } = useSidebar()
  const team = teams[0]
  const Logo = team.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size='lg'
          className='-ms-1 h-auto gap-2 ps-0 pe-1.5 py-1 cursor-pointer hover:bg-transparent active:bg-transparent hover:text-sidebar-foreground active:text-sidebar-foreground group-data-[collapsible=icon]:ms-0 group-data-[collapsible=icon]:p-0!'
        >
          <Link
            to='/'
            aria-label='대시보드로 이동'
            onClick={() => setOpenMobile(false)}
          >
            <div className='flex shrink-0 aspect-square size-12 items-center justify-center overflow-hidden rounded-lg group-data-[collapsible=icon]:size-8'>
              <Logo className='size-12 group-data-[collapsible=icon]:size-8' />
            </div>
            <div className='grid min-w-0 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden'>
              <span className='truncate font-semibold'>{team.name}</span>
              <span className='truncate text-xs'>{team.plan}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
