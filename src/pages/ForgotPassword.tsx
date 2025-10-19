import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setIsLoading(true);
		setError('');
		setMessage('');

		try {
			console.log('Sending password reset email to:', email);
			const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`
			});

			console.log('Password reset response:', { data, error });

			if (error) {
				console.error('Password reset error:', error);
				setError(error.message);
			} else {
				console.log('Password reset email sent successfully');
				setMessage('Check your email for a password reset link');
				setIsSuccess(true);
			}
		} catch (err) {
			console.error('Unexpected error during password reset:', err);
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex relative">
			{/* Logo */}
			<div className="absolute top-6 left-6 z-10">
				<Link to="/" className="flex items-center">
					<img
						src="/lovable-uploads/842cbe3a-c994-426d-a877-1d4a7bdf2ea8.png"
						alt="Jobrani"
						className="h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer"
					/>
				</Link>
			</div>

			{/* Left Side - Illustration */}
			<div className="hidden md:flex md:w-1/2 lg:w-1/2 bg-gradient-to-br from-slate-100 to-slate-200 items-center justify-center p-6 lg:p-12">
				<div className="relative">
					{/* Main illustration */}
					<div className="w-64 h-64 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-1 transition-transform duration-500">
						<img
							src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop&crop=center"
							alt="Reset password security"
							className="w-full h-full object-cover"
						/>
					</div>
					{/* Floating cards */}
					<div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 bg-white rounded-lg shadow-lg transform -rotate-12 flex items-center justify-center">
						<div className="text-xs font-semibold text-slate-600">🔒 Safe</div>
					</div>
					<div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center">
						<div className="text-white text-sm md:text-base font-bold">📧</div>
					</div>
					<div className="absolute top-1/2 -right-6 md:-right-8 w-12 h-10 md:w-14 md:h-11 lg:w-16 lg:h-12 bg-green-500 rounded-lg shadow-lg transform rotate-12 flex items-center justify-center">
						<div className="text-white text-xs">✓ Reset</div>
					</div>
				</div>
			</div>

			{/* Right Side - Form */}
			<div className="flex-1 md:w-1/2 lg:w-1/2 flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center lg:text-left">
						<Link
							to="/login"
							className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to login
						</Link>
						<h1 className="text-3xl font-bold text-foreground mb-2">Reset your password</h1>
						<p className="text-muted-foreground">
							Enter your email address and we'll send you a link to reset your password.
						</p>
					</div>

					{!isSuccess ? (
						<form className="space-y-6" onSubmit={handleSubmit}>
							{/* Email Field */}
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-muted-foreground">
									Email address
								</Label>
								<div className="relative">
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="h-12 px-4 pr-10 border border-input bg-background rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
										placeholder="Enter your email"
										required
									/>
									<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
										<div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
											<div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
											<div className="w-2 h-2 bg-muted-foreground rounded-full ml-0.5"></div>
											<div className="w-2 h-2 bg-muted-foreground rounded-full ml-0.5"></div>
										</div>
									</div>
								</div>
							</div>

							{/* Error Alert */}
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={!email || isLoading}
								className="w-full h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed">
								{isLoading ? 'Sending...' : 'Send reset link'}
							</Button>

							{/* Login Link */}
							<div className="text-center text-sm">
								Remember your password?{' '}
								<Link
									to="/login"
									className="text-foreground underline hover:no-underline font-semibold">
									Log in here
								</Link>
							</div>
						</form>
					) : (
						<div className="space-y-6">
							{/* Success Message */}
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription className="text-sm">{message}</AlertDescription>
							</Alert>

							<div className="space-y-4">
								<p className="text-sm text-muted-foreground">
									We've sent a password reset link to <strong>{email}</strong>
								</p>
								<p className="text-sm text-muted-foreground">
									Check your email and click the link to reset your password. If you don't
									see the email, check your spam folder.
								</p>
							</div>

							<div className="space-y-3">
								<Button
									onClick={() => {
										setIsSuccess(false);
										setEmail('');
										setMessage('');
									}}
									variant="outline"
									className="w-full">
									Send another email
								</Button>
								<div className="text-center">
									<Link
										to="/login"
										className="text-sm text-foreground underline hover:no-underline font-semibold">
										Back to login
									</Link>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
