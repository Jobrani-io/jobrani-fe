import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

declare global {
	interface Window {
		chrome?: {
			runtime?: {
				sendMessage: (
					extensionId: string,
					message: any,
					callback?: (response: any) => void
				) => void;
			};
		};
	}
}

const EXTENSION_ID = 'elmpeepckghlbbcjhmmkkeknicjfffac';

export default function ExtensionLogin() {
	const { session } = useAuth();

	useEffect(() => {
		if (window.chrome?.runtime?.sendMessage) {
			window.chrome.runtime.sendMessage(
				EXTENSION_ID,
				{ type: 'jobrani_auth', session },
				(response) => {
					console.log('extension response', response);
				}
			);
		}
	}, [session]);

	return (
		<div className="h-screen flex flex-1 justify-center items-center">
			<p className="text-lg">You're now signed in. Feel free to close this tab.</p>
		</div>
	);
}
