// Shared device verification utilities

const encoder = new TextEncoder();

export async function generateHmacSignature(deviceId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(deviceId)
  );
  
  // Convert to base64url
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function verifyDeviceToken(token: string, secret: string): Promise<{ valid: boolean; deviceId: string | null }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, deviceId: null };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, deviceId: null };
  }

  const [deviceId, providedSignature] = parts;

  // Validate deviceId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(deviceId)) {
    return { valid: false, deviceId: null };
  }

  // Generate expected signature
  const expectedSignature = await generateHmacSignature(deviceId, secret);

  // Constant-time comparison to prevent timing attacks
  if (providedSignature.length !== expectedSignature.length) {
    return { valid: false, deviceId: null };
  }

  let mismatch = 0;
  for (let i = 0; i < providedSignature.length; i++) {
    mismatch |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { valid: false, deviceId: null };
  }

  return { valid: true, deviceId };
}
