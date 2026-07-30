import { useNavigate } from '@tanstack/react-router'
import { useSessionStore } from '@/stores/session-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function SessionExpiredDialog() {
  const navigate = useNavigate()
  const expired = useSessionStore((s) => s.expired)

  const goToSignIn = () => {
    const state = useSessionStore.getState()
    if (!state.expired) return
    const redirectTo = state.redirect
    state.closeExpired()
    navigate({
      to: '/sign-in',
      search: { redirect: redirectTo },
      replace: true,
    })
  }

  return (
    <AlertDialog
      open={expired}
      onOpenChange={(open) => {
        if (!open) goToSignIn()
      }}
    >
      <AlertDialogContent className='sm:max-w-sm'>
        <AlertDialogHeader className='text-start'>
          <AlertDialogTitle>세션이 만료되었습니다</AlertDialogTitle>
          <AlertDialogDescription>
            다시 로그인해 주세요. 로그인 후 이전 페이지로 돌아갑니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={goToSignIn}>로그인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
