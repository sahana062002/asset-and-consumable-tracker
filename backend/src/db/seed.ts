import { db } from './index';
import { users, locations } from './schema';
import { eq } from 'drizzle-orm';

import { hashPassword } from '../lib/password';

async function seed() {
  console.log('Seeding Database...');

  // Seed Users
  const seedUsers = [
    {
      name: 'Admin User',
      email: 'admin@tracker.com',
      password: 'Admin@123',
      role: 'admin' as const,
    },
    {
      name: 'Regular User',
      email: 'user@tracker.com',
      password: 'User@123',
      role: 'user' as const,
    }
  ];

  for (const user of seedUsers) {
    const existing = await db.select().from(users).where(eq(users.email, user.email.toLowerCase()));
    if (existing.length === 0) {
      const passwordHash = await hashPassword(user.password);
      await db.insert(users).values({
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash,
        role: user.role,
      });
      console.log(`User ${user.email} seeded successfully`);
    } else {
      console.log(`User ${user.email} already exists, skipping...`);
    }
  }


  // Seed Location Hierarchy
  // Main Campus -> Block A -> Floor 1 -> Room 101 -> Shelf 1
  
  const [campusResult] = await db.insert(locations).values({
    name: 'Main Campus',
    level: 'campus',
    parentId: null,
  });
  const campusId = (campusResult as any).insertId;

  const [buildingResult] = await db.insert(locations).values({
    name: 'Block A',
    level: 'building',
    parentId: campusId,
  });
  const buildingId = (buildingResult as any).insertId;

  const [floorResult] = await db.insert(locations).values({
    name: 'Floor 1',
    level: 'floor',
    parentId: buildingId,
  });
  const floorId = (floorResult as any).insertId;

  const [roomResult] = await db.insert(locations).values({
    name: 'Room 101',
    level: 'room',
    parentId: floorId,
  });
  const roomId = (roomResult as any).insertId;

  await db.insert(locations).values({
    name: 'Shelf 1',
    level: 'shelf',
    parentId: roomId,
  });

  console.log('Location hierarchy seeded successfully');

  console.log('Seeding completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
