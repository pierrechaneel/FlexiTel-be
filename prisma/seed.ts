import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SALT_ROUNDS = 10
const ADMIN_PASSWORD = 'helloPiero!11'  

async function main() {

 const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)
 //ADMIN
   await prisma.user.create({
    data: {
      email: 'admin@flexitel.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'FlexiTel',
      role: 'ADMIN',
      isNew: false,
      topUpCumulative: 0,
    },
  })

// 6 offres
await prisma.offer.createMany({
  data: [
    { name: 'Forfait 5 Go', category: 'data', price: 4.99, validityDays: 30, quotaUnit: 'Mo', quotaAmount: 5000 },
    { name: 'Forfait 10 Go', category: 'data', price: 7.99, validityDays: 30, quotaUnit: 'Mo', quotaAmount: 10000 },
    { name: 'Forfait 20 Go', category: 'data', price: 9.99, validityDays: 30, quotaUnit: 'Mo', quotaAmount: 20000 },
    { name: 'Illimité SMS', category: 'sms', price: 3.99, validityDays: 30, quotaUnit: 'SMS', quotaAmount: 1000 },
    { name: '100 min voix', category: 'voix', price: 5.99, validityDays: 30, quotaUnit: 'min', quotaAmount: 100 },
    { name: 'Illimité voix+SMS', category: 'voix', price: 12.99, validityDays: 30, quotaUnit: 'mixte', quotaAmount: 0 }
  ],
})

// 10 numéros
const numbers = Array.from({ length: 10 }).map((_, i) => ({
  msisdn: `24389000020${i + 1}`,
  imsi: `63001000020${i + 1}`,
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
