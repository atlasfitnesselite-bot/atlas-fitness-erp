import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import POS from './components/POS'
import CafeOrders from './components/CafeOrders'
import KitchenDisplay from './components/KitchenDisplay'
import MenuInventory from './components/MenuInventory'
import Suppliers from './components/Suppliers'
import Reports from './components/Reports'
import CafeExpenses from './components/CafeExpenses'
import { Coffee } from 'lucide-react'

export default function CafeDashboard() {
  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Cafe &amp; POS</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage orders, GST billing, kitchen, inventory, and suppliers.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="bg-card border border-border flex-wrap h-auto">
          <TabsTrigger value="pos">POS</TabsTrigger>
          <TabsTrigger value="orders">Orders &amp; Billing</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen Display</TabsTrigger>
          <TabsTrigger value="menu">Menu &amp; Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="mt-6">
          <POS />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <CafeOrders />
        </TabsContent>
        <TabsContent value="kitchen" className="mt-6">
          <KitchenDisplay />
        </TabsContent>
        <TabsContent value="menu" className="mt-6">
          <MenuInventory />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
          <Suppliers />
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <CafeExpenses />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <Reports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
