import { createAuthClient } from 'better-auth/react'
import { endpoint } from '../../endpoint'

export const authClient = createAuthClient({
	baseURL: `${endpoint}/api/auth`
})
