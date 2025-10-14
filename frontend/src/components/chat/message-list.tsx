import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"

export default function MessageList({ messages }: { messages?: UIMessage[] }) {
	if (!messages?.length)
		return (
			<p className="text-sm text-muted-foreground">
				Describe your symptoms, when they started, and anything that makes them better or worse.
			</p>
		)

	return (
		<div className="flex flex-col space-y-6 px-2">
			{messages.map((message) => {
				const text = message.parts
					.filter((p) => p.type === "text")
					.map((p) => p.text)
					.join("\n")

				const isUser = message.role === "user"

				return (
					<div
						key={message.id}
						className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm prose prose-sm dark:prose-invert text-start
                ${isUser
									? "bg-blue-500 text-white prose-p:my-1 prose-headings:text-white prose-strong:text-white font-semibold tracking-wider text-lg"
									: "bg-neutral-100 text-neutral-900 border border-neutral-200 prose-p:my-1 tracking-wide font-medium"}`}
						>
							<ReactMarkdown
								components={{
									p: ({ children }) => <p className="my-1 py-2">{children}</p>,
									ul: ({ children }) => <ul className="list-disc pl-4 my-1 py-2">{children}</ul>,
									ol: ({ children }) => <ol className="list-decimal pl-4 my-1 py-2">{children}</ol>,
									code: ({ children }) => (
										<code className="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">
											{children}
										</code>
									),
								}}
							>
								{text}
							</ReactMarkdown>
						</div>
					</div>
				)
			})}
		</div>
	)
}
