import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CafeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  // --- Menu & Inventory ---
  async getMenu() {
    return this.prisma.cafeItem.findMany({
      include: { transactions: true },
      orderBy: { name: 'asc' },
    });
  }

  async createMenuItem(data: any) {
    return this.prisma.cafeItem.create({
      data,
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.prisma.cafeItem.update({
      where: { id },
      data,
    });
  }

  async getInventoryTransactions() {
    return this.prisma.cafeInventoryTransaction.findMany({
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStock(data: { itemId: string, quantity: number, type: string, notes?: string }) {
    // Determine quantity modification
    const modQuantity = (data.type === 'OUT' || data.type === 'SPOILAGE') ? -Math.abs(data.quantity) : data.quantity;

    // Use a transaction
    return this.prisma.$transaction(async (prisma) => {
      const item = await prisma.cafeItem.findUnique({ where: { id: data.itemId } });
      if (!item) throw new Error('CafeItem not found');

      // create transaction
      const transaction = await prisma.cafeInventoryTransaction.create({
        data: {
          itemId: data.itemId,
          quantity: data.quantity,
          type: data.type,
          notes: data.notes,
        },
      });

      // update stock
      const updatedItem = await prisma.cafeItem.update({
        where: { id: data.itemId },
        data: { stock: { increment: modQuantity } },
      });

      if (updatedItem.stock < 10) {
        this.notificationsService.broadcastToRole({
          title: 'Inventory Low',
          message: `${updatedItem.name} stock is critically low (${updatedItem.stock} remaining).`,
          type: 'WARNING',
          targetRole: 'MANAGER',
        }).catch(console.error);
      }

      return transaction;
    });
  }

  // --- Suppliers ---
  async getSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(data: any) {
    return this.prisma.supplier.create({
      data,
    });
  }

  async updateSupplier(id: string, data: any) {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  // --- Orders ---
  async getOrders() {
    return this.prisma.cafeOrder.findMany({
      include: { items: { include: { item: true } }, member: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(data: { items: any[], customerName?: string, memberId?: string, tableNumber?: string }) {
    let totalAmount = 0;
    
    // Calculate total amount
    for (const i of data.items) {
      totalAmount += i.price * i.quantity;
    }

    // Auto-generate order number
    const orderCount = await this.prisma.cafeOrder.count();
    const orderNumber = `CAFE-${1000 + orderCount + 1}`;

    return this.prisma.$transaction(async (prisma) => {
      const order = await prisma.cafeOrder.create({
        data: {
          orderNumber,
          totalAmount,
          status: 'PENDING',
          customerName: data.customerName,
          memberId: data.memberId,
          tableNumber: data.tableNumber,
          items: {
            create: data.items.map(item => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes,
            }))
          }
        },
        include: { items: true },
      });
      
      // Stock deduction logic: deduct when created
      for (const orderItem of data.items) {
        const updatedItem = await prisma.cafeItem.update({
          where: { id: orderItem.itemId },
          data: { stock: { decrement: orderItem.quantity } }
        });

        if (updatedItem.stock < 10) {
          this.notificationsService.broadcastToRole({
            title: 'Inventory Low',
            message: `${updatedItem.name} stock is critically low (${updatedItem.stock} remaining).`,
            type: 'WARNING',
            targetRole: 'MANAGER',
          }).catch(console.error);
        }

        // optionally create inventory transaction for 'OUT' due to order
        await prisma.cafeInventoryTransaction.create({
          data: {
            itemId: orderItem.itemId,
            quantity: orderItem.quantity,
            type: 'OUT',
            notes: `Order #${orderNumber}`
          }
        });
      }

      return order;
    });
  }

  async updateOrderStatus(id: string, data: { status: string, prepTime?: number }) {
    return this.prisma.cafeOrder.update({
      where: { id },
      data: {
        status: data.status,
        prepTime: data.prepTime !== undefined ? Number(data.prepTime) : undefined,
      },
    });
  }

  // --- Reports ---
  async getReportsSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = await this.prisma.cafeOrder.findMany({
      where: {
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      include: { items: { include: { item: true } } }
    });

    const totalSalesToday = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrdersToday = todaysOrders.length;

    const itemSales: Record<string, { name: string, quantity: number }> = {};
    todaysOrders.forEach(order => {
      order.items.forEach(orderItem => {
        if (!itemSales[orderItem.itemId]) {
          itemSales[orderItem.itemId] = {
            name: orderItem.item.name,
            quantity: 0
          };
        }
        itemSales[orderItem.itemId].quantity += orderItem.quantity;
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSalesToday,
      totalOrdersToday,
      topSellingItems,
    };
  }

  // --- Checklists & Logs (Existing) ---
  async submitChecklist(data: any) {
    return this.prisma.kitchenChecklist.create({
      data: {
        type: data.type,
        completedBy: data.completedBy,
        items: JSON.stringify(data.items),
        notes: data.notes
      }
    });
  }

  async getChecklists() {
    return this.prisma.kitchenChecklist.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async submitPrepLog(data: any) {
    return this.prisma.foodPrepLog.create({
      data: {
        itemName: data.itemName,
        quantity: parseInt(data.quantity, 10),
        preparedBy: data.preparedBy,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes
      }
    });
  }

  async getPrepLogs() {
    return this.prisma.foodPrepLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async submitHygieneLog(data: any) {
    return this.prisma.hygieneLog.create({
      data: {
        area: data.area,
        cleanedBy: data.cleanedBy,
        status: data.status,
        notes: data.notes
      }
    });
  }

  async getHygieneLogs() {
    return this.prisma.hygieneLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- Cafe Expenses ---
  async getCafeExpenses() {
    return this.prisma.expense.findMany({
      where: {
        category: {
          name: {
            in: ['CAFE', 'KITCHEN', 'Cafe', 'Kitchen', 'CAFE_EXPENSE', 'KITCHEN_EXPENSE']
          }
        }
      },
      include: {
        category: true,
        recordedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCafeExpense(dto: { amount: number, description: string, categoryName: string, recordedById: string }) {
    let category = await this.prisma.expenseCategory.findFirst({
      where: { name: dto.categoryName }
    });
    
    if (!category) {
      category = await this.prisma.expenseCategory.create({
        data: { name: dto.categoryName, description: 'Cafe/Kitchen Expense' }
      });
    }

    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        categoryId: category.id,
        recordedById: dto.recordedById
      }
    });
  }
}
