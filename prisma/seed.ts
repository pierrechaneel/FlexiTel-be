// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 6 offres exemples
  await prisma.offer.createMany({
    data: [
      { name: 'Forfait 5 Go',   category: 'data', price: 4.99, validityDays: 30, quotaUnit: 'Mo', quotaAmount: 5000 },
      { name: 'Forfait 10 Go',  category: 'data', price: 7.99, validityDays: 30, quotaUnit: 'Mo', quotaAmount: 10000 },
      { name: 'Forfait 20 Go',  category: 'data', price: 9.99, validityDays: 30, quotaUnit: 'Mo', quotaAmount: 20000 },
      { name: 'Illimité SMS',    category: 'sms',  price: 3.99, validityDays: 30, quotaUnit: 'SMS', quotaAmount: 1000 },
      { name: '100 min voix',    category: 'voice', price: 5.99, validityDays: 30, quotaUnit: 'min', quotaAmount: 100 },
      { name: 'Illimité voix+SMS',category: 'voice', price: 12.99,validityDays: 30, quotaUnit: 'mixte', quotaAmount: 0 }
    ],
  })

  // 10 numéros exemples
  const numbers = Array.from({ length: 10 }).map((_, i) => ({
    msisdn: `24389000020${i + 1}`,
    imsi:   `63001000020${i + 1}`,
  }))
  await prisma.phoneNumber.createMany({ data: numbers })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
