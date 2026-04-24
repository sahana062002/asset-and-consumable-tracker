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

  async validateParentLevel(level: LocationLevel, parentId?: number | null, currentId?: number) {
    if (!parentId) {
      // Allow any level to be a root node if no parent is provided
      return;
    }

    if (currentId && parentId === currentId) {
      throw Object.assign(new Error('A location cannot be its own parent'), { statusCode: 400 });
    }

    const all = await this.getAll();
    if (currentId) {
      const descendantIds = await this.getChildrenIds(currentId, all);
      if (descendantIds.includes(parentId)) {
        throw Object.assign(new Error('Cannot assign a descendant as a parent (circular reference)'), { statusCode: 400 });
      }
    }
    
    const parent = all.find(l => l.id === parentId);
    if (!parent) throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
    
    // Ensure the parent level is "higher" in the hierarchy than the child level
    if (LEVEL_ORDER[level] <= LEVEL_ORDER[parent.level as LocationLevel]) {
      throw Object.assign(new Error(`Parent level (${parent.level}) must be higher in hierarchy than child level (${level})`), { statusCode: 400 });
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
    await this.validateParentLevel(newLevel, newParentId, id);

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
