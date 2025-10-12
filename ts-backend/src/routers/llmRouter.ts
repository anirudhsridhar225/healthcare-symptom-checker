import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import { queries } from "../schema.js";
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
					diagnosis: JSON.stringify(res)
				})
				.execute()

			return { response: res }
		}),

	testpoint: publicProcedure
		.input(z.object({ text: z.string() }))
		.mutation(async ({ input }) => {
			const res = await callGemini(input.text)
			return { response: res }
		})
})
