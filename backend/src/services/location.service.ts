import { db } from '../db';
import { locations, assets } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { createLocationSchema, updateLocationSchema } from '../validators/location.validator';

type LocationLevel = 'campus' | 'building' | 'floor' | 'room' | 'shelf';

const LEVEL_ORDER: Record<LocationLevel, number> = {
  campus: 0,
  building: 1,
  floor: 2,
  room: 3,
  shelf: 4
};

export class LocationService {
  async getAll() {
    return await db.select().from(locations);
  }

  async getTree() {
    const all = await this.getAll();
    const map = new Map<number, any>();
    all.forEach(loc => map.set(loc.id, { ...loc, children: [] }));
    const tree: any[] = [];
    all.forEach(loc => {
      if (loc.parentId === null) {
        tree.push(map.get(loc.id));
      } else {
        const parent = map.get(loc.parentId);
        if (parent) parent.children.push(map.get(loc.id));
      }
    });
    return tree;
  }

  async getFlat() {
    const all = await this.getAll();
    const map = new Map<number, typeof all[0]>();
    all.forEach(loc => map.set(loc.id, loc));

    return all.map(loc => {
      let pathArray = [loc.name];
      let curr = loc;
      let depth = 0;
      while (curr.parentId && depth < 10) {
        curr = map.get(curr.parentId)!;
        pathArray.unshift(curr.name);
        depth++;
      }

      return {
        ...loc,
        path: pathArray.join(' > ')
      };
    });
  }

  async validateParentLevel(level: LocationLevel, parentId?: number | null) {
    if (level === 'campus') {
      if (parentId) throw Object.assign(new Error('Campus cannot have a parent'), { statusCode: 400 });
      return;
    }
    if (!parentId) throw Object.assign(new Error(`Level ${level} must have a parent`), { statusCode: 400 });
    const parentRecords = await db.select().from(locations).where(eq(locations.id, parentId));
    if (!parentRecords.length) throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
    const parent = parentRecords[0];
    
    if (LEVEL_ORDER[level] !== LEVEL_ORDER[parent.level as LocationLevel] + 1) {
      throw Object.assign(new Error(`Parent level (${parent.level}) is not exactly one level above child level (${level})`), { statusCode: 400 });
    }
  }

  async getSingle(id: number) {
    const all = await this.getFlat();
    const found = all.find(l => l.id === id);
    if (!found) throw Object.assign(new Error('Location not found'), { statusCode: 404 });
    return found;
  }

  async create(data: z.infer<typeof createLocationSchema>) {
    await this.validateParentLevel(data.level as LocationLevel, data.parentId);
    const [result] = await db.insert(locations).values({
      name: data.name,
      level: data.level,
      parentId: data.parentId || null
    });
    return { id: (result as any).insertId };
  }

  async update(id: number, data: z.infer<typeof updateLocationSchema>) {
    const targetRecords = await db.select().from(locations).where(eq(locations.id, id));
    if (!targetRecords.length) throw Object.assign(new Error('Location not found'), { statusCode: 404 });
    const target = targetRecords[0];

    const newLevel = (data.level || target.level) as LocationLevel;
    const newParentId = data.parentId !== undefined ? data.parentId : target.parentId;
    await this.validateParentLevel(newLevel, newParentId);

    await db.update(locations).set({
      name: data.name,
      level: data.level,
      parentId: data.parentId === null ? null : data.parentId
    }).where(eq(locations.id, id));
    return { success: true };
  }

  async getChildrenIds(parentId: number, all: typeof locations.$inferSelect[]): Promise<number[]> {
    const children = all.filter(l => l.parentId === parentId).map(l => l.id);
    let descendants = [...children];
    for (const childId of children) {
      descendants = descendants.concat(await this.getChildrenIds(childId, all));
    }
    return descendants;
  }

  async delete(id: number) {
    const all = await this.getAll();
    const childrenIds = await this.getChildrenIds(id, all);
    const relevantLocationIds = [id, ...childrenIds];

    const assetsInLocations = await db.select().from(assets).where(inArray(assets.locationId, relevantLocationIds));
    if (assetsInLocations.length > 0) {
      throw Object.assign(new Error('Cannot delete location because assets are assigned to it or its children'), { statusCode: 400 });
    }

    const sortedLevels: LocationLevel[] = ['shelf', 'room', 'floor', 'building', 'campus']; 
    for (const level of sortedLevels) {
      const idsToDelete = all.filter(l => l.level === level && relevantLocationIds.includes(l.id)).map(l => l.id);
      if (idsToDelete.length) {
        await db.delete(locations).where(inArray(locations.id, idsToDelete));
      }
    }
    
    return { success: true };
  }
}
export const locationService = new LocationService();
