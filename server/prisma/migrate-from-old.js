/**
 * Read-only migration from the old `gym-billing-system` PostgreSQL database
 * into the new `atlas admin emp` PostgreSQL database.
 * NEVER writes to or modifies the old database.
 */
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const OLD_ROOT = 'C:\\Users\\hp\\OneDrive\\Desktop\\Staffarc\\Atlas Admin\\gym-billing-system\\server';
const OLD_ENV_PATH = path.join(OLD_ROOT, '.env');
const OLD_UPLOADS_DIR = path.join(OLD_ROOT, 'uploads');
const NEW_UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'members');

function readOldDatabaseUrl() {
  if (!fs.existsSync(OLD_ENV_PATH)) {
    throw new Error(`Old .env not found at ${OLD_ENV_PATH}`);
  }
  const content = fs.readFileSync(OLD_ENV_PATH, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      return trimmed.slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
    }
  }
  throw new Error('DATABASE_URL not found in old .env');
}

function splitName(fullName) {
  const parts = (fullName || 'Member').trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '-' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function copyMemberPhoto(photoPath) {
  if (!photoPath) return null;
  const fileName = path.basename(photoPath);
  const src = path.join(OLD_UPLOADS_DIR, fileName);
  if (!fs.existsSync(src)) return photoPath;
  fs.mkdirSync(NEW_UPLOADS_DIR, { recursive: true });
  const dest = path.join(NEW_UPLOADS_DIR, fileName);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
  return `/uploads/members/${fileName}`;
}

async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function main() {
  const oldDbUrl = readOldDatabaseUrl();
  const { PrismaClient: OldPrismaClient } = require(path.join(OLD_ROOT, 'node_modules', '@prisma', 'client'));
  const { PrismaClient: NewPrismaClient } = require(path.join(__dirname, '..', 'node_modules', '@prisma', 'client'));

  const oldPrisma = new OldPrismaClient({ datasources: { db: { url: oldDbUrl } } });
  const newPrisma = new NewPrismaClient();

  try {
    console.log('1. Reading data from old database (read-only)...');
    const [oldPlans, oldMembers, oldInvoices, oldProducts, oldOrders, oldSettings] =
      await Promise.all([
        oldPrisma.plan.findMany(),
        oldPrisma.member.findMany(),
        oldPrisma.invoice.findMany(),
        oldPrisma.cafeteriaProduct.findMany(),
        oldPrisma.cafeteriaOrder.findMany({ include: { items: true } }),
        oldPrisma.settings.findFirst(),
      ]);

    console.log({
      plans: oldPlans.length,
      members: oldMembers.length,
      invoices: oldInvoices.length,
      cafeProducts: oldProducts.length,
      cafeOrders: oldOrders.length,
      hasSettings: Boolean(oldSettings),
    });

    // 1. Plans
    const existingPlans = await withRetry(() => newPrisma.membershipPlan.findMany());
    const planIdMap = new Map();
    for (const p of oldPlans) {
      const existing = existingPlans.find((ep) => ep.id === p.id || ep.name === p.name);
      if (existing) {
        planIdMap.set(p.id, existing.id);
      } else {
        const created = await withRetry(() =>
          newPrisma.membershipPlan.create({
            data: {
              id: p.id,
              name: p.name,
              durationInMonths: p.duration,
              price: p.price,
              gstRate: p.gstRate ?? 18,
              description: p.description,
              isActive: p.isActive,
            },
          }),
        );
        planIdMap.set(p.id, created.id);
      }
    }
    console.log(`Synced ${planIdMap.size} membership plans.`);

    // 2. Members & Subscriptions (pre-fetch existing to avoid 1000+ roundtrips)
    const existingMembers = await withRetry(() =>
      newPrisma.member.findMany({ select: { id: true, memberId: true, mobile: true, email: true } }),
    );
    const existingByMemberId = new Map(existingMembers.map((m) => [m.memberId, m.id]));
    const usedMobiles = new Set(existingMembers.map((m) => m.mobile));
    const usedEmails = new Set(existingMembers.map((m) => m.email).filter(Boolean));

    const existingSubs = await withRetry(() =>
      newPrisma.memberSubscription.findMany({ select: { memberId: true, planId: true } }),
    );
    const subKeys = new Set(existingSubs.map((s) => `${s.memberId}:${s.planId}`));

    const memberIdMap = new Map();
    const newMembersBatch = [];
    const newSubsBatch = [];

    for (const m of oldMembers) {
      let targetId = existingByMemberId.get(m.memberId);
      if (!targetId) {
        const { firstName, lastName } = splitName(m.name);
        let mobile = (m.phone || '').trim() || `LEGACY-${m.memberId}`;
        if (usedMobiles.has(mobile)) mobile = `${mobile}-${m.memberId}`;
        usedMobiles.add(mobile);

        let email = m.email ? m.email.trim() : null;
        if (email && usedEmails.has(email)) email = null;
        if (email) usedEmails.add(email);

        targetId = m.id;
        newMembersBatch.push({
          id: m.id,
          memberId: m.memberId,
          firstName,
          lastName,
          email,
          mobile,
          gender: m.gender || null,
          dateOfBirth: m.dob || null,
          profilePicture: copyMemberPhoto(m.photo),
          height: m.height,
          weight: m.weight,
          workoutType: m.workoutType,
          gstNumber: m.gstNumber,
          panNumber: m.panNumber,
          status: m.status || 'ACTIVE',
          joiningDate: m.createdAt || new Date(),
        });
      }
      memberIdMap.set(m.id, targetId);

      const mappedPlanId = m.planId ? planIdMap.get(m.planId) : null;
      if (mappedPlanId && m.planStartDate && m.planEndDate) {
        const key = `${targetId}:${mappedPlanId}`;
        if (!subKeys.has(key)) {
          subKeys.add(key);
          newSubsBatch.push({
            memberId: targetId,
            planId: mappedPlanId,
            startDate: m.planStartDate,
            endDate: m.planEndDate,
            status: m.status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
          });
        }
      }
    }

    if (newMembersBatch.length > 0) {
      await withRetry(() => newPrisma.member.createMany({ data: newMembersBatch, skipDuplicates: true }));
    }
    if (newSubsBatch.length > 0) {
      await withRetry(() => newPrisma.memberSubscription.createMany({ data: newSubsBatch, skipDuplicates: true }));
    }
    console.log(`Synced ${memberIdMap.size} members (${newMembersBatch.length} newly added, ${newSubsBatch.length} subscriptions added).`);

    // 3. Invoices (fixing PAID with paidAmount = 0 bug during migration)
    const existingInvs = await withRetry(() =>
      newPrisma.invoice.findMany({ select: { invoiceNumber: true } }),
    );
    const existingInvNums = new Set(existingInvs.map((i) => i.invoiceNumber).filter(Boolean));
    const newInvoicesBatch = [];

    for (const inv of oldInvoices) {
      const mappedMemberId = memberIdMap.get(inv.memberId);
      if (!mappedMemberId) continue;
      if (inv.invoiceNumber && existingInvNums.has(inv.invoiceNumber)) continue;
      if (inv.invoiceNumber) existingInvNums.add(inv.invoiceNumber);

      const fixedPaidAmount =
        inv.paymentStatus === 'PAID' && (!inv.paidAmount || inv.paidAmount === 0)
          ? inv.totalAmount
          : inv.paidAmount || 0;

      newInvoicesBatch.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        memberId: mappedMemberId,
        planId: inv.planId ? planIdMap.get(inv.planId) || null : null,
        memberGstNumber: inv.memberGstNumber,
        memberPanNumber: inv.memberPanNumber,
        memberAddress: inv.memberAddress,
        amount: inv.amount,
        gstRate: 18,
        gstAmount: inv.gstAmount || 0,
        cgst: inv.cgst || 0,
        sgst: inv.sgst || 0,
        lateFee: inv.lateFee || 0,
        discount: inv.discount || 0,
        discountType: inv.discountType,
        totalAmount: inv.totalAmount,
        paidAmount: fixedPaidAmount,
        dueDate: inv.dueDate,
        paidDate: inv.paidDate,
        status: inv.paymentStatus || 'PENDING',
        paymentMethod: inv.paymentMethod,
        razorpayOrderId: inv.razorpayOrderId,
        razorpayPaymentId: inv.razorpayPaymentId,
        transactionReference: inv.razorpayPaymentId,
        createdAt: inv.createdAt,
      });
    }

    if (newInvoicesBatch.length > 0) {
      await withRetry(() => newPrisma.invoice.createMany({ data: newInvoicesBatch, skipDuplicates: true }));
    }
    console.log(`Migrated ${newInvoicesBatch.length} invoices.`);

    // 4. Cafeteria Products
    const existingCafeItems = await withRetry(() => newPrisma.cafeItem.findMany({ select: { id: true, name: true } }));
    const cafeItemMap = new Map();
    const newCafeItemsBatch = [];

    for (const prod of oldProducts) {
      const existing = existingCafeItems.find((ci) => ci.name === prod.name || ci.id === prod.id);
      if (existing) {
        cafeItemMap.set(prod.id, existing.id);
      } else {
        cafeItemMap.set(prod.id, prod.id);
        newCafeItemsBatch.push({
          id: prod.id,
          name: prod.name,
          description: prod.description,
          category: prod.category,
          price: prod.price,
          gstRate: prod.gstRate ?? 0,
          images: prod.images || [],
          imageUrl: prod.images?.[0] || null,
          stock: prod.stock ?? 0,
          isAvailable: prod.isAvailable ?? true,
        });
      }
    }
    if (newCafeItemsBatch.length > 0) {
      await withRetry(() => newPrisma.cafeItem.createMany({ data: newCafeItemsBatch, skipDuplicates: true }));
    }
    console.log(`Synced ${cafeItemMap.size} cafeteria products (${newCafeItemsBatch.length} newly added).`);

    // 5. Cafeteria Orders
    const existingOrders = await withRetry(() => newPrisma.cafeOrder.findMany({ select: { orderNumber: true } }));
    const existingOrderNums = new Set(existingOrders.map((o) => o.orderNumber));
    let migratedOrders = 0;

    for (const ord of oldOrders) {
      if (existingOrderNums.has(ord.orderNumber)) continue;

      const validItems = ord.items
        .map((it) => {
          const itemId = cafeItemMap.get(it.productId);
          if (!itemId) return null;
          return {
            itemId,
            productName: it.productName,
            quantity: it.quantity,
            price: it.price,
            gstRate: it.gstRate ?? 0,
            amount: it.amount,
          };
        })
        .filter(Boolean);

      await withRetry(() =>
        newPrisma.cafeOrder.create({
          data: {
            id: ord.id,
            orderNumber: ord.orderNumber,
            subtotal: ord.subtotal,
            gstAmount: ord.gstAmount,
            cgst: ord.cgst,
            sgst: ord.sgst,
            discount: ord.discount || 0,
            discountType: ord.discountType,
            totalAmount: ord.totalAmount,
            paidAmount: ord.paidAmount || 0,
            paymentStatus: ord.paymentStatus || 'PENDING',
            paymentMethod: ord.paymentMethod,
            razorpayOrderId: ord.razorpayOrderId,
            razorpayPaymentId: ord.razorpayPaymentId,
            status: ord.paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING',
            customerName: ord.customerName,
            customerPhone: ord.customerPhone,
            createdAt: ord.createdAt,
            items: { create: validItems },
          },
        }),
      );
      migratedOrders++;
    }
    console.log(`Migrated ${migratedOrders} cafeteria orders.`);

    // 6. Settings -> Owner CompanySettings
    if (oldSettings) {
      const ownerSettings = await withRetry(() => newPrisma.companySettings.findFirst());
      if (ownerSettings) {
        await withRetry(() =>
          newPrisma.companySettings.update({
            where: { id: ownerSettings.id },
            data: {
              companyName: oldSettings.gymName || ownerSettings.companyName,
              gstNumber: oldSettings.gstNumber,
              address: oldSettings.address,
              companyContact: oldSettings.phone || ownerSettings.companyContact,
              email: oldSettings.email,
              emailNotifications: oldSettings.emailNotifications,
              razorpayKeyId: oldSettings.razorpayKeyId,
              razorpayKeySecret: oldSettings.razorpayKeySecret,
              smtpHost: oldSettings.smtpHost,
              smtpPort: oldSettings.smtpPort,
              smtpUser: oldSettings.smtpUser,
              smtpPass: oldSettings.smtpPass,
            },
          }),
        );
        console.log('Synced CompanySettings from old Settings.');
      }
    }

    console.log('Migration completed successfully!');
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
