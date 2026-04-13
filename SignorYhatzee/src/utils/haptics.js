import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerHaptic = async (style = ImpactStyle.Medium) => {
  try {
    // Check if we are running in a Capacitor environment
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    } else if (navigator.vibrate) {
      // Fallback to web vibration API
      navigator.vibrate(50);
    }
  } catch (e) {
    console.warn("Haptics not available:", e);
  }
};

export const triggerSuccess = async () => {
  try {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: 'SUCCESS' });
    } else if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch (e) {
    console.warn("Haptics SUCCESS not available:", e);
  }
};
