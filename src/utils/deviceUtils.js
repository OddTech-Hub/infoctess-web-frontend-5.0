/**
 * Device Fingerprinting & Identification Utilities
 *
 * Captures accurate, human-readable device names (e.g. "Apple iPhone (Safari)",
 * "Samsung Galaxy / Android (Chrome)", "Windows 11 PC (Chrome)") and generates
 * a persistent device identifier stored in localStorage.
 */

export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { deviceId: 'dev-server', deviceName: 'Server' };
  }

  // 1. Persistent Device Identifier (UUIDv4-like string stored in localStorage)
  let deviceId = localStorage.getItem('infoctess_device_id');
  if (!deviceId || deviceId.length < 8) {
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        const arr = new Uint8Array(8);
        window.crypto.getRandomValues(arr);
        deviceId = 'dev-' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        deviceId = 'dev-' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      }
    } catch (e) {
      deviceId = 'dev-' + Math.random().toString(36).substring(2, 12);
    }
    localStorage.setItem('infoctess_device_id', deviceId);
  }

  // Also ensure sessionStorage has it for legacy checks
  try {
    sessionStorage.setItem('device_id', deviceId);
  } catch (e) {}

  // 2. Human-Readable Device Model / OS
  const ua = navigator.userAgent || '';
  let os = 'Unknown Device';
  let browser = 'Browser';

  // OS / Model Detection
  if (/iPhone/i.test(ua)) {
    os = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    os = 'Apple iPad';
  } else if (/Android/i.test(ua)) {
    // Attempt to extract model name from Android UA
    const match = ua.match(/Android[^;]+;\s*([^;)]+)/i);
    if (match && match[1] && !match[1].includes('Build')) {
      os = match[1].trim();
    } else {
      os = 'Android Device';
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'Apple Mac';
  } else if (/Windows NT 10/i.test(ua)) {
    os = 'Windows PC';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows PC';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux PC';
  }

  // Browser Detection
  if (/Edg\//i.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Firefox';
  } else if (/Opera|OPR\//i.test(ua)) {
    browser = 'Opera';
  }

  const deviceName = `${os} (${browser})`;

  return {
    deviceId,
    deviceName
  };
}
