import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SignIn } from '@/components/auth/SignIn'
import { SignUp } from '@/components/auth/SignUp'
import { Dashboard } from '@/components/Dashboard'
import './App.css'

const queryClient = new QueryClient()

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Router>
					<Routes>
						<Route path="/" element={<Navigate to="/chats/new" replace />} />
						<Route path="/signin" element={<SignIn />} />
						<Route path="/signup" element={<SignUp />} />
						<Route
							path="/dashboard"
							element={<Navigate to="/chats/new" replace />}
						/>
						<Route
							path="/chats/new"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/chats/:chatId"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</Router>
			</AuthProvider>
		</QueryClientProvider>
	)
}

export default App
