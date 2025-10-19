// Analytics service for tracking Chrome Extension import events
export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private track(event: string, properties?: Record<string, any>) {
    // In a real implementation, this would send to your analytics service
    console.log(`Analytics Event: ${event}`, properties);
    
    // If you have a global analytics object (like gtag, mixpanel, etc.), use it here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  }

  // Chrome Extension Events
  trackAddChromeExtensionClick(context: 'empty_state' | 'side_rail') {
    this.track('import_click_add_chrome_extension', { context });
  }

  trackExtensionInstallDetected() {
    this.track('import_extension_install_detected');
  }

  trackExtensionInstallFailed(error?: string) {
    this.track('import_extension_install_failed', { error });
  }

  trackSearchLinkedInClick() {
    this.track('import_click_search_linkedin');
  }

  trackSyncNowClick(context: 'banner' | 'side_rail') {
    this.track('import_click_sync_now', { context });
  }

  trackSyncSuccess(jobCount?: number) {
    this.track('import_sync_success', { job_count: jobCount });
  }

  trackSyncError(error?: string) {
    this.track('import_sync_error', { error });
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();