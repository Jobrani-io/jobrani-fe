import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SignInWithGoogle from '@/components/ui/google-signin';
import OrSeparator from '@/components/ui/or-separator';
import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { user, signIn, checkIfOnboardingCompleted } = useAuth();

	// Redirect if already logged in
	useEffect(() => {
		if (user?.id) {
			(async () => {
				const isOnboardingCompleted = await checkIfOnboardingCompleted(user.id);
				if (isOnboardingCompleted) {
					navigate('/hub');
				} else {
					navigate('/hub-onboarding');
				}
			})();
		}
	}, [user, navigate]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (error) setError('');
	};

	const isFormValid = formData.email && formData.password;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isFormValid) {
			setIsLoading(true);
			setError('');

			const { error, data } = await signIn(formData.email, formData.password);

			if (error) {
				setError(error.message || 'Login failed. Please try again.');
			} else {
				const isOnboardingCompleted = await checkIfOnboardingCompleted(data.user.id);
				if (isOnboardingCompleted) {
					navigate('/hub');
				} else {
					navigate('/hub-onboarding');
				}
			}

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
							src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop&crop=center"
							alt="Job search automation dashboard"
							className="w-full h-full object-cover"
						/>
					</div>
					{/* Floating cards */}
					<div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 bg-white rounded-lg shadow-lg transform -rotate-12 flex items-center justify-center">
						<div className="text-xs font-semibold text-slate-600">📧 Auto</div>
					</div>
					<div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center">
						<div className="text-white text-sm md:text-base font-bold">AI</div>
					</div>
					<div className="absolute top-1/2 -right-6 md:-right-8 w-12 h-10 md:w-14 md:h-11 lg:w-16 lg:h-12 bg-green-500 rounded-lg shadow-lg transform rotate-12 flex items-center justify-center">
						<div className="text-white text-xs">✓ Jobs</div>
					</div>
				</div>
			</div>

			{/* Right Side - Form */}
			<div className="flex-1 md:w-1/2 lg:w-1/2 flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center lg:text-left">
						<h1 className="text-3xl font-bold text-foreground mb-2">Log in with Jobrani</h1>
					</div>

					{/* Social Login Options */}
					<div className="space-y-6">
						<SignInWithGoogle />
					</div>

					<OrSeparator />

					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Email Field */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
								Email
							</Label>
							<div className="relative">
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									className="h-12 px-4 pr-10 border border-input bg-background rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
									placeholder=""
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

						{/* Password Field */}
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-medium text-muted-foreground">
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									onChange={(e) => handleInputChange('password', e.target.value)}
									className="h-12 px-4 pr-20 border border-input bg-background rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
									placeholder=""
									required
								/>
								<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
									<div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
										<div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
										<div className="w-2 h-2 bg-muted-foreground rounded-full ml-0.5"></div>
										<div className="w-2 h-2 bg-muted-foreground rounded-full ml-0.5"></div>
									</div>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="text-muted-foreground hover:text-foreground transition-colors">
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>
						</div>

						{/* Error Alert */}
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									{error}{' '}
									<Link to="/signup" className="underline hover:no-underline font-medium">
										Sign up here
									</Link>
								</AlertDescription>
							</Alert>
						)}

						{/* Forgot Password Link */}
						<div className="text-right">
							<Link
								to="/forgot-password"
								className="text-sm text-muted-foreground hover:text-foreground underline hover:no-underline">
								Forgot password?
							</Link>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={!isFormValid || isLoading}
							className="w-full h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed">
							{isLoading ? 'Checking...' : 'Log in'}
						</Button>

						{/* Legal Text */}
						<div className="text-center text-xs text-muted-foreground/60">
							By continuing, you agree to our{' '}
							<Link to="/terms" className="hover:underline">
								Terms
							</Link>{' '}
							and{' '}
							<Link to="/privacy" className="hover:underline">
								Privacy Policy
							</Link>
							<br />
							<span className="mt-1 inline-block">
								This site is protected by reCAPTCHA and the Google Privacy Policy and Terms
								of Service apply.
							</span>
						</div>

						{/* Signup Link */}
						<div className="text-center text-sm">
							Don't have an account?{' '}
							<Link
								to="/signup"
								className="text-foreground underline hover:no-underline font-semibold">
								Sign up here
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
