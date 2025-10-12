import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../ts-backend/src/routers/index.ts'

export const trpc = createTRPCReact<AppRouter>();
