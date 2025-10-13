import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ChatInput({
	onSend,
	disabled,
	preset,
	onPresetUsed,
}: {
	onSend: (text: string) => void
	disabled?: boolean
	preset?: string
	onPresetUsed?: () => void
}) {
	const [value, setValue] = useState("")

	useEffect(() => {
		if (preset) {
			setValue(preset)
			onPresetUsed?.()
		}
	}, [preset, onPresetUsed])

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				const text = value.trim()
				if (!text) return
				onSend(text)
				setValue("")
			}}
			className="flex items-center gap-2"
		>
			<input
				className={cn(
					"flex-1 h-10 rounded-md bg-background border border-input px-3",
					"placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
				)}
				placeholder="Describe your symptoms…"
				aria-label="Message input"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				disabled={disabled}
			/>
			<Button type="submit" disabled={disabled}>
				Send
			</Button>
		</form>
	)
}
