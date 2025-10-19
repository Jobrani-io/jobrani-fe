import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
	children: ReactNode;
	adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly }: ProtectedRouteProps) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (adminOnly && user?.user_metadata?.role !== 'admin') {
		return <Navigate to="/404" replace />;
	}

	return <>{children}</>;
};
