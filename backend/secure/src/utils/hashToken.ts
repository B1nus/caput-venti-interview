import crypto from 'crypto';

export function hashToken(token: String): String {
  return crypto.createHash('sha512').update(token).digest('hex');
}

