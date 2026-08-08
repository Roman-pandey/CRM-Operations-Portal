import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up in correct order (respecting foreign keys)
  await prisma.stockMovement.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.customerFollowup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // --- USERS ---
  const hashedPasswords = {
    admin: await bcrypt.hash('Admin@123', 10),
    sales: await bcrypt.hash('Sales@123', 10),
    warehouse: await bcrypt.hash('Warehouse@123', 10),
    accounts: await bcrypt.hash('Accounts@123', 10),
  };

  const admin = await prisma.user.create({
    data: { name: 'Roman Pandey', email: 'admin@fundsroom.com', password: hashedPasswords.admin, role: 'ADMIN' },
  });
  const sales = await prisma.user.create({
    data: { name: 'Rahul Sharma', email: 'sales@fundsroom.com', password: hashedPasswords.sales, role: 'SALES' },
  });
  const warehouse = await prisma.user.create({
    data: { name: 'Amit Kumar', email: 'warehouse@fundsroom.com', password: hashedPasswords.warehouse, role: 'WAREHOUSE' },
  });
  const accounts = await prisma.user.create({
    data: { name: 'Neha Gupta', email: 'accounts@fundsroom.com', password: hashedPasswords.accounts, role: 'ACCOUNTS' },
  });

  console.log('👤 Created 4 users');

  // --- CUSTOMERS ---
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        customerName: 'Rajesh Mehta', mobile: '9876543210', email: 'rajesh@abctraders.com',
        businessName: 'ABC Traders', gstNumber: '27AABCU9603R1ZM', customerType: 'WHOLESALE',
        address: '123 Market Street, Andheri West, Mumbai 400053', status: 'ACTIVE',
        followUpDate: new Date('2026-08-15'), notes: 'Premium wholesale client, regular orders monthly',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Priya Singh', mobile: '9876543211', email: 'priya@xyzstore.com',
        businessName: 'XYZ Electronics Store', gstNumber: '07AAGCS2389P1Z4', customerType: 'RETAIL',
        address: '45 Sector 18, Noida, UP 201301', status: 'ACTIVE',
        notes: 'Retail store, orders electronics frequently',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Suresh Patel', mobile: '9876543212', email: 'suresh@ntechsolutions.com',
        businessName: 'N-Tech Solutions', gstNumber: '24AABCN1234F1Z5', customerType: 'DISTRIBUTOR',
        address: '78 Ring Road, Ahmedabad, Gujarat 380015', status: 'ACTIVE',
        followUpDate: new Date('2026-08-20'),
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Anita Verma', mobile: '9876543213', email: 'anita@smartbuy.com',
        businessName: 'SmartBuy India', customerType: 'WHOLESALE',
        address: '90 MG Road, Bangalore 560001', status: 'LEAD',
        followUpDate: new Date('2026-08-12'), notes: 'Interested in bulk laptop orders',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Vikram Joshi', mobile: '9876543214', email: 'vikram@digitalworld.in',
        businessName: 'Digital World', customerType: 'RETAIL',
        address: '34 Lajpat Nagar, New Delhi 110024', status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Deepak Reddy', mobile: '9876543215',
        businessName: 'Reddy Electronics', customerType: 'WHOLESALE',
        address: 'Jubilee Hills, Hyderabad 500033', status: 'LEAD',
        followUpDate: new Date('2026-08-18'),
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Meera Nair', mobile: '9876543216', email: 'meera@techmart.co.in',
        businessName: 'TechMart', gstNumber: '32AABCT5678G1Z8', customerType: 'DISTRIBUTOR',
        address: '56 Marine Drive, Kochi, Kerala 682001', status: 'INACTIVE',
        notes: 'Was inactive for 6 months, may resume soon',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Arjun Malhotra', mobile: '9876543217', email: 'arjun@compuzone.in',
        businessName: 'CompuZone', customerType: 'RETAIL',
        address: '12 Park Street, Kolkata 700016', status: 'ACTIVE',
      },
    }),
  ]);

  console.log('🏢 Created 8 customers');

  // --- CUSTOMER FOLLOWUPS ---
  await Promise.all([
    prisma.customerFollowup.create({
      data: {
        customerId: customers[0].id, followUpDate: new Date('2026-08-01'),
        notes: 'Discussed quarterly order. Customer wants 50 units of laptops and 100 keyboards.', createdById: sales.id,
      },
    }),
    prisma.customerFollowup.create({
      data: {
        customerId: customers[0].id, followUpDate: new Date('2026-08-05'),
        notes: 'Sent revised quotation with 10% discount for bulk order. Awaiting confirmation.', createdById: sales.id,
      },
    }),
    prisma.customerFollowup.create({
      data: {
        customerId: customers[2].id, followUpDate: new Date('2026-08-03'),
        notes: 'Product demo scheduled for next week. Interested in networking equipment.', createdById: sales.id,
      },
    }),
    prisma.customerFollowup.create({
      data: {
        customerId: customers[3].id, followUpDate: new Date('2026-08-07'),
        notes: 'Initial meeting. Very interested in bulk laptop procurement for resale.', createdById: admin.id,
      },
    }),
  ]);

  console.log('📝 Created customer followups');

  // --- PRODUCTS ---
  const products = await Promise.all([
    prisma.product.create({
      data: { productName: 'Dell Latitude 5540 Laptop', sku: 'LAP-DELL-001', category: 'Electronics', unitPrice: 52000, currentStock: 25, minimumStock: 5, warehouseLocation: 'WH-A-R1' },
    }),
    prisma.product.create({
      data: { productName: 'HP ProBook 450 G10', sku: 'LAP-HP-002', category: 'Electronics', unitPrice: 48000, currentStock: 18, minimumStock: 5, warehouseLocation: 'WH-A-R1' },
    }),
    prisma.product.create({
      data: { productName: 'Samsung 27" 4K Monitor', sku: 'MON-SAM-001', category: 'Electronics', unitPrice: 22000, currentStock: 30, minimumStock: 8, warehouseLocation: 'WH-A-R2' },
    }),
    prisma.product.create({
      data: { productName: 'LG UltraWide 34" Monitor', sku: 'MON-LG-002', category: 'Electronics', unitPrice: 35000, currentStock: 12, minimumStock: 5, warehouseLocation: 'WH-A-R2' },
    }),
    prisma.product.create({
      data: { productName: 'Logitech MX Keys Keyboard', sku: 'KEY-LOG-001', category: 'Accessories', unitPrice: 8500, currentStock: 45, minimumStock: 15, warehouseLocation: 'WH-B-R1' },
    }),
    prisma.product.create({
      data: { productName: 'Logitech MX Master 3S Mouse', sku: 'MOU-LOG-001', category: 'Accessories', unitPrice: 7200, currentStock: 3, minimumStock: 10, warehouseLocation: 'WH-B-R1' },
    }),
    prisma.product.create({
      data: { productName: 'Logitech C920 HD Webcam', sku: 'WEB-LOG-001', category: 'Accessories', unitPrice: 6500, currentStock: 20, minimumStock: 8, warehouseLocation: 'WH-B-R2' },
    }),
    prisma.product.create({
      data: { productName: 'TP-Link Archer AX73 Router', sku: 'RTR-TPL-001', category: 'Networking', unitPrice: 5800, currentStock: 15, minimumStock: 5, warehouseLocation: 'WH-C-R1' },
    }),
    prisma.product.create({
      data: { productName: 'Netgear 24-Port Switch', sku: 'SWT-NET-001', category: 'Networking', unitPrice: 12500, currentStock: 8, minimumStock: 3, warehouseLocation: 'WH-C-R1' },
    }),
    prisma.product.create({
      data: { productName: 'Cat6 Ethernet Cable 3m', sku: 'CBL-CAT6-001', category: 'Networking', unitPrice: 250, currentStock: 200, minimumStock: 50, warehouseLocation: 'WH-C-R2' },
    }),
    prisma.product.create({
      data: { productName: 'Anker USB-C Hub 7-in-1', sku: 'HUB-ANK-001', category: 'Accessories', unitPrice: 3200, currentStock: 2, minimumStock: 10, warehouseLocation: 'WH-B-R3' },
    }),
    prisma.product.create({
      data: { productName: 'Sony WH-1000XM5 Headset', sku: 'HST-SON-001', category: 'Accessories', unitPrice: 24000, currentStock: 10, minimumStock: 5, warehouseLocation: 'WH-B-R3' },
    }),
    prisma.product.create({
      data: { productName: 'APC Back-UPS 1100VA', sku: 'UPS-APC-001', category: 'Power', unitPrice: 5500, currentStock: 4, minimumStock: 5, warehouseLocation: 'WH-D-R1' },
    }),
    prisma.product.create({
      data: { productName: 'WD 1TB External HDD', sku: 'HDD-WD-001', category: 'Storage', unitPrice: 3800, currentStock: 35, minimumStock: 10, warehouseLocation: 'WH-D-R2' },
    }),
    prisma.product.create({
      data: { productName: 'Samsung 500GB SSD', sku: 'SSD-SAM-001', category: 'Storage', unitPrice: 4200, currentStock: 28, minimumStock: 10, warehouseLocation: 'WH-D-R2' },
    }),
  ]);

  console.log('📦 Created 15 products');

  // --- STOCK MOVEMENTS (initial purchases) ---
  const stockReasons = [
    { product: 0, qty: 25, reason: 'Initial purchase order PO-2026-001' },
    { product: 1, qty: 18, reason: 'Initial purchase order PO-2026-001' },
    { product: 2, qty: 30, reason: 'Initial purchase order PO-2026-002' },
    { product: 4, qty: 45, reason: 'Bulk purchase from Logitech distributor' },
    { product: 5, qty: 15, reason: 'Purchase order PO-2026-003' },
    { product: 9, qty: 200, reason: 'Bulk cable purchase' },
  ];

  for (const sm of stockReasons) {
    await prisma.stockMovement.create({
      data: {
        productId: products[sm.product].id,
        quantity: sm.qty,
        movementType: 'IN',
        reason: sm.reason,
        createdById: warehouse.id,
      },
    });
  }

  console.log('📊 Created stock movements');

  // --- CHALLANS ---
  // Challan 1: CONFIRMED (with stock deduction)
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-20260805-0001',
      customerId: customers[0].id,
      status: 'CONFIRMED',
      totalQuantity: 7,
      createdById: sales.id,
      items: {
        create: [
          { productId: products[0].id, productNameSnapshot: products[0].productName, skuSnapshot: products[0].sku, unitPriceSnapshot: products[0].unitPrice, quantity: 2 },
          { productId: products[4].id, productNameSnapshot: products[4].productName, skuSnapshot: products[4].sku, unitPriceSnapshot: products[4].unitPrice, quantity: 5 },
        ],
      },
    },
  });

  // Create OUT movements for confirmed challan (simulating the confirmation flow)
  await prisma.stockMovement.create({
    data: { productId: products[0].id, quantity: 2, movementType: 'OUT', reason: `Challan ${challan1.challanNumber} confirmed`, createdById: sales.id },
  });
  await prisma.stockMovement.create({
    data: { productId: products[4].id, quantity: 5, movementType: 'OUT', reason: `Challan ${challan1.challanNumber} confirmed`, createdById: sales.id },
  });
  // Note: In production, the confirm endpoint would deduct stock. Here we're simulating but keeping currentStock as-is since we set it directly above.

  // Challan 2: DRAFT (no stock deduction)
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-20260807-0002',
      customerId: customers[1].id,
      status: 'DRAFT',
      totalQuantity: 4,
      createdById: sales.id,
      items: {
        create: [
          { productId: products[2].id, productNameSnapshot: products[2].productName, skuSnapshot: products[2].sku, unitPriceSnapshot: products[2].unitPrice, quantity: 3 },
          { productId: products[7].id, productNameSnapshot: products[7].productName, skuSnapshot: products[7].sku, unitPriceSnapshot: products[7].unitPrice, quantity: 1 },
        ],
      },
    },
  });

  // Challan 3: CANCELLED
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-20260806-0003',
      customerId: customers[4].id,
      status: 'CANCELLED',
      totalQuantity: 2,
      createdById: admin.id,
      items: {
        create: [
          { productId: products[11].id, productNameSnapshot: products[11].productName, skuSnapshot: products[11].sku, unitPriceSnapshot: products[11].unitPrice, quantity: 2 },
        ],
      },
    },
  });

  console.log('📋 Created 3 sample challans');

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📧 Demo Credentials:');
  console.log('   Admin    → admin@fundsroom.com / Admin@123');
  console.log('   Sales    → sales@fundsroom.com / Sales@123');
  console.log('   Warehouse → warehouse@fundsroom.com / Warehouse@123');
  console.log('   Accounts → accounts@fundsroom.com / Accounts@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
