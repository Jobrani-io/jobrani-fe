import { useState, useEffect } from 'react';

const EXTENSION_ID = 'elmpeepckghlbbcjhmmkkeknicjfffac';

export function useExtensionDetection() {
	const [isExtensionConnected, setIsExtensionConnected] = useState(false);
	const [extensionError, setExtensionError] = useState<string | undefined>();
	const [isDetecting, setIsDetecting] = useState(false);

	useEffect(() => {
		checkExtensionStatus();
	}, []);

	const checkExtensionStatus = () => {
		if (!window.chrome?.runtime?.sendMessage) {
			return false;
		}

		try {
			window.chrome.runtime.sendMessage(EXTENSION_ID, { type: 'jobrani_ping' }, (response) => {
				if (
					window.chrome?.runtime &&
					'lastError' in window.chrome.runtime &&
					window.chrome.runtime.lastError
				) {
					setIsExtensionConnected(false);
					return;
				}

				if (response?.connected) {
					setIsExtensionConnected(true);
					setExtensionError(undefined);
				}
			});
		} catch (error) {
			setIsExtensionConnected(false);
		}

		return isExtensionConnected;
	};

	const installExtension = () => {
		setIsDetecting(true);
		setExtensionError(undefined);

		// Open Chrome Web Store page for the extension
		window.open(`https://chrome.google.com/webstore/detail/${EXTENSION_ID}`, '_blank');

		// Check for installation after a delay
		setTimeout(() => {
			const isConnected = checkExtensionStatus();

			if (!isConnected) {
				setExtensionError(
					"Couldn't detect the extension yet. Open Chrome → click 'Add to Chrome,' then refresh this page."
				);
			}

			setIsDetecting(false);
		}, 3000);
	};

	const syncWithExtension = async () => {
		if (!isExtensionConnected) {
			return { success: false, error: 'Extension not connected' };
		}

		return new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
			window.chrome!.runtime!.sendMessage(
				EXTENSION_ID,
				{ type: 'jobrani_sync_jobs' },
				(response) => {
					if (
						window.chrome?.runtime &&
						'lastError' in window.chrome.runtime &&
						window.chrome.runtime.lastError
					) {
						resolve({
							success: false,
							error: (window.chrome.runtime.lastError as any).message
						});
						return;
					}

					resolve({ success: true, data: response });
				}
			);
		});
	};

	return {
		isExtensionConnected,
		extensionError,
		isDetecting,
		installExtension,
		syncWithExtension,
		checkExtensionStatus
	};
}
