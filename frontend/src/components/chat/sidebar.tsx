import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { endpoint } from '../../../endpoint'

type ChatItem = {
	id: string
	symptoms: string
	createdAt: string
}

type ChatsResponse = {
	data: Array<{
		result: {
			data: {
				json: ChatItem[]
			}
		}
	}>
}

const fetchChats = async (): Promise<ChatItem[]> => {
	const response = await authClient.$fetch(`${endpoint}/api/trpc/llm.getAllChats?batch=1`, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
		},
	}) as ChatsResponse

	return response.data[0].result.data.json
}

import { useNavigate } from 'react-router-dom'

export default function Sidebar({
	onNewChat,
}: {
	onNewChat: () => void
}) {
	const navigate = useNavigate()
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['chats'],
		queryFn: fetchChats,
	})

	console.log(onNewChat)

	return (
		<div className="h-full flex flex-col justify-evenly font-montserrat">
			<div className="p-8">
				<Button className="w-full cursor-pointer" onClick={() => navigate('/chats/new')}>
					New Chat
				</Button>
			</div>

			<div className="p-4 space-y-4 grow flex flex-col">
				{data && data.length > 0 && (
					<Card className="bg-sidebar/60 border-sidebar-border p-3 grow">
						<h2 className="text-sm font-semibold mb-2">Recent Chats</h2>
						<div className="space-y-1">
							{data.map((item) => (
								<Button
									key={item.id}
									className="w-full justify-start text-left h-auto py-2 rounded-lg hover:opacity-80 hover:transition-all hover:duration-300 cursor-pointer"
									aria-label={`Chat: ${item.symptoms}`}
									onClick={() => navigate(`/chats/${item.id}`)}
								>
									<span className="truncate">{item.symptoms}</span>
								</Button>
							))}
						</div>
					</Card>
				)}

				{isLoading && (
					<Card className="bg-sidebar/60 border-sidebar-border p-3">
						Loading...
					</Card>
				)}

				{isError && (
					<Card className="bg-sidebar/60 border-sidebar-border p-3">
						{(error as Error).message}
					</Card>
				)}

				<Card className="bg-sidebar/60 border-sidebar-border p-3">
					<h2 className="text-sm font-semibold mb-2">Safety</h2>
					<p className="text-sm text-sidebar-foreground/80">
						This assistant cannot diagnose or treat conditions. For severe symptoms like chest pain, trouble breathing,
						stroke symptoms, or heavy bleeding, seek emergency care immediately.
					</p>
					<Button className="mt-3" variant="default" asChild aria-label="Emergency contact">
						<a href="tel:911">Call emergency services</a>
					</Button>
				</Card>
			</div>
		</div>
	)
}
