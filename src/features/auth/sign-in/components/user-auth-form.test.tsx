import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: '이메일을 입력해주세요.',
  passwordEmpty: '비밀번호를 입력해주세요.',
  passwordShort: '비밀번호는 최소 7자 이상이어야 합니다.',
} as const

const navigate = vi.fn()
const setUserMock = vi.fn()
const setAccessTokenMock = vi.fn()
const loginMock = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setUser: setUserMock,
      setAccessToken: setAccessTokenMock,
    },
  }),
}))

vi.mock('@/lib/api/auth', () => ({
  login: (...args: unknown[]) => loginMock(...args),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

describe('UserAuthForm', () => {
  describe('Rendering without redirectTo', () => {
    let screen: RenderResult
    let emailInput: Locator
    let passwordInput: Locator
    let signInButton: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      loginMock.mockResolvedValue({
        accessToken: 'mock-access-token',
        user: {
          accountNo: 'ACC001',
          email: 'a@b.com',
          role: ['admin'],
          exp: Date.now() + 24 * 60 * 60 * 1000,
        },
      })
      screen = await render(<UserAuthForm />)
      emailInput = screen.getByRole('textbox', { name: /^이메일$/i })
      passwordInput = screen.getByLabelText(/^비밀번호$/i)
      signInButton = screen.getByRole('button', { name: /^로그인$/i })
    })

    it('renders fields and submit button', async () => {
      await expect.element(emailInput).toBeInTheDocument()
      await expect.element(passwordInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
    })

    it('shows validation messages when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(FORM_MESSAGES.emailEmpty))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
        .toBeInTheDocument()
    })

    it('authenticates and navigates to default route on success', async () => {
      await userEvent.fill(emailInput, 'a@b.com')
      await userEvent.fill(passwordInput, '1234567')

      await userEvent.click(signInButton)

      await vi.waitFor(() => expect(loginMock).toHaveBeenCalledOnce())
      expect(loginMock).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: '1234567',
      })

      await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
      expect(setUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          accountNo: expect.any(String),
          role: expect.any(Array),
          exp: expect.any(Number),
        })
      )
      expect(setAccessTokenMock).toHaveBeenCalledOnce()
      expect(setAccessTokenMock).toHaveBeenCalledWith('mock-access-token')

      await vi.waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
      )
    })
  })

  it('navigates to redirectTo when provided', async () => {
    vi.clearAllMocks()
    loginMock.mockResolvedValue({
      accessToken: 'mock-access-token',
      user: {
        accountNo: 'ACC001',
        email: 'a@b.com',
        role: ['admin'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      },
    })

    const { getByRole, getByLabelText } = await render(
      <UserAuthForm redirectTo='/settings' />
    )

    await userEvent.fill(getByRole('textbox', { name: /이메일/i }), 'a@b.com')
    await userEvent.fill(getByLabelText('비밀번호'), '1234567')

    await userEvent.click(getByRole('button', { name: /로그인/i }))

    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
    expect(setAccessTokenMock).toHaveBeenCalledOnce()

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })
})
