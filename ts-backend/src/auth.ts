import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from './db.js'
import * as schema from './schema.js'

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            queries: schema.queries,
            account: schema.account,
            verification: schema.verification,
            session: schema.session
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [
        "http://localhost:4000",
        "http://localhost:5173",
    ]
})