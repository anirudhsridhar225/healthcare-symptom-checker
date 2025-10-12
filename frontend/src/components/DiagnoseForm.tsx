import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/contexts/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

type ChatMessage = {
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
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

export const DiagnoseForm: React.FC = () => {
	const { user } = useAuth()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [inputMessage, setInputMessage] = useState('')

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
			// Update messages with the AI response
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!inputMessage.trim()) return

		// Add user message to chat
		const userMessage: ChatMessage = {
			role: 'user',
			content: inputMessage,
			timestamp: new Date()
		}

		setMessages(prev => [...prev, userMessage])

		// Send to API
		mutation.mutate({
			message: inputMessage,
			chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
		})

		setInputMessage('')
	}

	return (
		<div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Health Assistant Chat
				</h2>
				<p className="text-gray-600">
					Chat with our AI health assistant about your symptoms and health concerns.
				</p>
			</div>

			{/* Chat Messages */}
			<div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
				{messages.length === 0 ? (
					<div className="text-center text-gray-500 mt-8">
						<p>Start a conversation by describing your symptoms or asking a health question.</p>
					</div>
				) : (
					messages.map((message, index) => (
						<div
							key={index}
							className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
						>
							<div
								className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
										? 'bg-blue-600 text-white'
										: 'bg-white text-gray-800 border'
									}`}
							>
								<div className="whitespace-pre-wrap">{message.content}</div>
								<div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
									}`}>
									{message.timestamp.toLocaleTimeString()}
								</div>
							</div>
						</div>
					))
				)}
				{mutation.isPending && (
					<div className="flex justify-start">
						<div className="bg-white text-gray-800 border p-3 rounded-lg">
							<div className="flex items-center space-x-2">
								<div className="animate-pulse">Thinking...</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Input Form */}
			<form onSubmit={handleSubmit} className="flex space-x-2">
				<Input
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					placeholder="Type your message or describe your symptoms..."
					disabled={mutation.isPending}
					className="flex-1"
				/>
				<Button
					type="submit"
					disabled={mutation.isPending || !inputMessage.trim()}
				>
					{mutation.isPending ? 'Sending...' : 'Send'}
				</Button>
			</form>

			{mutation.isError && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4 mt-2">
					<p className="text-red-800">
						Error: {(mutation.error as Error).message}
					</p>
				</div>
			)}
		</div>
	)
}
