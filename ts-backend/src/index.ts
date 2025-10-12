import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { toNodeHandler } from 'better-auth/node'
import { createContext } from './trpc.js'
import { appRouter } from './routers/index.js'
import { auth } from './auth.js'
import morgan from 'morgan'

const app = express()

app.use(morgan('combined'))
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(
	"/api/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext: ({ req, res }) => createContext({ req, res }),
	}),
)

const port = process.env.PORT || 4000
app.listen(port, () => {
	console.log("Server listening on", port)
})
