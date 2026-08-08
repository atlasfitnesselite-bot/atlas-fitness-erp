const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  await prisma.cafeItem.createMany({
    data: [
      { name: 'Optimum Nutrition Whey (Vanilla)', price: 45.0, stock: 2, minStock: 5, category: 'MERCHANDISE' },
      { name: 'Quest Protein Bars (Choc Chip)', price: 3.5, stock: 8, minStock: 20, category: 'SNACK' },
      { name: 'Almond Milk (Cartons)', price: 4.0, stock: 1, minStock: 10, category: 'BEVERAGE' },
      { name: 'Espresso Beans (kg)', price: 18.0, stock: 0.5, minStock: 2, category: 'BEVERAGE' },
      { name: 'Vegan Salad Bowl', price: 12.0, stock: 15, minStock: 5, category: 'SNACK' },
      { name: 'Pre-workout Energy Drink', price: 5.0, stock: 24, minStock: 10, category: 'BEVERAGE' }
    ]
  });
  console.log('Seeded Cafe Items!');
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
