import { prisma } from "../utils/prisma";

async function main() {
  console.log('🌱 Mulai seeding...')

  // 1. Bersihkan Data Lama (Urutan penting karena relasi!)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // 2. Buat Password Hash (Default: "rahasia123")
  const passwordHash = await Bun.password.hash('rahasia123')

  // 3. Buat Users (Superadmin & Barista)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@coffee.co',
      name: 'Super Admin',
      password: passwordHash,
      role: 'SUPERADMIN',
      avatarColor: '000000',
      streak: 50
    }
  })

  const barista = await prisma.user.create({
    data: {
      email: 'barista@coffee.co',
      name: 'Sarah Barista',
      password: passwordHash,
      role: 'BARISTA',
      avatarColor: 'D7CCC8'
    }
  })

  // 4. Buat Produk: Espresso Romano (Dengan Varian)
  const espresso = await prisma.product.create({
    data: {
      name: 'Espresso Romano',
      description: '<p>A shot of espresso with a slice of lemon.</p>', // HTML String
      category: 'COFFEE',
      price: 3.50,
      image: 'https://picsum.photos/id/1060/400/400',
      images: ['https://picsum.photos/id/1060/800/800'],
      rating: 4.8,
      subDescriptions: ['Single Origin', 'Citrus Notes'],
      sizes: ['S', 'M', 'L'], // Display only
      
      // INI YANG PENTING: Variants (Stok & Harga Asli)
      variants: {
        create: [
          { name: 'S', sku: 'ESP-S', price: 3.50, stock: 100 },
          { name: 'M', sku: 'ESP-M', price: 4.00, stock: 80 },
          { name: 'L', sku: 'ESP-L', price: 4.50, stock: 50 },
        ]
      }
    }
  })

  // 5. Buat Produk: Croissant (Tanpa Varian Size, tapi tetap butuh 1 varian default)
  await prisma.product.create({
    data: {
      name: 'French Croissant',
      description: '<p>Buttery, flaky, and freshly baked.</p>',
      category: 'PASTRY',
      price: 3.00,
      image: 'https://picsum.photos/id/431/400/400',
      subDescriptions: ['Freshly Baked', 'Butter Rich'],
      
      variants: {
        create: [
          { name: 'Standard', sku: 'PST-CRS', price: 3.00, stock: 20 }
        ]
      }
    }
  })

  console.log('✅ Seeding Selesai! Login pakai: admin@coffee.co / rahasia123')
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })