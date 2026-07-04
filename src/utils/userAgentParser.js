/**
 * Parses user agent string to identify browser, operating system, and device type.
 * @param {string} userAgentString 
 * @returns {object} { deviceName, browser, operatingSystem }
 */
export function parseUserAgent(userAgentString) {
  console.log("userAgentString: ", userAgentString);
  if (!userAgentString) {
    return {
      deviceName: 'Unknown Device',
      browser: 'Unknown Browser',
      operatingSystem: 'Unknown OS',
    };
  }

  const ua = userAgentString;
  let browser = 'Unknown Browser';
  let operatingSystem = 'Unknown OS';
  let deviceName = 'Desktop';

  // 1. Parse Operating System
  if (/windows/i.test(ua)) {
    operatingSystem = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    operatingSystem = 'macOS';
  } else if (/android/i.test(ua)) {
    operatingSystem = 'Android';
    deviceName = 'Mobile';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    operatingSystem = 'iOS';
    deviceName = /ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/linux/i.test(ua)) {
    operatingSystem = 'Linux';
  }

  // 2. Parse Browser
  if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(ua) && !/opr/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/opr/i.test(ua)) {
    browser = 'Opera';
  } else if (/msie|trident/i.test(ua)) {
    browser = 'Internet Explorer';
  }

  // 3. Refine device type
  if (/mobile/i.test(ua) && deviceName === 'Desktop') {
    deviceName = 'Mobile';
  }

  return {
    deviceName,
    browser,
    operatingSystem,
  };
}
