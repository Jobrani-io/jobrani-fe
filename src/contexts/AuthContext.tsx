import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signUp: (email: string, password: string) => Promise<{ error: any; data: User }>;
	signIn: (email: string, password: string) => Promise<{ error: any; data: { user: User } }>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<{ error: any }>;
	updatePassword: (password: string) => Promise<{ error: any }>;
	checkIfOnboardingCompleted: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [signingOut, setSigningOut] = useState(false);

	useEffect(() => {
		let mounted = true;

		// Set up auth state listener
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (!mounted) return;

			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);

			// Handle sign out event
			if (event === 'SIGNED_OUT') {
				// Redirect to home page after logout
				window.location.href = '/';
			}

			// Defer Supabase calls to prevent deadlocks
			if (session && event === 'SIGNED_IN') {
				setTimeout(() => {
					supabase.auth.refreshSession();
				}, 0);
			}
		});

		// Initialize auth state
		const initializeAuth = async () => {
			try {
				const {
					data: { session },
					error
				} = await supabase.auth.getSession();

				if (!mounted) return;

				if (session && !error) {
					setSession(session);
					setUser(session.user);
				} else {
					// Clear any invalid session data from localStorage
					if (error) {
						console.log('Clearing invalid session from localStorage');
						localStorage.removeItem('sb-jyikafbhvtwvrwuatuaq-auth-token');
						localStorage.removeItem('sb-jyikafbhvtwvrwuatuaq-auth-refresh-token');
					}
					setSession(null);
					setUser(null);
				}
			} catch (error) {
				console.error('Auth initialization error:', error);
				setSession(null);
				setUser(null);
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		initializeAuth();

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);

	const signUp = async (email: string, password: string) => {
		console.log('Starting signup for:', email);
		const redirectUrl = `${window.location.origin}/login`;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: redirectUrl
			}
		});

		console.log('Signup response:', { data, error });

		if (error) {
			console.error('Signup error:', error);
			toast({
				variant: 'destructive',
				title: 'Signup failed',
				description: error.message
			});
		} else {
			console.log('Signup successful:', data);
			toast({
				title: 'Check your email',
				description: "We've sent you a confirmation link"
			});
		}

		return { error, data: data?.user || null };
	};

	const signIn = async (email: string, password: string) => {
		const { error, data } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			toast({
				variant: 'destructive',
				title: 'Login failed',
				description: error.message
			});
		}

		return { error, data };
	};

	const signOut = async () => {
		if (signingOut) return; // Prevent multiple logout attempts

		try {
			setSigningOut(true);
			const { error } = await supabase.auth.signOut();

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Logout failed',
					description: error.message
				});
			} else {
				const isTourCompleted = localStorage.getItem('jobrani-guided-tour-completed');
				localStorage.clear();
				if (isTourCompleted) {
					// we don't have to complete the tour again
					localStorage.setItem('jobrani-guided-tour-completed', 'true');
				}
				toast({
					title: 'Signed out',
					description: 'You have been successfully signed out'
				});
			}
		} catch (error) {
			console.error('Logout error:', error);
			toast({
				variant: 'destructive',
				title: 'Logout failed',
				description: 'An unexpected error occurred'
			});
		} finally {
			setSigningOut(false);
		}
	};

	const resetPassword = async (email: string) => {
		console.log('AuthContext: Sending password reset email to:', email);
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`
		});

		console.log('AuthContext: Password reset response:', { data, error });

		if (error) {
			console.error('AuthContext: Password reset error:', error);
			toast({
				variant: 'destructive',
				title: 'Reset failed',
				description: error.message
			});
		} else {
			console.log('AuthContext: Password reset email sent successfully');
			toast({
				title: 'Check your email',
				description: "We've sent you a password reset link"
			});
		}

		return { error };
	};

	const updatePassword = async (password: string) => {
		const { error } = await supabase.auth.updateUser({
			password: password
		});

		if (error) {
			toast({
				variant: 'destructive',
				title: 'Update failed',
				description: error.message
			});
		} else {
			toast({
				title: 'Password updated',
				description: 'Your password has been successfully updated'
			});
		}

		return { error };
	};

	const checkIfOnboardingCompleted = async (userId: string) => {
		const localStorageCompleted = localStorage.getItem('jobrani-onboarding-completed');
		if (localStorageCompleted) {
			return localStorageCompleted === 'true';
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('onboarding_completed')
			.eq('user_id', userId)
			.single();

		return profile?.onboarding_completed;
	};

	const value = {
		user,
		session,
		loading,
		signUp,
		signIn,
		signOut,
		resetPassword,
		updatePassword,
		checkIfOnboardingCompleted
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
