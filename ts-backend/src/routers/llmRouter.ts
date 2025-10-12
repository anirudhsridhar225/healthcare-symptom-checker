import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import { queries, chats } from "../schema.js";
import { eq, and } from 'drizzle-orm'
import "dotenv/config"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

const PROMPT = "You are an educational medical assistant. Based on the given symptoms, list possible conditions that I might have and which condition I am most probably afflicted by. List the next steps I should take for the same. Add a disclaimer with all that in mind."


async function callGemini(prompt: string) {
	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: `${PROMPT}\n\nSymptoms: ${prompt}\n\n`,
	})

	console.log(response)
	const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"
	return { text }
}

async function callGeminiChat(messages: Array<{ role: string, content: string }>) {
	let conversationText = PROMPT + "\n\nConversation:\n\n"

	messages.forEach(msg => {
		if (msg.role === 'user') {
			conversationText += `User: ${msg.content}\n\n`
		} else {
			conversationText += `Assistant: ${msg.content}\n\n`
		}
	})

	conversationText += "Assistant: "

	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: conversationText,
	})

	console.log(response)
	const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"
	return { text }
}

export const llmRouter = router({
	health: publicProcedure.query(() => ({ status: "ok" })),

	diagnose: protectedProcedure
		.input(z.object({ symptoms: z.string().min(10).max(1000) }))
		.mutation(async ({ input, ctx }) => {
			const res = await callGemini(input.symptoms)
			await ctx.db
				.insert(queries)
				.values({
					userId: (ctx.user.id),
					symptoms: input.symptoms,
				})
				.execute()

			return { response: res }
		}),

	testpoint: publicProcedure
		.input(z.object({ text: z.string() }))
		.mutation(async ({ input }) => {
			const res = await callGemini(input.text)
			return { response: res }
		}),

	chat: protectedProcedure
		.input(z.object({
			message: z.string().min(1).max(2000),
			chatHistory: z.array(z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string()
			})).optional().default([])
		}))
		.mutation(async ({ input, ctx }) => {
			try {
				const messages = [
					...input.chatHistory,
					{ role: 'user', content: input.message }
				]

				const res = await callGeminiChat(messages)

				const existingQuery = await ctx.db
					.select()
					.from(queries)
					.where(
						and(
							eq(queries.userId, ctx.user.id),
							eq(queries.symptoms, input.message)
						)
					)
					.limit(1)
					.execute()

				let queryId: number;

				if (existingQuery.length > 0 && existingQuery[0]) {
					queryId = existingQuery[0].id;
				} else {
					const [newQuery] = await ctx.db
						.insert(queries)
						.values({
							userId: ctx.user.id,
							symptoms: input.message
						})
						.returning({ id: queries.id })
						.execute()

					if (!newQuery) {
						throw new Error("Failed to create new query record.");
					}

					queryId = newQuery.id;
				}

				const allMessages = [
					...messages,
					{ role: 'assistant' as const, content: res.text }
				]

				await ctx.db
					.insert(chats)
					.values(
						allMessages.map(msg => ({
							queryId: queryId,
							role: msg.role as 'user' | 'assistant',
							content: msg.content
						}))
					)
					.execute()

				return {
					response: res,
					chatHistory: allMessages
				}
			} catch (error) {
				console.error("Error in chat mutation:", error);
				throw error;
			}
	})
})
