import { z } from 'zod'
import { auth } from '../auth.js'
import { publicProcedure, router } from "../trpc.js"

export const authRouter = router({
	health: publicProcedure.query(() => ({ status: "ok" })),

	signUp: publicProcedure
		.input(z.object({ name: z.string(), email: z.email(), password: z.string().min(8).max(128) }))
		.mutation(async ({ input }) => {
			const user = await auth.api.signUpEmail({
				body: {
					name: input.name,
					email: input.email,
					password: input.password,
				}
			})

			return { user }
		}),

	signIn: publicProcedure
		.input(z.object({ email: z.email(), password: z.string().min(8).max(128) }))
		.mutation(async ({ input }) => {
			const session = await auth.api.signInEmail({
				body: {
					email: input.email,
					password: input.password,
				}
			})

			return { session }
		}),

	me: publicProcedure
		.query(({ ctx }) => {
			return { user: ctx.user || null }
		})
})  
