import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../lib/password';
import { z } from 'zod';
import { createUserSchema, updateUserSchema, resetPasswordSchema, changePasswordSchema } from '../validators/user.validator';


export class UserService {
  async findAll() {
    return await db.select({
      id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt
    }).from(users);
  }

  async create(data: z.infer<typeof createUserSchema>) {
    const passwordHash = await hashPassword(data.password);
    const [result] = await db.insert(users).values({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role
    });
    return { id: (result as any).insertId };
  }

  async update(id: number, data: z.infer<typeof updateUserSchema>) {
    await db.update(users).set({
      ...data,
      email: data.email?.toLowerCase(),
    }).where(eq(users.id, id));
    return { success: true };
  }

  async resetPassword(id: number, data: z.infer<typeof resetPasswordSchema>) {
    const passwordHash = await hashPassword(data.newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
    return { success: true };
  }

  async changePassword(id: number, data: z.infer<typeof changePasswordSchema>) {
    const passwordHash = await hashPassword(data.newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
    return { success: true };
  }


  async softDelete(id: number) {
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
    return { success: true };
  }
}
export const userService = new UserService();
