import 'dotenv/config'

function loadJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32
    || secret === 'change-me-in-production' || secret === 'pulse-dev-secret-2024') {
    throw new Error('JWT_SECRET must be a non-placeholder secret of at least 32 bytes. Generate one with openssl rand -hex 32 and save it in server/.env.')
  }
  return secret
}

export const JWT_SECRET = loadJwtSecret()
