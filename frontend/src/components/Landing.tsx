import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
	return (
		<div className="min-h-screen flex flex-col bg-white">
			<header className="border-b">
				<nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<span className="text-xl font-semibold tracking-tight">Healthcare Symptom Checker</span>
					</Link>
					<div className="flex items-center gap-3">
						<Link to="/signin">
							<Button size="sm">Sign in</Button>
						</Link>
					</div>
				</nav>
			</header>

			<main className="flex-1">
				<section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
					<div className="grid gap-8 md:gap-10 text-center">
						<h1 className="text-3xl md:text-5xl font-bold tracking-tight">
							Healthcare Symptom Checker
						</h1>
						<p className="text-base md:text-lg text-gray-600 mx-auto max-w-2xl">
							Your simple way to understand symptoms and get next‑step guidance in minutes.
						</p>
						<div className="flex justify-center gap-3">
							<Link to="/signin">
								<Button>Get started</Button>
							</Link>
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-5xl px-4 pb-20">
					<div className="grid gap-6">
						<h2 className="text-xl font-semibold text-gray-900 text-center">How it works</h2>
						<ol className="grid gap-4 md:grid-cols-3">
							<li className="rounded-lg border-1 border-black/60 p-4 text-left">
								<p className="text-sm font-medium text-gray-900">1. Sign in</p>
								<p className="text-sm text-gray-600 mt-1">Create an account or sign in to start a private chat.</p>
							</li>
							<li className="rounded-lg border-1 border-black/60 p-4 text-left">
								<p className="text-sm font-medium text-gray-900">2. Describe symptoms</p>
								<p className="text-sm text-gray-600 mt-1">Tell the assistant what you're experiencing in your own words.</p>
							</li>
							<li className="rounded-lg border-1 border-black/60 p-4 text-left">
								<p className="text-sm font-medium text-gray-900">3. Review guidance</p>
								<p className="text-sm text-gray-600 mt-1">Get possible causes and recommended next steps with a clear disclaimer.</p>
							</li>
						</ol>
						<p className="text-xs text-gray-500 text-center">
							This tool provides educational information and is not a substitute for professional medical advice.
						</p>
					</div>
				</section>
			</main>
		</div>
	);
}
