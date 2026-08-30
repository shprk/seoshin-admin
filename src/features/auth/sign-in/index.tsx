// import { Link } from '@tanstack/react-router'
import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            관리자 로그인
          </CardTitle>
          <CardDescription>
            관리자 아이디와 비밀번호를 입력해주세요.
            {/* 복원 시 주석 해제
            {' '}
            계정이 없으신가요?{' '}
            <Link
              to='/sign-up'
              className='text-nowrap underline underline-offset-4 hover:text-primary'
            >
              회원가입
            </Link>
            */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        {/* 복원 시 주석 해제
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </p>
        </CardFooter>
        */}
      </Card>
    </AuthLayout>
  )
}
