import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { DiagnoseForm } from './DiagnoseForm'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import ChatSidebar from './chat/sidebar'

export const Dashboard: React.FC = () => {
	const { user, signOut } = useAuth()
	const [resetChat, setResetChat] = useState(0)

	const handleSignOut = async () => {
		try {
			await signOut()
		} catch (error) {
			console.error('Sign out error:', error)
		}
	}

	const handleNewChat = () => {
		setResetChat(prev => prev + 1)
	}

	return (
		<SidebarProvider defaultOpen={true}>
			<Sidebar>
				<SidebarHeader className="border-b border-sidebar-border">
					<div className="flex items-center justify-between p-2">
						<h2 className="text-lg font-semibold">Health Assistant</h2>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<ChatSidebar onNewChat={handleNewChat} />
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<header className="bg-background flex shrink-0 items-center gap-2 overflow-hidden border-b px-4">
					<SidebarTrigger />
					<div className="flex items-center justify-between flex-1">
						<h1 className="text-xl font-semibold">
							Health Diagnosis System
						</h1>
						<div className="flex items-center space-x-4">
							<span className="text-sm text-muted-foreground">
								Welcome, {user?.name}
							</span>
							<Button
								variant="outline"
								onClick={handleSignOut}
								size="sm"
							>
								Sign Out
							</Button>
						</div>
					</div>
				</header>
				<main className="flex-1 overflow-auto p-4">
					<DiagnoseForm resetKey={resetChat} />
				</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
