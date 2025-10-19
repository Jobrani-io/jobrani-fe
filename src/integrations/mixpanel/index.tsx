import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import { useAuth } from '@/contexts/AuthContext';

const IS_DEV = ['localhost', '127.0.0.1'].includes(location.hostname);

if (!IS_DEV) {
	mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
		debug: true,
		autocapture: true,
		ignore_dnt: true,
		track_pageview: true,
		persistence: 'localStorage',
		record_heatmap_data: true,
		record_sessions_percent: 100,
		record_mask_text_selector: ''
	});
}

export default function Mixpanel() {
	const { user } = useAuth();

	useEffect(() => {
		if (IS_DEV || !user) return;

		mixpanel.identify(user.email);
		mixpanel.people.set({ $email: user.email });
	}, [user]);

	return null;
}
