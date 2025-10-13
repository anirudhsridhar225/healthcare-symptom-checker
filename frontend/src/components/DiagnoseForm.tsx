import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import MessageList from './chat/message-list'
import ChatInput from './chat/chat-input'

type ChatMessage = {
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
}

type UIMessage = {
	id: string
	role: 'user' | 'assistant'
	parts: { type: 'text'; text: string }[]
}

const sendChatMessage = async (data: { message: string, chatHistory: Array<{ role: string, content: string }> }) => {
	const response = await authClient.$fetch('http://localhost:4000/api/trpc/llm.chat?batch=1', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			0: {
				json: {
					message: data.message,
					chatHistory: data.chatHistory
				}
			}
		})
	}) as any

	return response.data[0].result.data.json
}

export const DiagnoseForm: React.FC<{
	quickPrompt?: string
	onQuickPromptUsed?: () => void
	resetKey?: number
}> = ({ quickPrompt, onQuickPromptUsed, resetKey }) => {
	const { user } = useAuth()
	const [messages, setMessages] = useState<ChatMessage[]>([])

	useEffect(() => {
		if (resetKey !== undefined) {
			setMessages([])
		}
	}, [resetKey])

	if (!user) {
		return (
			<div className="max-w-2xl mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-md">
				<p className="text-yellow-800">
					Please log in to access the health diagnosis feature.
				</p>
			</div>
		)
	}

	const mutation = useMutation({
		mutationFn: sendChatMessage,
		onSuccess: (data) => {
			setMessages(prev => [
				...prev,
				{
					role: 'assistant',
					content: data.response.text,
					timestamp: new Date()
				}
			])
		},
		onError: (err: unknown) => console.error(err)
	})

	const handleSend = (text: string) => {
		const userMessage: ChatMessage = {
			role: 'user',
			content: text,
			timestamp: new Date()
		}

		setMessages(prev => [...prev, userMessage])

		mutation.mutate({
			message: text,
			chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
		})
	}

	const uiMessages: UIMessage[] = messages.map((msg, idx) => ({
		id: `${msg.role}-${idx}`,
		role: msg.role,
		parts: [{ type: 'text', text: msg.content }]
	}))

	return (
		<div className="flex flex-col h-full max-w-4xl mx-auto">
			<div className="flex-1 overflow-y-auto p-4">
				<MessageList messages={uiMessages} />
			</div>
			<div className="border-t p-4">
				<ChatInput
					onSend={handleSend}
					disabled={mutation.isPending}
					preset={quickPrompt}
					onPresetUsed={onQuickPromptUsed}
				/>
			</div>
			{mutation.isError && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
					<p className="text-red-800">
						Error: {(mutation.error as Error).message}
					</p>
				</div>
			)}
		</div>
	)
}
