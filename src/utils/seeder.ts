import { Product, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

const FRAME_BRANDS = ['Ray-Ban', 'Oakley', 'Tom Ford', 'Gucci', 'Prada'];
const LENS_BRANDS = ['Zeiss', 'Essilor', 'Hoya'];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function seedMockDatabase() {
  const inventory: Product[] = [];
  const completedSales: Transaction[] = [];

  // Seed Frames (1,000)
  for (let i = 0; i < 1000; i++) {
    const brand = FRAME_BRANDS[randomInt(0, FRAME_BRANDS.length - 1)];
    const id = `FRAME-${uuidv4().slice(0, 8).toUpperCase()}`;
    inventory.push({
      id,
      qrCode: id,
      name: `${brand} Frame ${i + 1}`,
      brand,
      category: 'FRAME',
      price: randomInt(100, 400),
      stock: randomInt(1, 20),
    });
  }

  // Adding the requested ones for scanning to work:
  inventory.push({
    id: 'FRAME-RB2140',
    qrCode: 'FRAME-RB2140',
    name: 'Ray-Ban Wayfarer (TEST)',
    category: 'FRAME',
    brand: 'Ray-Ban',
    price: 150.00,
    stock: 10
  });

  // Seed Lenses (1,000)
  for (let i = 0; i < 1000; i++) {
    const brand = LENS_BRANDS[randomInt(0, LENS_BRANDS.length - 1)];
    const sphereNumber = randomInt(-10, 10) * 0.25;
    const sphere = sphereNumber.toFixed(2);
    const id = `LENS-${uuidv4().slice(0, 8).toUpperCase()}`;
    inventory.push({
      id,
      qrCode: id,
      name: `${brand} Single Vision Lens (${sphereNumber > 0 ? '+' : ''}${sphere} SPH)`,
      brand,
      category: 'LENS',
      price: randomInt(40, 150),
      stock: randomInt(5, 50),
    });
  }

  inventory.push({
    id: 'LENS-SV-200',
    qrCode: 'LENS-SV-200',
    name: 'Single Vision -2.00 (TEST)',
    category: 'LENS',
    brand: 'Zeiss',
    price: 80.00,
    stock: 10
  });

  // Seed Past Sales (50) over the last 7 days
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    const daysAgo = randomInt(0, 6);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    // Add some random time to scatter it
    date.setHours(randomInt(9, 18), randomInt(0, 59), randomInt(0, 59));

    const numItems = randomInt(1, 3);
    const items = [];
    let total = 0;
    
    for (let j = 0; j < numItems; j++) {
      const p = inventory[randomInt(0, inventory.length - 1)];
      const qty = randomInt(1, 2);
      items.push({ ...p, quantity: qty });
      total += p.price * qty;
    }

    completedSales.push({
      id: uuidv4(),
      date: date.toISOString(),
      items,
      total,
    });
  }

  // Sort sales chronologically early to latest just because it's nice
  completedSales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { inventory, completedSales };
}
