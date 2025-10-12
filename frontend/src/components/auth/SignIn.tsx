import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export const SignIn: React.FC = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const { signIn } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			await signIn(email, password)
			navigate('/dashboard')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Access the health diagnosis system
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								className="mt-1"
							/>
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center">
							{error}
						</div>
					)}

					<Button
						type="submit"
						disabled={loading}
						className="w-full"
					>
						{loading ? 'Signing In...' : 'Sign In'}
					</Button>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{' '}
							<button
								type="button"
								onClick={() => navigate('/signup')}
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								Sign up
							</button>
						</p>
					</div>
				</form>
			</div>
		</div>
	)
}
