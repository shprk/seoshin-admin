import { Link } from '@tanstack/react-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

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
          className='-ms-1 h-auto cursor-pointer gap-2 py-1 ps-0 pe-1.5 group-data-[collapsible=icon]:ms-0 group-data-[collapsible=icon]:p-0! hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground'
        >
          <Link
            to='/'
            aria-label='대시보드로 이동'
            onClick={() => setOpenMobile(false)}
          >
            <div className='flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg group-data-[collapsible=icon]:size-8'>
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
