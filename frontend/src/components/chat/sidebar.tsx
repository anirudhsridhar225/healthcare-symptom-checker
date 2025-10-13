import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

type HistoryItem = {
	id: number
	userId: string
	symptoms: string
	createdAt: string
}

type HistoryResponse = {
	data: Array<{
		result: {
			data: {
				json: {
					records: Array<HistoryItem>
				}
			}
		}
	}>
}

const fetchHistory = async (): Promise<HistoryItem[]> => {
	const response = await authClient.$fetch('http://localhost:4000/api/trpc/user.history?batch=1', {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
		},
	}) as HistoryResponse

	return response.data[0].result.data.json.records
}

export default function Sidebar({
	onNewChat,
}: {
	onNewChat: () => void
}) {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['chatHistory'],
		queryFn: fetchHistory,
	})

	return (
		<div className="flex-1 flex flex-col">
			<div className="p-4 border-b border-sidebar-border">
				<Button className="w-full" onClick={onNewChat}>
					New Chat
				</Button>
			</div>

			<div className="p-4 space-y-4 overflow-y-auto">
				{data && data.length > 0 && (
					<Card className="bg-sidebar/60 border-sidebar-border p-3">
						<h2 className="text-sm font-semibold mb-2">Recent Chats</h2>
						<div className="space-y-1">
							{data.map((item) => (
								<Button
									key={item.id}
									variant="ghost"
									className="w-full justify-start text-left h-auto py-2"
									aria-label={`Chat: ${item.symptoms}`}
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
