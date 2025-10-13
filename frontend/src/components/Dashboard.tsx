import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { DiagnoseForm } from './DiagnoseForm'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import ChatSidebar from './chat/sidebar'
import { useNavigate } from 'react-router-dom'

export const Dashboard: React.FC = () => {
	const { user, signOut } = useAuth()
	const navigate = useNavigate()

	const handleSignOut = async () => {
		try {
			await signOut()
		} catch (error) {
			console.error('Sign out error:', error)
		}
	}

	const handleNewChat = () => {
		navigate('/chats/new')
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
				<header className="bg-background flex shrink-0 items-center gap-2 overflow-hidden border-b p-4">
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
								className='cursor-pointer'
							>
								Sign Out
							</Button>
						</div>
					</div>
				</header>
				<main className="flex-1 overflow-auto p-4">
					<DiagnoseForm />
				</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
