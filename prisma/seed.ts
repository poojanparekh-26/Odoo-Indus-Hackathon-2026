import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create main warehouse (upsert so re-running is safe)
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH' },
    update: {},
    create: {
      name: 'Main Warehouse',
      code: 'WH',
    },
  });
  console.log(`✅ Warehouse: ${warehouse.name} (${warehouse.id})`);

  // 2. Create locations for that warehouse
  const locationDefs = [
    { name: 'Input',  code: 'WH/Input' },
    { name: 'Stock',  code: 'WH/Stock' },
    { name: 'Output', code: 'WH/Output' },
  ];

  for (const loc of locationDefs) {
    const existing = await prisma.location.findFirst({ where: { code: loc.code } });
    if (!existing) {
      await prisma.location.create({
        data: { ...loc, warehouseId: warehouse.id },
      });
      console.log(`✅ Location: ${loc.code}`);
    } else {
      console.log(`⏭️  Location already exists: ${loc.code}`);
    }
  }

  // 3. Create admin user
  const adminEmail = 'admin@coreinventory.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        role: 'manager',
      },
    });
    console.log(`✅ Admin user: ${admin.email}`);
  } else {
    console.log(`⏭️  Admin user already exists: ${adminEmail}`);
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
