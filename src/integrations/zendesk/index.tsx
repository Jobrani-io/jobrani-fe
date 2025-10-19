import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Zendesk() {
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		const script = document.createElement('script');
		script.id = 'ze-snippet';
		script.src =
			'https://static.zdassets.com/ekr/snippet.js?key=1f8fbe27-105b-423b-9db2-f594e545feab';
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, [user]);

	return null;
}
