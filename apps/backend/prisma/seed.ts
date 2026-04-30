import { PrismaClient, UserRole, PropertyStatus, PropertyType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Clean existing data (order matters — delete children before parents)
  await prisma.inquiry.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // ── Create Users ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Password1', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@realestate.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '+216 71 000 000',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'sarah@realestate.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.AGENT,
      phone: '+216 71 111 111',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'mike@realestate.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Williams',
      role: UserRole.AGENT,
      phone: '+216 71 222 222',
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      phone: '+216 71 333 333',
    },
  });

  console.log(`Created ${4} users`);

  // ── Create Properties ──────────────────────────────────────────────────────
  const property1 = await prisma.property.create({
    data: {
      title: 'Luxury Villa with Sea View',
      description: 'Stunning 4-bedroom villa with panoramic sea views, private pool, and modern finishes throughout. Located in a quiet residential area with 24/7 security.',
      price: 850000,
      status: PropertyStatus.FOR_SALE,
      type: PropertyType.HOUSE,
      address: '15 Rue de la Mer',
      city: 'Tunis',
      state: 'Tunis',
      zipCode: '1002',
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      yearBuilt: 2020,
      featured: true,
      agentId: agent1.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', isPrimary: true,  order: 1 },
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', isPrimary: false, order: 2 },
        ],
      },
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'Modern Apartment in City Center',
      description: 'Bright and spacious 2-bedroom apartment on the 5th floor with elevator access. Walking distance to shops, restaurants and public transport.',
      price: 1800,
      status: PropertyStatus.FOR_RENT,
      type: PropertyType.APARTMENT,
      address: '42 Avenue Habib Bourguiba',
      city: 'Tunis',
      state: 'Tunis',
      zipCode: '1000',
      bedrooms: 2,
      bathrooms: 1,
      area: 95,
      yearBuilt: 2018,
      featured: true,
      agentId: agent1.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isPrimary: true, order: 1 },
        ],
      },
    },
  });

  const property3 = await prisma.property.create({
    data: {
      title: 'Beachfront Condo in Sousse',
      description: 'Fully furnished 3-bedroom condo just 50m from the beach. Perfect for vacation rental or year-round living. Swimming pool and gym included.',
      price: 420000,
      status: PropertyStatus.FOR_SALE,
      type: PropertyType.CONDO,
      address: '8 Boulevard de la Plage',
      city: 'Sousse',
      state: 'Sousse',
      zipCode: '4000',
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      yearBuilt: 2019,
      featured: false,
      agentId: agent2.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', isPrimary: true, order: 1 },
        ],
      },
    },
  });

  const property4 = await prisma.property.create({
    data: {
      title: 'Commercial Space in Sfax',
      description: 'Prime commercial space on the main business street of Sfax. 200 sqm on ground floor, ideal for retail, restaurant, or office.',
      price: 3500,
      status: PropertyStatus.FOR_RENT,
      type: PropertyType.COMMERCIAL,
      address: '1 Rue Hedi Chaker',
      city: 'Sfax',
      state: 'Sfax',
      zipCode: '3000',
      bedrooms: 0,
      bathrooms: 2,
      area: 200,
      featured: false,
      agentId: agent2.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', isPrimary: true, order: 1 },
        ],
      },
    },
  });

  console.log(`Created ${4} properties`);

  // ── Create Inquiries ───────────────────────────────────────────────────────
  await prisma.inquiry.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'buyer@example.com',
        phone: '+216 71 333 333',
        message: 'I am very interested in this villa. Can we schedule a viewing this weekend?',
        status: 'NEW',
        propertyId: property1.id,
        userId: buyer.id,
      },
      {
        name: 'Alice Martin',
        email: 'alice@example.com',
        message: 'Is the apartment still available? What is included in the rent?',
        status: 'CONTACTED',
        propertyId: property2.id,
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+216 71 444 444',
        message: 'Interested in the condo. Do you offer a payment plan?',
        status: 'NEW',
        propertyId: property3.id,
        userId: buyer.id,
      },
    ],
  });

  console.log(`Created ${3} inquiries`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n Seed completed successfully!');
  console.log('─────────────────────────────────');
  console.log('Test accounts (all passwords: Password1)');
  console.log('  Admin:  admin@realestate.com');
  console.log('  Agent:  sarah@realestate.com');
  console.log('  Agent:  mike@realestate.com');
  console.log('  Buyer:  buyer@example.com');
  console.log('─────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });