import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: ''
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	// Check for access token in URL parameters
	useEffect(() => {
		const accessToken = searchParams.get('access_token');
		const refreshToken = searchParams.get('refresh_token');

		if (!accessToken || !refreshToken) {
			setError('Invalid or expired reset link. Please request a new password reset.');
		}
	}, [searchParams]);

	// Redirect if already logged in
	useEffect(() => {
		if (user && isSuccess) {
			navigate('/hub');
		}
	}, [user, isSuccess, navigate]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (error) setError('');
	};

	const isFormValid =
		formData.password &&
		formData.confirmPassword &&
		formData.password === formData.confirmPassword &&
		formData.password.length >= 6;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

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

		try {
			const { error } = await supabase.auth.updateUser({
				password: formData.password
			});

			if (error) {
				setError(error.message);
			} else {
				setIsSuccess(true);
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const accessToken = searchParams.get('access_token');

	if (!accessToken) {
		return (
			<div className="min-h-screen flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-foreground mb-4">Invalid Reset Link</h1>
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								This password reset link is invalid or has expired. Please request a new
								one.
							</AlertDescription>
						</Alert>
						<div className="mt-6">
							<Link
								to="/forgot-password"
								className="text-primary underline hover:no-underline font-semibold">
								Request new password reset
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

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
							src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&crop=center"
							alt="New password setup"
							className="w-full h-full object-cover"
						/>
					</div>
					{/* Floating cards */}
					<div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 bg-white rounded-lg shadow-lg transform -rotate-12 flex items-center justify-center">
						<div className="text-xs font-semibold text-slate-600">🔐 New</div>
					</div>
					<div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center">
						<div className="text-white text-sm md:text-base font-bold">🔑</div>
					</div>
					<div className="absolute top-1/2 -right-6 md:-right-8 w-12 h-10 md:w-14 md:h-11 lg:w-16 lg:h-12 bg-green-500 rounded-lg shadow-lg transform rotate-12 flex items-center justify-center">
						<div className="text-white text-xs">✓ Secure</div>
					</div>
				</div>
			</div>

			{/* Right Side - Form */}
			<div className="flex-1 md:w-1/2 lg:w-1/2 flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-8">
					{!isSuccess ? (
						<>
							<div className="text-center lg:text-left">
								<h1 className="text-3xl font-bold text-foreground mb-2">
									Set new password
								</h1>
								<p className="text-muted-foreground">
									Choose a strong password to secure your account.
								</p>
							</div>

							<form className="space-y-6" onSubmit={handleSubmit}>
								{/* New Password Field */}
								<div className="space-y-2">
									<Label
										htmlFor="password"
										className="text-sm font-medium text-muted-foreground">
										New Password
									</Label>
									<div className="relative">
										<Input
											id="password"
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={(e) => handleInputChange('password', e.target.value)}
											className="h-12 px-4 pr-20 border border-input bg-background rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
											placeholder="Enter new password"
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
									<p className="text-xs text-muted-foreground">
										Must be at least 6 characters long
									</p>
								</div>

								{/* Confirm Password Field */}
								<div className="space-y-2">
									<Label
										htmlFor="confirmPassword"
										className="text-sm font-medium text-muted-foreground">
										Confirm New Password
									</Label>
									<div className="relative">
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={formData.confirmPassword}
											onChange={(e) =>
												handleInputChange('confirmPassword', e.target.value)
											}
											className="h-12 px-4 pr-20 border border-input bg-background rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
											placeholder="Confirm new password"
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
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												className="text-muted-foreground hover:text-foreground transition-colors">
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

								{/* Submit Button */}
								<Button
									type="submit"
									disabled={!isFormValid || isLoading}
									className="w-full h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed">
									{isLoading ? 'Updating...' : 'Update password'}
								</Button>
							</form>
						</>
					) : (
						<div className="space-y-6">
							<div className="text-center lg:text-left">
								<h1 className="text-3xl font-bold text-foreground mb-2">
									Password updated!
								</h1>
							</div>

							{/* Success Message */}
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									Your password has been successfully updated. You can now log in with your
									new password.
								</AlertDescription>
							</Alert>

							<div className="space-y-3">
								<Button
									onClick={() => navigate('/login')}
									className="w-full h-12 text-base font-medium">
									Continue to login
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
