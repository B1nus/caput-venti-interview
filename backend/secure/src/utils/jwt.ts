import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Usually I keep the token between 5 minutes - 15 minutes
export function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '5m',
  });
}

// Generate a random string as refreshToken
export function generateRefreshToken() {
  const token = crypto.randomBytes(16).toString('base64url');
  return token;
}

export function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
}
