import {
  LayoutDashboard,
  Monitor,
  ListTodo,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '서신',
      logo: Command,
      plan: 'seoshin',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: '일반',
      items: [
        {
          title: '대시보드',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '작업',
          url: '/tasks',
          icon: ListTodo,
        },
        // 복원 시 icon import 추가: Package, MessagesSquare
        // {
        //   title: '앱',
        //   url: '/apps',
        //   icon: Package,
        // },
        // {
        //   title: '채팅',
        //   url: '/chats',
        //   badge: '3',
        //   icon: MessagesSquare,
        // },
        {
          title: '사용자',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Clerk 보안 기능',
          icon: ClerkLogo,
          items: [
            {
              title: '로그인',
              url: '/clerk/sign-in',
            },
            {
              title: '회원가입',
              url: '/clerk/sign-up',
            },
            {
              title: '사용자 관리',
              url: '/clerk/user-management',
            },
          ],
        },
      ],
    },
    {
      title: '페이지',
      items: [
        // 복원 시 icon import 추가:
        // ShieldCheck, Bug, Lock, UserX, FileX, ServerOff, Construction
        // {
        //   title: '인증',
        //   icon: ShieldCheck,
        //   items: [
        //     {
        //       title: '로그인',
        //       url: '/sign-in',
        //     },
        //     {
        //       title: '로그인 (2단)',
        //       url: '/sign-in-2',
        //     },
        //     {
        //       title: '회원가입',
        //       url: '/sign-up',
        //     },
        //     {
        //       title: '비밀번호 찾기',
        //       url: '/forgot-password',
        //     },
        //     {
        //       title: 'OTP',
        //       url: '/otp',
        //     },
        //   ],
        // },
        // {
        //   title: '에러',
        //   icon: Bug,
        //   items: [
        //     {
        //       title: '인증 필요',
        //       url: '/errors/unauthorized',
        //       icon: Lock,
        //     },
        //     {
        //       title: '접근 금지',
        //       url: '/errors/forbidden',
        //       icon: UserX,
        //     },
        //     {
        //       title: '페이지 없음',
        //       url: '/errors/not-found',
        //       icon: FileX,
        //     },
        //     {
        //       title: '서버 오류',
        //       url: '/errors/internal-server-error',
        //       icon: ServerOff,
        //     },
        //     {
        //       title: '점검 중',
        //       url: '/errors/maintenance-error',
        //       icon: Construction,
        //     },
        //   ],
        // },
      ],
    },
    {
      title: '기타',
      items: [
        {
          title: '설정',
          icon: Settings,
          items: [
            {
              title: '프로필',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: '계정',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: '화면',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: '알림',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: '디스플레이',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: '도움말 센터',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
