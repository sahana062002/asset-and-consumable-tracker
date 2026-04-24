import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '../lib/password';
import { generateToken } from '../lib/jwt';
import { z } from 'zod';
import { loginSchema } from '../validators/auth.validator';

export class AuthService {
  async login(data: z.infer<typeof loginSchema>) {
    const userRecords = await db.select().from(users).where(eq(users.email, data.email.toLowerCase()));
    const user = userRecords[0];

    if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('User is inactive'), { statusCode: 403 });

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

    const token = generateToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async getMe(userId: number) {
    const userRecords = await db.select({
      id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt 
    }).from(users).where(eq(users.id, userId));
    if (!userRecords.length) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return userRecords[0];
  }
}
export const authService = new AuthService();
