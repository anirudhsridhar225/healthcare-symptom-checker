import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import { queries, chats } from "../schema.js";
import { eq, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
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

	testpoint: publicProcedure
		.input(z.object({ text: z.string() }))
		.mutation(async ({ input }) => {
			const res = await callGemini(input.text)
			return { response: res }
		}),

	startChat: protectedProcedure
		.input(z.object({
			symptoms: z.string().min(10).max(1000)
		}))
		.mutation(async ({ input, ctx }) => {
			try {
				const chatId = nanoid()
				const [newChat] = await ctx.db
					.insert(chats)
					.values({
						id: chatId,
						userId: ctx.user.id,
						symptoms: input.symptoms,
					})
					.returning({ id: chats.id })
					.execute()

				if (!newChat) {
					throw new Error("Failed to create chat")
				}

				await ctx.db
					.insert(queries)
					.values({
						chatId: newChat.id,
						role: 'user',
						content: input.symptoms,
					})
					.execute()

				const response = await callGeminiChat([
					{ role: 'user', content: input.symptoms }
				])

				await ctx.db
					.insert(queries)
					.values({
						chatId: newChat.id,
						role: 'assistant',
						content: response.text
					})
					.execute()

				return {
					chat_id: newChat.id,
					response: response,
					chatHistory: [
						{ role: 'user', content: input.symptoms },
						{ role: 'assistant', content: response.text }
					]
				}
			} catch (error) {
				console.error("Error starting chat: ", error)
				throw error
			}
		}),

	chat: protectedProcedure
		.input(z.object({
			chatId: z.string(),
			query: z.string().min(10).max(1000)
		}))
		.mutation(async ({ input, ctx }) => {
			try {
				const existingChat = await ctx.db
					.select()
					.from(chats)
					.where(
						and(
							eq(chats.id, input.chatId),
							eq(chats.userId, ctx.user.id)
						)
					)
					.limit(1)
					.execute()

				if (!existingChat.length) {
					throw new Error("Chat not found or access denied")
				}

				const chatHistory = await ctx.db
					.select()
					.from(queries)
					.where(eq(queries.chatId, input.chatId))
					.orderBy(desc(queries.createdAt))
					.execute()

				await ctx.db
					.insert(queries)
					.values({
						chatId: input.chatId,
						role: 'user',
						content: input.query
					})
					.execute()

				const messages = [
					...chatHistory,
					{ role: 'user', content: input.query }
				]

				const response = await callGeminiChat(messages)

				await ctx.db
					.insert(queries)
					.values({
						chatId: input.chatId,
						role: 'assistant',
						content: response.text
					})
					.execute()

				return {
					response: response,
					chatHistory: [
						...messages,
						{ role: 'assistant', content: response.text }
					]
				}
			} catch (error) {
				console.error("Error in chat: ", error)
				throw error
			}
		}),

	getAllChats: protectedProcedure
		.query(async ({ ctx }) => {
			return await ctx.db
				.select()
				.from(chats)
				.where(eq(chats.userId, ctx.user.id))
				.orderBy(desc(chats.createdAt))
				.execute()
		}),

	getChat: protectedProcedure
		.input(z.object({
			chatId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const chat = await ctx.db
				.select()
				.from(chats)
				.where(
					and(
						eq(chats.id, input.chatId),
						eq(chats.userId, ctx.user.id),
					)
				)
				.limit(1)
				.execute()

			if (!chat || !chat.length) {
				throw new Error("Chat not found")
			}

			const messages = await ctx.db
				.select()
				.from(queries)
				.where(eq(queries.chatId, input.chatId))
				.orderBy(desc(queries.createdAt))
				.execute()

			return {
				chat: chat[0],
				messages: messages
			}
		})
})
