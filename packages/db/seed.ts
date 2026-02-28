import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    const admin = await prisma.user.upsert({
        where: { email: process.env.ADMIN_EMAIL || 'admin@smokeessentials.com' },
        update: {},
        create: {
            name: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@smokeessentials.com',
            phone: '01700000000',
            passwordHash: adminPassword,
            role: 'ADMIN',
            isAgeVerified: true,
        },
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Seed products — Cigarette brands
    const cigarettes = [
        {
            name: 'Marlboro Red',
            brand: 'Marlboro',
            description: 'Full-flavored cigarettes with bold, rich taste. The iconic red pack known worldwide.',
            price: 300,
            stock: 120,
            category: 'CIGARETTE' as const,
            imageUrl: '/images/products/marlboro-red.jpg',
            packSize: '20 sticks',
        },
        {
            name: 'Marlboro Advance',
            brand: 'Marlboro',
            description: 'Premium advanced filter cigarettes with a smooth finish. Modern and sleek smoking experience.',
            price: 320,
            stock: 150,
            category: 'CIGARETTE' as const,
            imageUrl: '/images/products/marlboro-advance.jpg',
            packSize: '20 sticks',
        },
        {
            name: 'Benson & Hedges',
            brand: 'Benson & Hedges',
            description: 'Premium quality cigarettes with distinctive gold packaging. Known for smooth flavor and refined taste.',
            price: 250,
            stock: 150,
            category: 'CIGARETTE' as const,
            imageUrl: '/images/products/benson-hedges-gold.jpg',
            packSize: '20 sticks',
        },
        {
            name: 'Lucky Strike',
            brand: 'Lucky Strike',
            description: 'It\'s toasted! Classic cigarettes offering a rich, robust, and iconic American tobacco blend.',
            price: 280,
            stock: 200,
            category: 'CIGARETTE' as const,
            imageUrl: '/images/products/lucky-strike.jpg',
            packSize: '20 sticks',
        },
        {
            name: 'Oris Slims',
            brand: 'Oris',
            description: 'Elegant and slim profile cigarettes providing a light, smooth, and delicate smoke.',
            price: 220,
            stock: 180,
            category: 'CIGARETTE' as const,
            imageUrl: '/images/products/oris.jpg',
            packSize: '20 sticks',
        },
        {
            name: 'Camel Classic',
            brand: 'Camel',
            description: 'A distinctive Turkish and domestic tobacco blend that delivers a smooth, classic taste.',
            price: 260,
            stock: 160,
            category: 'CIGARETTE' as const,
            imageUrl: '/images/products/camel.jpg',
            packSize: '20 sticks',
        },
    ];

    // Seed products — 5 Condom variants
    const condoms = [
        {
            name: 'Sensation Ultra Thin',
            brand: 'Sensation',
            description: 'Ultra-thin latex condoms for maximum sensitivity. Electronically tested for safety.',
            price: 120,
            stock: 300,
            category: 'CONDOM' as const,
            imageUrl: '/images/products/sensation-ultra-thin.jpg',
            packSize: '3 pieces',
        },
        {
            name: 'Panther Dotted',
            brand: 'Panther',
            description: 'Dotted texture condoms for enhanced pleasure. Premium quality with extra stimulation.',
            price: 150,
            stock: 250,
            category: 'CONDOM' as const,
            imageUrl: '/images/products/panther-dotted.jpg',
            packSize: '3 pieces',
        },
        {
            name: 'Durex Extra Time',
            brand: 'Durex',
            description: 'Specially designed with benzocaine lubricant for extended pleasure. Clinically tested.',
            price: 350,
            stock: 100,
            category: 'CONDOM' as const,
            imageUrl: '/images/products/durex-extra-time.jpg',
            packSize: '3 pieces',
        },
        {
            name: 'Manforce Ribbed',
            brand: 'Manforce',
            description: 'Ribbed and textured for mutual pleasure. Made with premium natural latex.',
            price: 200,
            stock: 200,
            category: 'CONDOM' as const,
            imageUrl: '/images/products/manforce-ribbed.jpg',
            packSize: '10 pieces',
        },
        {
            name: 'Moods Flavored Variety',
            brand: 'Moods',
            description: 'Assorted flavored condoms — strawberry, chocolate, vanilla. Fun and safe.',
            price: 180,
            stock: 220,
            category: 'CONDOM' as const,
            imageUrl: '/images/products/moods-flavored.jpg',
            packSize: '12 pieces',
        },
    ];

    // Seed products — Combos
    const combos = [
        {
            name: 'The Classic Weekend',
            brand: 'Combo',
            description: 'Perfect classic combination: Marlboro Red pack and Durex Extra Time.',
            price: 600,
            stock: 50,
            category: 'COMBO' as const,
            imageUrl: '/images/products/classic-weekend.jpg',
            packSize: '1 Pack + 3 Condoms',
        },
        {
            name: 'The Light Night',
            brand: 'Combo',
            description: 'Smooth and sensitive: Marlboro Advance and Sensation Ultra Thin.',
            price: 400,
            stock: 60,
            category: 'COMBO' as const,
            imageUrl: '/images/products/light-night.jpg',
            packSize: '1 Pack + 3 Condoms',
        },
        {
            name: 'The Premium Set',
            brand: 'Combo',
            description: 'Elegance and flavor: Oris Slims and Moods Flavored Variety.',
            price: 360,
            stock: 40,
            category: 'COMBO' as const,
            imageUrl: '/images/products/premium-set.jpg',
            packSize: '1 Pack + 12 Condoms',
        },
    ];

    // Clear existing products and create fresh
    await prisma.product.deleteMany({});

    for (const product of [...cigarettes, ...condoms, ...combos]) {
        await prisma.product.create({
            data: {
                id: product.name.toLowerCase().replace(/\s+/g, '-'),
                ...product,
            },
        });
    }

    console.log(`✅ ${cigarettes.length + condoms.length + combos.length} products seeded`);
    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
