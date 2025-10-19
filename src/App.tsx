import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMetaPixel } from '@/hooks/useMetaPixel';

declare global {
	interface Window {
		dataLayer: any[];
		gtag: (...args: any[]) => void;
	}
}
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import Index from './pages/Index';
import { ProtectedRoute } from './components/ProtectedRoute';
import BuildPipeline from './pages/BuildPipeline';
import LoginPage from './pages/LoginPage';
import Signup from './pages/Signup';
import HubOnboarding from './pages/HubOnboarding';
import Hub from './pages/Hub';
import Marketplace from './pages/Marketplace';
import NotFound from './pages/NotFound';
import ExtensionLogin from './pages/ExtensionLogin';
import MyAccount from './pages/MyAccount';
import Admin from './pages/Admin';
import { BackgroundProcessingIndicator } from './components/BackgroundProcessingIndicator';
import { ApplicationsProvider } from '@/contexts/ApplicationsContext';
import Mixpanel from '@/integrations/mixpanel';
import Zendesk from '@/integrations/zendesk';

const queryClient = new QueryClient();

const AppRoutes = () => {
	const location = useLocation();
	const { trackEvent } = useMetaPixel('969772518529578');

	// Track page views on route changes
	useEffect(() => {
		console.log('Route changed to:', location.pathname);

		// Track Meta Pixel page view
		if (window.fbq) {
			window.fbq('track', 'PageView');
			console.log('Meta Pixel PageView tracked for route:', location.pathname);
		}

		// Track GTM page view
		if (window.dataLayer) {
			window.dataLayer.push({
				event: 'page_view',
				page_location: window.location.href,
				page_path: location.pathname
			});
			console.log('GTM PageView tracked for route:', location.pathname);
		}

		// Track GA4 page view for route changes
		if (window.gtag) {
			window.gtag('config', 'G-YQ3S998VP2', {
				page_path: location.pathname
			});
			console.log('GA4 PageView tracked for route:', location.pathname);
		}
	}, [location.pathname]);

	return (
		<>
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/hub-onboarding"
					element={
						<ProtectedRoute>
							<HubOnboarding />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/extension-login"
					element={
						<ProtectedRoute>
							<ExtensionLogin />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/hub"
					element={
						<ProtectedRoute>
							<Hub />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/build-pipeline"
					element={
						<ProtectedRoute>
							<BuildPipeline />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/marketplace"
					element={
						<ProtectedRoute>
							<Marketplace />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/myaccount"
					element={
						<ProtectedRoute>
							<MyAccount />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin"
					element={
						<ProtectedRoute adminOnly>
							<Admin />
						</ProtectedRoute>
					}
				/>
				{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
				<Route path="/404" element={<NotFound />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
			<BackgroundProcessingIndicator />
		</>
	);
};

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<Mixpanel />
			<Zendesk />
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<ApplicationsProvider>
					<BrowserRouter>
						<SubscriptionProvider>
							<AppRoutes />
						</SubscriptionProvider>
					</BrowserRouter>
				</ApplicationsProvider>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
