
import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const useMetaPixel = (pixelId: string) => {
  useEffect(() => {
    // Check if pixel script is already loaded
    if (window.fbq) {
      console.log('Meta Pixel already loaded:', window.fbq);
      return;
    }

    console.log('Loading Meta Pixel...');
    
    // Meta Pixel Code
    (function(f: any, b: any, e: any, v: any) {
      if (f.fbq) return;
      var n: any = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      var t = b.createElement(e);
      t.async = true;
      t.src = v;
      var s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    // Initialize pixel
    window.fbq('init', pixelId);
    console.log('Meta Pixel initialized with ID:', pixelId);
    
    // Track initial page view
    window.fbq('track', 'PageView');
    console.log('Meta Pixel PageView tracked');

    // Add event listener to verify pixel is working
    setTimeout(() => {
      if (window.fbq) {
        console.log('Meta Pixel verification: fbq function available');
        console.log('Meta Pixel queue:', window.fbq.queue || 'No queue');
      } else {
        console.error('Meta Pixel failed to load');
      }
    }, 1000);
  }, [pixelId]);

  const trackEvent = (eventName: string, parameters?: any) => {
    if (window.fbq) {
      console.log(`Tracking Meta Pixel event: ${eventName}`, parameters);
      window.fbq('track', eventName, parameters);
    } else {
      console.error('Meta Pixel not available for tracking event:', eventName);
    }
  };

  return { trackEvent };
};
