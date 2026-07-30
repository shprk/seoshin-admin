import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from './session-store'

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ expired: false, redirect: '/' })
  })

  it('opens once and ignores subsequent openExpired calls', () => {
    useSessionStore.getState().openExpired('/customers')
    useSessionStore.getState().openExpired('/tasks')

    expect(useSessionStore.getState().expired).toBe(true)
    expect(useSessionStore.getState().redirect).toBe('/customers')
  })

  it('closeExpired clears the flag', () => {
    useSessionStore.getState().openExpired('/customers')
    useSessionStore.getState().closeExpired()

    expect(useSessionStore.getState().expired).toBe(false)
    expect(useSessionStore.getState().redirect).toBe('/')
  })
})
