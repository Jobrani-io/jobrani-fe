// Service for handling conversion tracking with deduplication
export class TrackingService {
	private static readonly CONVERSION_STORAGE_KEY = 'jobrani-conversions-tracked';
	private static readonly GOOGLE_ADS_CONVERSION_ID = 'AW-17395796985/hhrRCO_53foaEPmX--ZA';

	/**
	 * Track Google Ads conversion with deduplication
	 * @param userId - User ID to use as transaction_id for deduplication
	 * @param conversionType - Type of conversion for tracking purposes
	 */
	static trackGoogleAdsConversion(userId: string, conversionType: string = 'onboarding_complete') {
		// Check if this user has already triggered this conversion
		const trackedConversions = this.getTrackedConversions();
		const conversionKey = `${conversionType}_${userId}`;

		if (trackedConversions.includes(conversionKey)) {
			console.log(`Google Ads conversion already tracked for user ${userId}, skipping`);
			return;
		}

		// Track the conversion
		if (window.gtag) {
			window.gtag('event', 'conversion', {
				send_to: this.GOOGLE_ADS_CONVERSION_ID,
				transaction_id: userId, // Deduplication key
				value: 1.0,
				currency: 'USD'
			});

			// Mark this conversion as tracked
			this.markConversionTracked(conversionKey);
			console.log(
				`Google Ads conversion tracked for user ${userId} with transaction_id: ${userId}`
			);
		} else {
			console.warn('Google Ads (gtag) not available for conversion tracking');
		}
	}

	/**
	 * Get list of conversions already tracked for this browser/user
	 */
	private static getTrackedConversions(): string[] {
		try {
			const stored = localStorage.getItem(this.CONVERSION_STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.error('Error reading tracked conversions from localStorage:', error);
			return [];
		}
	}

	/**
	 * Mark a conversion as tracked to prevent duplicates
	 */
	private static markConversionTracked(conversionKey: string) {
		try {
			const trackedConversions = this.getTrackedConversions();
			trackedConversions.push(conversionKey);
			localStorage.setItem(this.CONVERSION_STORAGE_KEY, JSON.stringify(trackedConversions));
		} catch (error) {
			console.error('Error saving tracked conversion to localStorage:', error);
		}
	}
}
