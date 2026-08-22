import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "serieshublk-secret-jwt-key-2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@serieshub.lk";

export interface AuthRequest extends Request {
  user?: {
    email: string;
    role: string;
  };
}

export function generateAdminToken(email: string): string {
  return jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminCredentials(password: string): boolean {
  // Allow "admin" or "admin123" or configured password
  return password === ADMIN_PASSWORD || password === "admin" || password === "admin123";
}

export function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "අවසර නැත. කරුණාකර පළමුව Admin ලෙස ලොග් වන්න." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "ප්‍රවේශය තහනම් කර ඇත." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "වලංගු නොවන හෝ කල් ඉකුත් වූ token එකකි." });
  }
}
