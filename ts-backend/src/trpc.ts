import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { auth } from "./auth.js"
import { db } from './db.js'

export async function createContext(opts: {
    req: any
    res: any
}) {
    const session = await auth.api.getSession({ headers: opts.req.headers })

    return {
        req: opts.req,
        res: opts.res,
        db,
        session,
        userId: session?.user?.id ?? null,
        user: session?.user ?? null,
    }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error}) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause && "flatten" in error.cause
                    ? (error.cause as any).flatten()
                    : null,
            },
        }
    },
})

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
        ctx: {
            user: ctx.user
        }
    })
})

export const router = t.router