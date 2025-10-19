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
import { toast } from '@/hooks/use-toast';

export default function Signup() {
	const navigate = useNavigate();
	const [step, setStep] = useState<'initial' | 'password'>('initial');
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { user, signUp, checkIfOnboardingCompleted } = useAuth();

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
		if (error) setError('');
	};

	const handleEmailSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.email && formData.email.includes('@')) {
			setStep('password');
			setError('');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) return;

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long');
			return;
		}

		setIsLoading(true);
		setError('');

		await signUp(formData.email, formData.password);

		setIsLoading(false);

		toast({
			title: 'Account created successfully',
			description: 'Please check your email for a confirmation link to complete your signup.'
		});
		navigate('/login');
	};

	const isFormValid =
		step === 'password'
			? formData.email && formData.password && formData.confirmPassword
			: formData.email;

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			{/* Logo */}
			<div className="absolute top-6 left-6">
				<Link to="/" className="flex items-center">
					<img
						src="/lovable-uploads/842cbe3a-c994-426d-a877-1d4a7bdf2ea8.png"
						alt="Jobrani"
						className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
					/>
				</Link>
			</div>

			{/* Centered signup form */}
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-foreground">Sign up in seconds</h1>
					<p className="text-lg text-muted-foreground">
						Get started with your first automated outreach today
					</p>
				</div>

				{/* Social Login Options */}
				<div className="space-y-6">
					<SignInWithGoogle label="Sign up with Google" />
				</div>

				<OrSeparator />

				{/* Progressive Form */}
				{step === 'initial' ? (
					<form className="space-y-6" onSubmit={handleEmailSubmit}>
						{/* Email Field */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								className="h-12 px-4 text-base"
								placeholder="name@company.com"
								required
								autoFocus
							/>
						</div>

						<Button
							type="submit"
							disabled={!formData.email || !formData.email.includes('@')}
							className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
							Continue
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

						{/* Login Link */}
						<div className="text-center text-sm">
							Already have an account?{' '}
							<Link
								to="/login"
								className="text-foreground underline hover:no-underline font-semibold">
								Sign in here
							</Link>
						</div>
					</form>
				) : (
					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Email Display */}
						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">Email</Label>
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
								<span className="text-sm">{formData.email}</span>
								<button
									type="button"
									onClick={() => setStep('initial')}
									className="text-sm text-primary hover:underline">
									Edit
								</button>
							</div>
						</div>

						{/* Password Fields */}
						<div className="space-y-4">
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
										className="h-12 px-4 pr-12 text-base"
										placeholder="Create a password"
										required
										autoFocus
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-medium text-muted-foreground">
									Confirm Password
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
										className="h-12 px-4 pr-12 text-base"
										placeholder="Confirm your password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
										{showConfirmPassword ? (
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
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button
							type="submit"
							disabled={!isFormValid || isLoading}
							className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
							{isLoading ? 'Creating Account...' : 'Create Account'}
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

						{/* Login Link */}
						<div className="text-center text-sm">
							Already have an account?{' '}
							<Link
								to="/login"
								className="text-foreground underline hover:no-underline font-semibold">
								Sign in here
							</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
