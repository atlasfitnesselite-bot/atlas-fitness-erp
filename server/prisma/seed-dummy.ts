import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('=== SEEDING COMPREHENSIVE DUMMY DATA ===\n');

  // ============================================
  // 1. GET EXISTING USERS & EMPLOYEES
  // ============================================
  const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@atlasfitness.com' } });
  const managerUser = await prisma.user.findUnique({ where: { email: 'manager@atlasfitness.com' } });
  const trainerUser = await prisma.user.findUnique({ where: { email: 'trainer@atlasfitness.com' } });

  if (!ownerUser || !managerUser || !trainerUser) {
    console.error('Base users not found. Run the main seed first: npx prisma db seed');
    process.exit(1);
  }

  const ownerEmployee = await prisma.employee.findFirst({ where: { userId: ownerUser.id } });
  const managerEmployee = await prisma.employee.findFirst({ where: { userId: managerUser.id } });
  const trainerEmployee = await prisma.employee.findFirst({ where: { userId: trainerUser.id } });

  if (!ownerEmployee || !managerEmployee || !trainerEmployee) {
    console.error('Base employee profiles not found.');
    process.exit(1);
  }

  console.log('✅ Found existing users & employees\n');

  // ============================================
  // 2. DEPARTMENTS (3)
  // ============================================
  const departments = [
    { name: 'Fitness & Training', code: 'FIT', description: 'All gym trainers and fitness coaches', managerId: trainerEmployee.id },
    { name: 'Operations', code: 'OPS', description: 'Front desk, reception, and facility management' },
    { name: 'Administration', code: 'ADM', description: 'HR, payroll, and business administration', managerId: managerEmployee.id },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  const allDepts = await prisma.department.findMany();
  console.log(`✅ Departments: ${allDepts.length} total`);

  // ============================================
  // 3. DESIGNATIONS (3)
  // ============================================
  const designations = [
    { name: 'Senior Fitness Trainer', level: 'L3', description: 'Experienced certified personal trainer' },
    { name: 'Front Desk Executive', level: 'L1', description: 'Handles reception and member queries' },
    { name: 'Gym Manager', level: 'L4', description: 'Overall gym operations manager' },
  ];

  for (const d of designations) {
    await prisma.designation.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
  }
  const allDesig = await prisma.designation.findMany();
  console.log(`✅ Designations: ${allDesig.length} total`);

  // ============================================
  // 4. EMPLOYMENT TYPES (3)
  // ============================================
  const empTypes = [
    { name: 'Full-Time', description: 'Regular 40 hours/week employment' },
    { name: 'Part-Time', description: '20 hours/week flexible schedule' },
    { name: 'Contract', description: 'Fixed term project-based engagement' },
  ];

  for (const et of empTypes) {
    await prisma.employmentType.upsert({
      where: { name: et.name },
      update: {},
      create: et,
    });
  }
  const allEmpTypes = await prisma.employmentType.findMany();
  console.log(`✅ Employment Types: ${allEmpTypes.length} total`);

  // Update existing employees with dept/desig
  const fitDept = allDepts.find(d => d.code === 'FIT');
  const opsDept = allDepts.find(d => d.code === 'OPS');
  const admDept = allDepts.find(d => d.code === 'ADM');
  const trainerDesig = allDesig.find(d => d.name === 'Senior Fitness Trainer');
  const managerDesig = allDesig.find(d => d.name === 'Gym Manager');
  const receptionDesig = allDesig.find(d => d.name === 'Front Desk Executive');
  const fullTimeType = allEmpTypes.find(t => t.name === 'Full-Time');

  if (fitDept && trainerDesig && fullTimeType) {
    await prisma.employee.update({
      where: { id: trainerEmployee.id },
      data: { departmentId: fitDept.id, designationId: trainerDesig.id, employmentTypeId: fullTimeType.id },
    });
  }
  if (admDept && managerDesig && fullTimeType) {
    await prisma.employee.update({
      where: { id: managerEmployee.id },
      data: { departmentId: admDept.id, designationId: managerDesig.id, employmentTypeId: fullTimeType.id },
    });
    await prisma.employee.update({
      where: { id: ownerEmployee.id },
      data: { departmentId: admDept.id, designationId: managerDesig.id, employmentTypeId: fullTimeType.id },
    });
  }

  // ============================================
  // 5. ADDITIONAL EMPLOYEES (3 more)
  // ============================================
  const additionalStaff = [
    { role: 'RECEPTION', name: 'Anita Desai', email: 'reception@atlasfitness.com', pin: '5678', empId: 'EMP-004' },
    { role: 'CAFE', name: 'Ravi Kumar', email: 'cafe@atlasfitness.com', pin: '8765', empId: 'EMP-005' },
    { role: 'CLEANING', name: 'Suresh Patil', email: 'cleaning@atlasfitness.com', pin: '9999', empId: 'EMP-006' },
  ];

  for (const staff of additionalStaff) {
    const existingUser = await prisma.user.findUnique({ where: { email: staff.email } });
    if (existingUser) {
      console.log(`  ⏭️  User ${staff.email} already exists, skipping`);
      continue;
    }

    const role = await prisma.role.findUnique({ where: { name: staff.role } });
    if (!role) continue;

    const hashedPassword = await bcrypt.hash('Password123', 10);
    const nameParts = staff.name.split(' ');

    const user = await prisma.user.create({
      data: {
        name: staff.name,
        email: staff.email,
        password: hashedPassword,
        userRoles: { create: { roleId: role.id } },
      },
    });

    await prisma.employee.create({
      data: {
        employeeId: staff.empId,
        firstName: nameParts[0],
        lastName: nameParts[1] || '',
        email: staff.email,
        hashedPin: await bcrypt.hash(staff.pin, 10),
        joiningDate: new Date('2024-06-01'),
        userId: user.id,
        status: 'ACTIVE',
        departmentId: opsDept?.id,
        designationId: receptionDesig?.id,
        employmentTypeId: fullTimeType?.id,
        mobile: staff.role === 'RECEPTION' ? '9876543210' : staff.role === 'CAFE' ? '9876543211' : '9876543212',
        gender: staff.role === 'RECEPTION' ? 'Female' : 'Male',
      },
    });
    console.log(`✅ Created ${staff.role} staff: ${staff.email} (PIN: ${staff.pin})`);
  }

  const allEmployees = await prisma.employee.findMany();
  console.log(`✅ Total Employees: ${allEmployees.length}`);

  // ============================================
  // 6. SHIFTS (3)
  // ============================================
  const shifts = [
    { name: 'Morning Shift', code: 'MORN', color: '#22c55e', type: 'MORNING', startTime: '06:00', endTime: '14:00', description: 'Early morning gym opening shift' },
    { name: 'Evening Shift', code: 'EVE', color: '#f59e0b', type: 'EVENING', startTime: '14:00', endTime: '22:00', description: 'Afternoon to evening shift' },
    { name: 'Night Shift', code: 'NIGHT', color: '#8b5cf6', type: 'NIGHT', startTime: '22:00', endTime: '06:00', description: 'Late night maintenance and security shift' },
  ];

  for (const s of shifts) {
    await prisma.shift.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }
  const allShifts = await prisma.shift.findMany();
  console.log(`✅ Shifts: ${allShifts.length} total`);

  // ============================================
  // 7. SHIFT ASSIGNMENTS (3)
  // ============================================
  const morningShift = allShifts.find(s => s.code === 'MORN');
  const eveningShift = allShifts.find(s => s.code === 'EVE');

  if (morningShift && eveningShift) {
    // Clear existing assignments
    await prisma.shiftAssignment.deleteMany({});

    const assignData = [
      { employeeId: trainerEmployee.id, shiftId: morningShift.id, startDate: new Date('2026-07-01') },
      { employeeId: managerEmployee.id, shiftId: morningShift.id, startDate: new Date('2026-07-01') },
      { employeeId: allEmployees.find(e => e.employeeId === 'EMP-004')?.id || ownerEmployee.id, shiftId: eveningShift.id, startDate: new Date('2026-07-01') },
    ];

    for (const a of assignData) {
      await prisma.shiftAssignment.create({ data: a });
    }
    console.log('✅ Shift Assignments: 3 created');
  }

  // ============================================
  // 8. ATTENDANCE (3 records for today)
  // ============================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceData = [
    {
      employeeId: trainerEmployee.id,
      date: today,
      clockIn: new Date(today.getTime() + 6 * 3600000),   // 6:00 AM
      clockOut: new Date(today.getTime() + 14 * 3600000),  // 2:00 PM
      workingHours: 8,
      status: 'PRESENT',
    },
    {
      employeeId: managerEmployee.id,
      date: today,
      clockIn: new Date(today.getTime() + 9 * 3600000),   // 9:00 AM
      clockOut: new Date(today.getTime() + 17 * 3600000),  // 5:00 PM
      workingHours: 8,
      status: 'PRESENT',
    },
    {
      employeeId: ownerEmployee.id,
      date: today,
      clockIn: new Date(today.getTime() + 8 * 3600000),   // 8:00 AM
      status: 'PRESENT',
      workingHours: 0,
    },
  ];

  for (const att of attendanceData) {
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: att.employeeId, date: att.date } },
      update: att,
      create: att,
    });
  }
  console.log('✅ Attendance: 3 records for today');

  // ============================================
  // 9. LEAVE TYPES (3)
  // ============================================
  const leaveTypes = [
    { name: 'Casual Leave', code: 'CL', isPaid: true, maxDaysPerYear: 12, carryForwardAllowed: false, description: 'For personal needs' },
    { name: 'Sick Leave', code: 'SL', isPaid: true, maxDaysPerYear: 10, carryForwardAllowed: true, description: 'Medical illness leave' },
    { name: 'Annual Leave', code: 'AL', isPaid: true, maxDaysPerYear: 15, carryForwardAllowed: true, encashmentAllowed: true, description: 'Planned vacation leave' },
  ];

  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: {},
      create: lt,
    });
  }
  const allLeaveTypes = await prisma.leaveType.findMany();
  console.log(`✅ Leave Types: ${allLeaveTypes.length} total`);

  // ============================================
  // 10. LEAVE BALANCES (for first 3 employees)
  // ============================================
  const year = 2026;
  for (const emp of [trainerEmployee, managerEmployee, ownerEmployee]) {
    for (const lt of allLeaveTypes) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: lt.id, year } },
        update: {},
        create: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year,
          allocated: lt.maxDaysPerYear,
          used: Math.floor(Math.random() * 3),
          balance: lt.maxDaysPerYear - Math.floor(Math.random() * 3),
        },
      });
    }
  }
  console.log('✅ Leave Balances: allocated for 3 employees');

  // ============================================
  // 11. LEAVE REQUESTS (3)
  // ============================================
  const cl = allLeaveTypes.find(lt => lt.code === 'CL');
  const sl = allLeaveTypes.find(lt => lt.code === 'SL');
  const al = allLeaveTypes.find(lt => lt.code === 'AL');

  if (cl && sl && al) {
    const leaveRequests = [
      { employeeId: trainerEmployee.id, leaveTypeId: cl.id, fromDate: new Date('2026-08-01'), toDate: new Date('2026-08-02'), reason: 'Family function', status: 'APPROVED' },
      { employeeId: managerEmployee.id, leaveTypeId: sl.id, fromDate: new Date('2026-07-28'), toDate: new Date('2026-07-28'), reason: 'Not feeling well', status: 'PENDING', isHalfDay: true },
      { employeeId: ownerEmployee.id, leaveTypeId: al.id, fromDate: new Date('2026-08-15'), toDate: new Date('2026-08-20'), reason: 'Annual vacation trip', status: 'APPROVED' },
    ];

    // Clear existing
    await prisma.leaveRequest.deleteMany({});
    for (const lr of leaveRequests) {
      await prisma.leaveRequest.create({ data: lr });
    }
    console.log('✅ Leave Requests: 3 created');
  }

  // ============================================
  // 12. HOLIDAYS (3)
  // ============================================
  await prisma.holiday.deleteMany({});
  const holidays = [
    { name: 'Independence Day', date: new Date('2026-08-15'), description: 'National holiday' },
    { name: 'Gandhi Jayanti', date: new Date('2026-10-02'), description: 'National holiday' },
    { name: 'Diwali', date: new Date('2026-10-20'), description: 'Festival of lights' },
  ];

  for (const h of holidays) {
    await prisma.holiday.create({ data: h });
  }
  console.log('✅ Holidays: 3 created');

  // ============================================
  // 13. MEMBERS (3)
  // ============================================
  const members = [
    {
      memberId: 'MEM-001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      gender: 'Male',
      dateOfBirth: new Date('1995-03-15'),
      bloodGroup: 'O+',
      nationality: 'Indian',
      occupation: 'Software Engineer',
      mobile: '9998887770',
      email: 'rahul.sharma@gmail.com',
      branch: 'Main Branch',
      status: 'ACTIVE',
    },
    {
      memberId: 'MEM-002',
      firstName: 'Priya',
      lastName: 'Patel',
      gender: 'Female',
      dateOfBirth: new Date('1998-07-22'),
      bloodGroup: 'A+',
      nationality: 'Indian',
      occupation: 'Marketing Executive',
      mobile: '9998887771',
      email: 'priya.patel@gmail.com',
      branch: 'Main Branch',
      status: 'ACTIVE',
    },
    {
      memberId: 'MEM-003',
      firstName: 'Vikram',
      lastName: 'Singh',
      gender: 'Male',
      dateOfBirth: new Date('1990-11-08'),
      bloodGroup: 'B+',
      nationality: 'Indian',
      occupation: 'Business Owner',
      mobile: '9998887772',
      email: 'vikram.singh@gmail.com',
      branch: 'Main Branch',
      status: 'ACTIVE',
    },
  ];

  for (const m of members) {
    await prisma.member.upsert({
      where: { memberId: m.memberId },
      update: {},
      create: {
        ...m,
        timeline: {
          create: { event: 'Profile Created', description: 'Member registered via seed data' },
        },
        statusHistory: {
          create: { newStatus: 'ACTIVE', reason: 'Initial Registration' },
        },
      },
    });
  }
  const allMembers = await prisma.member.findMany();
  console.log(`✅ Members: ${allMembers.length} total`);

  // ============================================
  // 14. MEMBERSHIP PLANS (3)
  // ============================================
  const plans = [
    { name: 'Basic Monthly', durationInMonths: 1, price: 1500, description: 'Access to gym floor and basic equipment' },
    { name: 'Premium Quarterly', durationInMonths: 3, price: 4000, description: 'Full gym + group classes + locker' },
    { name: 'VIP Annual', durationInMonths: 12, price: 12000, description: 'All access + PT sessions + spa + diet plan' },
  ];

  // Clear existing
  await prisma.membershipPlan.deleteMany({});
  for (const p of plans) {
    await prisma.membershipPlan.create({ data: p });
  }
  const allPlans = await prisma.membershipPlan.findMany();
  console.log(`✅ Membership Plans: ${allPlans.length} total`);

  // ============================================
  // 15. MEMBER SUBSCRIPTIONS (3)
  // ============================================
  await prisma.memberSubscription.deleteMany({});
  const subscriptions = [
    { memberId: allMembers[0].id, planId: allPlans[2].id, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE' },
    { memberId: allMembers[1].id, planId: allPlans[1].id, startDate: new Date('2026-07-01'), endDate: new Date('2026-09-30'), status: 'ACTIVE' },
    { memberId: allMembers[2].id, planId: allPlans[0].id, startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30'), status: 'EXPIRED' },
  ];

  for (const sub of subscriptions) {
    await prisma.memberSubscription.create({ data: sub });
  }
  const allSubs = await prisma.memberSubscription.findMany();
  console.log(`✅ Member Subscriptions: ${allSubs.length} total`);

  // ============================================
  // 16. INVOICES (3)
  // ============================================
  await prisma.invoice.deleteMany({});
  const invoices = [
    { memberId: allMembers[0].id, subscriptionId: allSubs[0].id, amount: 12000, dueDate: new Date('2026-01-05'), status: 'PAID', paymentMethod: 'UPI' },
    { memberId: allMembers[1].id, subscriptionId: allSubs[1].id, amount: 4000, dueDate: new Date('2026-07-05'), status: 'PENDING' },
    { memberId: allMembers[2].id, subscriptionId: allSubs[2].id, amount: 1500, dueDate: new Date('2026-06-05'), status: 'OVERDUE' },
  ];

  for (const inv of invoices) {
    await prisma.invoice.create({ data: inv });
  }
  console.log('✅ Invoices: 3 created');

  // ============================================
  // 17. PT PACKAGES (3)
  // ============================================
  await prisma.pTPackage.deleteMany({});
  const ptPackages = [
    { name: 'Starter Pack', numberOfSessions: 10, price: 5000 },
    { name: 'Transformation Pack', numberOfSessions: 30, price: 12000 },
    { name: 'Elite Coaching', numberOfSessions: 60, price: 20000 },
  ];

  for (const pkg of ptPackages) {
    await prisma.pTPackage.create({ data: pkg });
  }
  console.log('✅ PT Packages: 3 created');

  // ============================================
  // 18. PT SESSIONS (3)
  // ============================================
  await prisma.pTSession.deleteMany({});
  const ptSessions = [
    { trainerId: trainerEmployee.id, memberId: allMembers[0].id, date: new Date('2026-07-23'), startTime: '07:00', endTime: '08:00', status: 'SCHEDULED', notes: 'Upper body strength training' },
    { trainerId: trainerEmployee.id, memberId: allMembers[1].id, date: new Date('2026-07-23'), startTime: '09:00', endTime: '10:00', status: 'SCHEDULED', notes: 'Cardio and flexibility' },
    { trainerId: trainerEmployee.id, memberId: allMembers[2].id, date: new Date('2026-07-22'), startTime: '06:00', endTime: '07:00', status: 'COMPLETED', notes: 'Leg day workout completed' },
  ];

  for (const sess of ptSessions) {
    await prisma.pTSession.create({ data: sess });
  }
  console.log('✅ PT Sessions: 3 created');

  // ============================================
  // 19. FITNESS PLANS (3)
  // ============================================
  await prisma.fitnessPlan.deleteMany({});
  const fitnessPlans = [
    {
      memberId: allMembers[0].id,
      trainerId: trainerEmployee.id,
      type: 'WORKOUT',
      title: 'Muscle Building - Week 1',
      content: JSON.stringify({
        days: [
          { day: 'Monday', exercises: ['Bench Press 4x12', 'Incline Dumbbell Press 3x10', 'Cable Flyes 3x15'] },
          { day: 'Wednesday', exercises: ['Squats 4x10', 'Leg Press 3x12', 'Lunges 3x15'] },
          { day: 'Friday', exercises: ['Deadlift 4x8', 'Barbell Row 3x10', 'Lat Pulldown 3x12'] },
        ],
      }),
    },
    {
      memberId: allMembers[1].id,
      trainerId: trainerEmployee.id,
      type: 'DIET',
      title: 'Weight Loss Diet Plan',
      content: JSON.stringify({
        meals: [
          { time: '7:00 AM', meal: 'Oatmeal with berries, 2 eggs' },
          { time: '1:00 PM', meal: 'Grilled chicken salad with olive oil' },
          { time: '7:00 PM', meal: 'Brown rice, dal, vegetables' },
        ],
        notes: 'Drink 3L water daily. Avoid sugar.',
      }),
    },
    {
      memberId: allMembers[2].id,
      trainerId: trainerEmployee.id,
      type: 'WORKOUT',
      title: 'Cardio Endurance Program',
      content: JSON.stringify({
        days: [
          { day: 'Tuesday', exercises: ['Treadmill 30min', 'Jump Rope 15min', 'Burpees 3x20'] },
          { day: 'Thursday', exercises: ['Cycling 45min', 'Box Jumps 3x15', 'Mountain Climbers 3x20'] },
        ],
      }),
    },
  ];

  for (const fp of fitnessPlans) {
    await prisma.fitnessPlan.create({ data: fp });
  }
  console.log('✅ Fitness Plans: 3 created');

  // ============================================
  // 20. PAYROLL STRUCTURES (3)
  // ============================================
  await prisma.payrollStructure.deleteMany({});
  const payrollStructures = [
    {
      employeeId: trainerEmployee.id,
      baseSalary: 35000,
      standardAllowances: JSON.stringify({ HRA: 8000, transport: 3000, fitness: 2000 }),
      standardDeductions: JSON.stringify({ PF: 4200, tax: 2500 }),
    },
    {
      employeeId: managerEmployee.id,
      baseSalary: 55000,
      standardAllowances: JSON.stringify({ HRA: 12000, transport: 5000, management: 5000 }),
      standardDeductions: JSON.stringify({ PF: 6600, tax: 5000 }),
    },
    {
      employeeId: ownerEmployee.id,
      baseSalary: 100000,
      standardAllowances: JSON.stringify({ HRA: 20000, transport: 8000, executive: 10000 }),
      standardDeductions: JSON.stringify({ PF: 12000, tax: 15000 }),
    },
  ];

  for (const ps of payrollStructures) {
    await prisma.payrollStructure.create({ data: ps });
  }
  console.log('✅ Payroll Structures: 3 created');

  // ============================================
  // 21. SALARY SLIPS (3)
  // ============================================
  await prisma.salarySlip.deleteMany({});
  const salarySlips = [
    { employeeId: trainerEmployee.id, month: 6, year: 2026, grossPay: 48000, netPay: 41300, status: 'PAID' },
    { employeeId: managerEmployee.id, month: 6, year: 2026, grossPay: 77000, netPay: 65400, status: 'PAID' },
    { employeeId: ownerEmployee.id, month: 6, year: 2026, grossPay: 138000, netPay: 111000, status: 'PAID' },
  ];

  for (const ss of salarySlips) {
    await prisma.salarySlip.create({ data: ss });
  }
  console.log('✅ Salary Slips: 3 created');

  // ============================================
  // 22. EXPENSE CATEGORIES (3)
  // ============================================
  const expenseCategories = [
    { name: 'Equipment Maintenance', description: 'Gym equipment repairs and servicing' },
    { name: 'Utilities', description: 'Electricity, water, internet bills' },
    { name: 'Supplies', description: 'Cleaning supplies, towels, toiletries' },
  ];

  for (const ec of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name: ec.name },
      update: {},
      create: ec,
    });
  }
  const allCategories = await prisma.expenseCategory.findMany();
  console.log(`✅ Expense Categories: ${allCategories.length} total`);

  // ============================================
  // 23. EXPENSES (3)
  // ============================================
  await prisma.expense.deleteMany({});
  const expenses = [
    { categoryId: allCategories[0].id, amount: 15000, description: 'Treadmill belt replacement', date: new Date('2026-07-20'), recordedById: ownerUser.id },
    { categoryId: allCategories[1].id, amount: 28000, description: 'July electricity bill', date: new Date('2026-07-15'), recordedById: managerUser.id },
    { categoryId: allCategories[2].id, amount: 5500, description: 'Monthly cleaning supplies restock', date: new Date('2026-07-18'), recordedById: managerUser.id },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }
  console.log('✅ Expenses: 3 created');

  // ============================================
  // 24. ASSETS (3)
  // ============================================
  await prisma.asset.deleteMany({});
  const assets = [
    {
      name: 'Commercial Treadmill - Life Fitness T5',
      category: 'EQUIPMENT',
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 250000,
      status: 'ACTIVE',
      vendor: 'Life Fitness India',
      lastMaintenanceDate: new Date('2026-06-15'),
      nextMaintenanceDate: new Date('2026-09-15'),
    },
    {
      name: 'Smith Machine - Hammer Strength',
      category: 'EQUIPMENT',
      purchaseDate: new Date('2024-03-10'),
      purchasePrice: 180000,
      status: 'ACTIVE',
      vendor: 'Hammer Strength Dealers',
      lastMaintenanceDate: new Date('2026-05-01'),
      nextMaintenanceDate: new Date('2026-08-01'),
    },
    {
      name: 'Reception Desk Computer',
      category: 'IT',
      purchaseDate: new Date('2025-06-01'),
      purchasePrice: 65000,
      status: 'ACTIVE',
      vendor: 'Dell India',
    },
  ];

  for (const a of assets) {
    await prisma.asset.create({ data: a });
  }
  console.log('✅ Assets: 3 created');

  // ============================================
  // 25. MEMBER CHECK-INS (3)
  // ============================================
  await prisma.memberCheckIn.deleteMany({});
  const checkIns = [
    { memberId: allMembers[0].id, timestamp: new Date(today.getTime() + 6 * 3600000) },
    { memberId: allMembers[1].id, timestamp: new Date(today.getTime() + 7 * 3600000) },
    { memberId: allMembers[2].id, timestamp: new Date(today.getTime() + 17 * 3600000) },
  ];

  for (const ci of checkIns) {
    await prisma.memberCheckIn.create({ data: ci });
  }
  console.log('✅ Member Check-ins: 3 created');

  // ============================================
  // 26. NOTIFICATIONS (3)
  // ============================================
  await prisma.notification.deleteMany({});
  const notifications = [
    { title: 'New Member Registered', message: 'Rahul Sharma has joined Atlas Fitness!', type: 'Member', userId: ownerUser.id },
    { title: 'Payment Overdue', message: 'Invoice for Vikram Singh is overdue by 23 days.', type: 'Billing', userId: ownerUser.id },
    { title: 'Equipment Maintenance Due', message: 'Smith Machine needs maintenance by Aug 1, 2026.', type: 'Asset', userId: managerUser.id },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log('✅ Notifications: 3 created');

  // ============================================
  // 27. TRAINER COMMISSIONS (3)
  // ============================================
  await prisma.trainerCommission.deleteMany({});
  const commissions = [
    { trainerId: trainerEmployee.id, sourceId: 'PT-Session-001', amount: 500, status: 'PAID' },
    { trainerId: trainerEmployee.id, sourceId: 'PT-Session-002', amount: 500, status: 'PENDING' },
    { trainerId: trainerEmployee.id, sourceId: 'PT-Session-003', amount: 750, status: 'PENDING' },
  ];

  for (const c of commissions) {
    await prisma.trainerCommission.create({ data: c });
  }
  console.log('✅ Trainer Commissions: 3 created');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n========================================');
  console.log('🎉 ALL DUMMY DATA SEEDED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`
Summary of seeded data:
  • Departments:          3
  • Designations:         3
  • Employment Types:     3
  • Employees:            ${allEmployees.length} (3 existing + 3 new)
  • Shifts:               3
  • Shift Assignments:    3
  • Attendance Records:   3 (today)
  • Leave Types:          3
  • Leave Balances:       9 (3 employees × 3 types)
  • Leave Requests:       3
  • Holidays:             3
  • Members:              3
  • Membership Plans:     3
  • Subscriptions:        3
  • Invoices:             3
  • PT Packages:          3
  • PT Sessions:          3
  • Fitness Plans:        3
  • Payroll Structures:   3
  • Salary Slips:         3
  • Expense Categories:   3
  • Expenses:             3
  • Assets:               3
  • Member Check-ins:     3
  • Notifications:        3
  • Trainer Commissions:  3

Login credentials:
  • Owner:     owner@atlasfitness.com    / Password123
  • Manager:   manager@atlasfitness.com  / Password123
  • Trainer:   trainer@atlasfitness.com  / Password123
  • Reception: reception@atlasfitness.com / Password123
  • Cafe:      cafe@atlasfitness.com     / Password123
  • Cleaning:  cleaning@atlasfitness.com / Password123
`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
