import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../../ts-backend/src/routers/index.ts'
import { authClient } from './auth-client'

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/api/trpc',
      async headers() {
        // Get the current session to retrieve the session token
        const session = await authClient.getSession()
        
        if (!session.data?.session) {
          return {}
        }

        return {
          'Cookie': `better-auth.session_token=${session.data.session.token}`,
        }
      },
    }),
  ],
})
