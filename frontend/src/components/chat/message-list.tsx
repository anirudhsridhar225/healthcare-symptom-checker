"use client"

import type { UIMessage } from "ai"

export default function MessageList({
	messages,
}: {
	messages: UIMessage[] | undefined
}) {
	if (!messages?.length) {
		return (
			<div className="text-sm text-muted-foreground">
				Describe your symptoms, when they started, and anything that makes them better or worse.
			</div>
		)
	}

	return (
		<div className="">
			{messages.map((message) => (
				<div key={message.id} className={message.role === "user" ? "text-right" : "text-left"}>
					<div
						className={[
							"inline-block rounded-lg px-3 py-2 text-sm border",
							message.role === "user"
								? "bg-primary text-primary-foreground border-primary"
								: "bg-blue-400 text-foreground border-border",
						].join(" ")}
					>
						{/* Render parts (text only for this UI) */}
						{message.parts.map((part, i) => {
							if (part.type === "text") {
								return <span key={i}>{part.text}</span>
							}
							return null
						})}
					</div>
				</div>
			))}
		</div>
	)
}
