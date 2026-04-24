import { db } from '../db';
import { users, assets, assetMovements, assetUsages, locations } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { hashPassword } from '../lib/password';
import { z } from 'zod';
import { createUserSchema, updateUserSchema, resetPasswordSchema, changePasswordSchema } from '../validators/user.validator';


export class UserService {
  async findAll() {
    return await db.select({
      id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt
    }).from(users);
  }

  async findById(id: number) {
    const [user] = await db.select({
      id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt
    }).from(users).where(eq(users.id, id));
    
    if (!user) {
      throw new Error('User not found');
    }
    return user;
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

  async getActivity(userId: number) {
    const movements = await db.select({
      id: assetMovements.id,
      assetName: assets.name,
      assetCode: assets.assetCode,
      type: sql<string>`'movement'`,
      timestamp: assetMovements.movedAt,
      details: sql<string>`CONCAT('Moved to ', (SELECT name FROM locations WHERE id = ${assetMovements.toLocationId}))`
    })
    .from(assetMovements)
    .innerJoin(assets, eq(assetMovements.assetId, assets.id))
    .where(eq(assetMovements.movedBy, userId));

    const usages = await db.select({
      id: assetUsages.id,
      assetName: assets.name,
      assetCode: assets.assetCode,
      type: sql<string>`'usage'`,
      timestamp: assetUsages.usedAt,
      details: sql<string>`CONCAT('Used ', ${assetUsages.quantityUsed}, ' units (New qty: ', ${assetUsages.quantityAfter}, ')')`
    })
    .from(assetUsages)
    .innerJoin(assets, eq(assetUsages.assetId, assets.id))
    .where(eq(assetUsages.updatedBy, userId));

    return [...movements, ...usages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
export const userService = new UserService();
