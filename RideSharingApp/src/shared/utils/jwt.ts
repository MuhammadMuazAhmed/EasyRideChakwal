export function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Safely decode base64 across React Native environment
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let buffer = '';
    let padded = base64;
    while (padded.length % 4 !== 0) {
      padded += '=';
    }
    for (let i = 0; i < padded.length; i += 4) {
      const chunk = (chars.indexOf(padded[i]) << 18) |
                    (chars.indexOf(padded[i + 1]) << 12) |
                    ((padded[i + 2] === '=' ? 0 : chars.indexOf(padded[i + 2])) << 6) |
                    (padded[i + 3] === '=' ? 0 : chars.indexOf(padded[i + 3]));
      buffer += String.fromCharCode((chunk >> 16) & 255);
      if (padded[i + 2] !== '=') {
        buffer += String.fromCharCode((chunk >> 8) & 255);
      }
      if (padded[i + 3] !== '=') {
        buffer += String.fromCharCode(chunk & 255);
      }
    }
    return JSON.parse(buffer);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}
