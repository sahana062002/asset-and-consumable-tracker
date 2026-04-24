import { 
  mysqlTable, 
  serial, 
  varchar, 
  timestamp, 
  boolean, 
  mysqlEnum, 
  int,
  bigint, 
  text, 
  AnyMySqlColumn 
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'user']).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const locations = mysqlTable('locations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  level: mysqlEnum('level', ['campus', 'building', 'floor', 'room', 'shelf']).notNull(),
  parentId: bigint('parent_id', { mode: 'number', unsigned: true }).references((): AnyMySqlColumn => locations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const assets = mysqlTable('assets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  assetCode: varchar('asset_code', { length: 100 }).unique().notNull(),
  type: mysqlEnum('type', ['fixed', 'consumable']).notNull(),
  status: mysqlEnum('status', ['active', 'disposed']).default('active').notNull(),
  quantity: int('quantity'),
  initialQuantity: int('initial_quantity'),
  locationId: bigint('location_id', { mode: 'number', unsigned: true }).references(() => locations.id).notNull(),
  createdBy: bigint('created_by', { mode: 'number', unsigned: true }).references(() => users.id),
  disposalPhotoUrl: varchar('disposal_photo_url', { length: 500 }),
  disposedAt: timestamp('disposed_at'),
  disposedBy: bigint('disposed_by', { mode: 'number', unsigned: true }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const assetMovements = mysqlTable('asset_movements', {
  id: serial('id').primaryKey(),
  assetId: bigint('asset_id', { mode: 'number', unsigned: true }).references(() => assets.id).notNull(),
  fromLocationId: bigint('from_location_id', { mode: 'number', unsigned: true }).references(() => locations.id),
  toLocationId: bigint('to_location_id', { mode: 'number', unsigned: true }).references(() => locations.id).notNull(),
  movedBy: bigint('moved_by', { mode: 'number', unsigned: true }).references(() => users.id).notNull(),
  notes: text('notes'),
  movedAt: timestamp('moved_at').defaultNow().notNull(),
});

export const assetUsages = mysqlTable('asset_usages', {
  id: serial('id').primaryKey(),
  assetId: bigint('asset_id', { mode: 'number', unsigned: true }).references(() => assets.id).notNull(),
  quantityUsed: int('quantity_used').notNull(),
  quantityBefore: int('quantity_before').notNull(),
  quantityAfter: int('quantity_after').notNull(),
  updatedBy: bigint('updated_by', { mode: 'number', unsigned: true }).references(() => users.id).notNull(),
  notes: text('notes'),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

export type AssetMovement = typeof assetMovements.$inferSelect;
export type InsertAssetMovement = typeof assetMovements.$inferInsert;

export type AssetUsage = typeof assetUsages.$inferSelect;
export type InsertAssetUsage = typeof assetUsages.$inferInsert;
