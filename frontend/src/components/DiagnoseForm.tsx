import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import MessageList from './chat/message-list'
import ChatInput from './chat/chat-input'
import { useNavigate, useParams } from 'react-router-dom'
import { endpoint } from '../../endpoint'

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

type MutationInput = {
	text: string
	chatId?: string | null
}

type StartChatResponse = {
	chat_id: string
	response: { text: string }
	chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

type ChatResponse = {
	response: { text: string }
	chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

const sendMessage = async (data: MutationInput): Promise<{ kind: 'start' | 'chat'; payload: StartChatResponse | ChatResponse }> => {
	if (!data.chatId) {
		const response = await authClient.$fetch(`${endpoint}/api/trpc/llm.startChat?batch=1`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				0: {
					json: { symptoms: data.text }
				}
			})
		}) as any
		const json = response.data[0].result.data.json as StartChatResponse
		return { kind: 'start', payload: json }
	}
	const response = await authClient.$fetch(`${endpoint}/api/trpc/llm.chat?batch=1`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			0: {
				json: { chatId: data.chatId, query: data.text }
			}
		})
	}) as any
	const json = response.data[0].result.data.json as ChatResponse
	return { kind: 'chat', payload: json }
}

export const DiagnoseForm: React.FC<{
	quickPrompt?: string
	onQuickPromptUsed?: () => void
}> = ({ quickPrompt, onQuickPromptUsed }) => {
	const { user } = useAuth()
	const navigate = useNavigate()
	const params = useParams()
	const routeChatId = params.chatId === 'new' ? null : (params.chatId ?? null)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [chatId, setChatId] = useState<string | null>(routeChatId)
	const queryClient = useQueryClient()

	useEffect(() => {
		let cancelled = false
		async function load() {
			if (routeChatId) {
				try {
					const response = await authClient.$fetch(
						`${endpoint}/api/trpc/llm.getChat?batch=1&input=${encodeURIComponent(
							JSON.stringify({ 0: { json: { chatId: routeChatId } } })
						)}`,
						{
							method: 'GET',
							headers: { 'content-type': 'application/json' },
						}
					) as any

					const json = response.data[0].result.data.json as { chat: any, messages: Array<{ role: 'user' | 'assistant'; content: string; createdAt?: string; created_at?: string }> }

					const ordered = [...json.messages].reverse()

					if (!cancelled) {
						setChatId(routeChatId)
						setMessages(ordered.map((m, idx) => ({
							role: m.role,
							content: m.content,
							timestamp: new Date((m as any).createdAt ?? (m as any).created_at ?? Date.now())
						})))
					}

				} catch (e) {
					console.error('Failed to load chat', e)
				}
			} else {
				setChatId(null)
				setMessages([])
			}
		}
		load()
		return () => { cancelled = true }
	}, [routeChatId])

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
		mutationFn: sendMessage,
		onSuccess: (data) => {
			if (data.kind === 'start') {
				const payload = data.payload as StartChatResponse
				setChatId(payload.chat_id)
				navigate(`/chats/${payload.chat_id}`, { replace: true })
				setMessages(prev => ([
					...prev,
					{ role: 'assistant', content: payload.response.text, timestamp: new Date() }
				]))

				queryClient.invalidateQueries({ queryKey: ['chats'] })
			} else {
				const payload = data.payload as ChatResponse
				setMessages(prev => ([
					...prev,
					{ role: 'assistant', content: payload.response.text, timestamp: new Date() }
				]))
			}
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
		mutation.mutate({ text, chatId })
	}

	const uiMessages: UIMessage[] = messages.map((msg, idx) => ({
		id: `${msg.role}-${idx}`,
		role: msg.role,
		parts: [{ type: 'text', text: msg.content }]
	}))

	return (
		<div className="flex flex-col h-full overflow-y-auto max-w-4xl mx-auto">
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
