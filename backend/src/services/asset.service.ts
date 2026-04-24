import { db } from '../db';
import { assets, assetMovements, assetUsages, users } from '../db/schema';
import { eq, like, or, and, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { createAssetSchema, listAssetsSchema, updateLocationSchema, updateUsageSchema } from '../validators/asset.validator';
import { locationService } from './location.service';

export class AssetService {
  async list(query: z.infer<typeof listAssetsSchema>) {
    const { page, limit, type, status, search, location_id } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (location_id) conditions.push(eq(assets.locationId, location_id));
    if (type) conditions.push(eq(assets.type, type));
    if (status) conditions.push(eq(assets.status, status));
    if (search) {
      conditions.push(
        or(
          like(assets.name, `%${search}%`),
          like(assets.assetCode, `%${search}%`)
        )
      );
    }
    
    const allLocations = await locationService.getFlat();
    const locMap = new Map();
    allLocations.forEach(l => locMap.set(l.id, l.path));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const queryBuilder = db.select({
      asset: assets,
      createdByName: users.name
    })
    .from(assets)
    .leftJoin(users, eq(assets.createdBy, users.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const data = await queryBuilder;
    
    // Total Count
    const countQuery = await db.select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(whereClause);
    const total = countQuery[0].count;

    return {
      data: data.map(row => ({
        ...row.asset,
        createdByName: row.createdByName,
        locationPath: locMap.get(row.asset.locationId) || 'Unknown Location'
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getDetail(id: number) {
    const assetRecords = await db.select().from(assets).where(eq(assets.id, id));
    if (!assetRecords.length) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    const asset = assetRecords[0];

    const allLocations = await locationService.getFlat();
    const locMap = new Map();
    allLocations.forEach(l => locMap.set(l.id, l.path));
    
    const assetResult: any = { ...asset, locationPath: locMap.get(asset.locationId) || 'Unknown Location' };

    if (asset.type === 'fixed') {
      const movements = await db.select({
        movement: assetMovements,
        movedByName: users.name,
      })
      .from(assetMovements)
      .leftJoin(users, eq(assetMovements.movedBy, users.id))
      .where(eq(assetMovements.assetId, id))
      .orderBy(desc(assetMovements.movedAt));

      assetResult.movements = movements.map(m => ({
        ...m.movement,
        movedByName: m.movedByName,
        fromLocationPath: m.movement.fromLocationId ? locMap.get(m.movement.fromLocationId) : null,
        toLocationPath: m.movement.toLocationId ? locMap.get(m.movement.toLocationId) : null
      }));
    } else {
      const usages = await db.select({
        usage: assetUsages,
        updatedByName: users.name
      })
      .from(assetUsages)
      .leftJoin(users, eq(assetUsages.updatedBy, users.id))
      .where(eq(assetUsages.assetId, id))
      .orderBy(desc(assetUsages.usedAt));

      assetResult.usages = usages.map(u => ({
        ...u.usage,
        updatedByName: u.updatedByName
      }));
      
      if (asset.status === 'disposed' && asset.disposedBy) {
        const disposedByRecord = await db.select({ name: users.name }).from(users).where(eq(users.id, asset.disposedBy));
        assetResult.disposedByName = disposedByRecord.length ? disposedByRecord[0].name : null;
      }
    }

    return assetResult;
  }

  async create(data: z.infer<typeof createAssetSchema>, userId: number) {
    const assetCode = `AST-${nanoid(8).toUpperCase()}`;
    const initialQuantity = data.type === 'consumable' ? data.quantity : null;

    return await db.transaction(async (tx) => {
      const [insertResult] = await tx.insert(assets).values({
        name: data.name,
        assetCode,
        type: data.type,
        locationId: data.location_id,
        quantity: initialQuantity,
        initialQuantity: initialQuantity,
        createdBy: userId,
        status: 'active'
      });

      const assetId = (insertResult as any).insertId;

      await tx.insert(assetMovements).values({
        assetId: assetId,
        fromLocationId: null,
        toLocationId: data.location_id,
        movedBy: userId
      });

      const createdAsset = await tx.select().from(assets).where(eq(assets.id, assetId));
      return createdAsset[0];
    });
  }

  async delete(id: number) {
    const assetRecords = await db.select().from(assets).where(eq(assets.id, id));
    if (!assetRecords.length) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    if (assetRecords[0].status !== 'active') throw Object.assign(new Error('Can only delete active assets'), { statusCode: 400 });

    await db.transaction(async (tx) => {
      await tx.delete(assetMovements).where(eq(assetMovements.assetId, id));
      await tx.delete(assetUsages).where(eq(assetUsages.assetId, id));
      await tx.delete(assets).where(eq(assets.id, id));
    });
    return { success: true };
  }

  async scanLookup(assetCode: string) {
    const assetRecords = await db.select().from(assets).where(eq(assets.assetCode, assetCode));
    if (!assetRecords.length) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    const asset = assetRecords[0];

    const allLocations = await locationService.getFlat();
    const locMap = new Map();
    allLocations.forEach(l => locMap.set(l.id, l.path));

    return {
      ...asset,
      locationPath: locMap.get(asset.locationId) || 'Unknown Location'
    };
  }

  async updateLocation(id: number, data: z.infer<typeof updateLocationSchema>, userId: number) {
    return await db.transaction(async (tx) => {
      const assetRecords = await tx.select().from(assets).where(eq(assets.id, id));
      if (!assetRecords.length) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
      const asset = assetRecords[0];

      if (asset.type !== 'fixed') throw Object.assign(new Error('Asset must be of type fixed'), { statusCode: 400 });
      if (asset.status !== 'active') throw Object.assign(new Error('Asset must be active to move'), { statusCode: 400 });
      if (asset.locationId === data.location_id) throw Object.assign(new Error('Asset is already at this location'), { statusCode: 400 });

      await tx.insert(assetMovements).values({
        assetId: id,
        fromLocationId: asset.locationId,
        toLocationId: data.location_id,
        movedBy: userId,
        notes: data.notes
      });

      await tx.update(assets).set({ locationId: data.location_id }).where(eq(assets.id, id));
      const updatedAsset = await tx.select().from(assets).where(eq(assets.id, id));
      return updatedAsset[0];
    });
  }

  async updateUsage(id: number, data: z.infer<typeof updateUsageSchema>, userId: number) {
    return await db.transaction(async (tx) => {
      const assetRecords = await tx.select().from(assets).where(eq(assets.id, id));
      if (!assetRecords.length) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
      const asset = assetRecords[0];

      if (asset.type !== 'consumable') throw Object.assign(new Error('Asset must be of type consumable'), { statusCode: 400 });
      if (asset.status !== 'active') throw Object.assign(new Error('Asset must be active to record usage'), { statusCode: 400 });
      
      const currentQuantity = asset.quantity || 0;
      if (data.quantity_used <= 0) throw Object.assign(new Error('Quantity used must be > 0'), { statusCode: 400 });
      if (data.quantity_used > currentQuantity) throw Object.assign(new Error('Quantity used exceeds current quantity'), { statusCode: 400 });

      const quantityAfter = currentQuantity - data.quantity_used;

      await tx.insert(assetUsages).values({
        assetId: id,
        quantityUsed: data.quantity_used,
        quantityBefore: currentQuantity,
        quantityAfter: quantityAfter,
        updatedBy: userId,
        notes: data.notes
      });

      await tx.update(assets).set({ quantity: quantityAfter }).where(eq(assets.id, id));

      if (quantityAfter === 0) {
        return { requiresDisposalPhoto: true };
      }

      const updatedAsset = await tx.select().from(assets).where(eq(assets.id, id));
      return updatedAsset[0];
    });
  }

  async dispose(id: number, photoUrl: string, userId: number) {
    const assetRecords = await db.select().from(assets).where(eq(assets.id, id));
    if (!assetRecords.length) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
    const asset = assetRecords[0];

    if (asset.type !== 'consumable') throw Object.assign(new Error('Only consumable assets can be disposed this way'), { statusCode: 400 });
    if (asset.status !== 'active') throw Object.assign(new Error('Asset must be active to dispose'), { statusCode: 400 });
    if (asset.quantity !== 0) throw Object.assign(new Error('Quantity must be 0 to dispose consumable'), { statusCode: 400 });

    await db.update(assets).set({
      status: 'disposed',
      disposalPhotoUrl: photoUrl,
      disposedAt: new Date(),
      disposedBy: userId
    }).where(eq(assets.id, id));

    const updatedAsset = await db.select().from(assets).where(eq(assets.id, id));
    return updatedAsset[0];
  }
}
export const assetService = new AssetService();
