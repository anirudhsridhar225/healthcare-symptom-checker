import 'dotenv/config'
import { eq, desc } from 'drizzle-orm'
import { router, protectedProcedure, publicProcedure } from '../trpc.js'
import { user, queries, chats } from '../schema.js'

export const userRouter = router({
	health: publicProcedure.query(() => ({ status: "ok" })),

	history: protectedProcedure
		.query(async ({ ctx }) => {
			const recs = await ctx.db
				.select()
				.from(chats)
				.where(eq(chats.userId, ctx.user.id))
				.orderBy(desc(queries.createdAt))

			return { records: recs }
		}),

	users: publicProcedure
		.query(async ({ ctx }) => {
			const recs = await ctx.db
				.select()
				.from(user)
				.orderBy(desc(user.createdAt))

			return { users: recs }
		})
})
