import jwt from "jsonwebtoken";

// Ensure JWT_SECRET is present at runtime and treat it as a string for TS
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function createAccessToken(user: {
  id: number;
  email: string;
  role: string;
}) {
  const payload: AuthTokenPayload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: 8 * 60 * 60,
  });
}

export function verifyAccessToken(
  token: string,
) {
  // jwt.verify has complex return types; coerce via unknown to our payload type
  return jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload;
}