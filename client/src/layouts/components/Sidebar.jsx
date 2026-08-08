import { useState } from "react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/useUIStore"
import {
  LayoutDashboard,
  Users,
  Building,
  Award,
  ShieldCheck,
  GitMerge,
  Settings,
  User,
  Calendar,
  Smartphone,
  Clock,
  CalendarDays,
  MessageSquare,
  CalendarRange,
  BarChart2,
  FileText,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Wallet,
  Briefcase,
  Monitor,
  Dumbbell,
  Coffee,
  Wrench,
  Sparkles,
  LineChart,
  Bell,
  ClipboardList,
  TrendingUp,
  Image,
  Activity,
  Star
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

export default function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const { hasRole } = useAuthStore()
  const location = useLocation()
  
  const [openGroups, setOpenGroups] = useState({
    'HRMS': false,
    'Attendance': false,
    'Shifts': false,
    'Leaves': false,
    'Members': false,
    'Billing': false,
    'Operations': false,
    'Training': false,
    'Facilities': false,
  })

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }
  
  const navGroups = [
    {
      name: "Main",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Chat", href: "/chat", icon: MessageSquare, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
      ]
    },
    {
      name: "Members",
      items: [
        { name: "Directory", href: "/members", icon: Users, roles: ['OWNER', 'MANAGER', 'RECEPTION', 'TRAINER'] },
        { name: "Registration", href: "/members/new", icon: User, roles: ['OWNER', 'MANAGER', 'RECEPTION'] },
        { name: "Subscriptions", href: "/subscriptions", icon: CreditCard, roles: ['OWNER', 'MANAGER'] },
      ]
    },
    {
      name: "Billing",
      items: [
        { name: "Dashboard", href: "/billing", icon: Wallet, roles: ['OWNER'] },
      ]
    },
    {
      name: "Operations",
      items: [
        { name: "My Tasks", href: "/my-tasks", icon: CheckCircle2, roles: ['OWNER', 'MANAGER', 'CLEANING', 'CAFE', 'RECEPTION', 'TRAINER'] },
        { name: "Task Manager", href: "/tasks", icon: ClipboardList, roles: ['OWNER', 'MANAGER'] },
        { name: "Documents", href: "/documents", icon: FileText, roles: ['OWNER', 'MANAGER', 'ADMIN'] },
        { name: "Expenses", href: "/expenses", icon: IndianRupee, roles: ['OWNER'] },
        { name: "Assets", href: "/assets", icon: Briefcase, roles: ['OWNER'] },
      ]
    },
    {
      name: "Employee Management",
      items: [
        { name: "Employees", href: "/employees", icon: Users, roles: ['OWNER', 'MANAGER'] },
        { name: "Departments", href: "/departments", icon: Building, roles: ['OWNER'] },
        { name: "Designations", href: "/designations", icon: Award, roles: ['OWNER'] },
        { name: "Employment Types", href: "/employment-types", icon: ShieldCheck, roles: ['OWNER'] },
        { name: "Org Chart", href: "/org-structure", icon: GitMerge, roles: ['OWNER'] },
      ]
    },
    {
      name: "Attendance",
      items: [
        { name: "Live Dashboard", href: "/attendance", icon: Calendar, roles: ['OWNER', 'MANAGER'] },

        { name: "Analytics", href: "/attendance/analytics", icon: BarChart2, roles: ['OWNER', 'MANAGER'] },
        { name: "Reports", href: "/attendance/reports", icon: FileText, roles: ['OWNER', 'MANAGER'] },
        { name: "Corrections", href: "/attendance/corrections", icon: CheckCircle2, roles: ['OWNER', 'MANAGER'] },
        { name: "Payroll Summary", href: "/attendance/payroll-summary", icon: Calculator, roles: ['OWNER', 'MANAGER'] },
      ]
    },
    {
      name: "Shifts",
      items: [
        { name: "Management", href: "/shifts", icon: Clock, roles: ['OWNER', 'MANAGER'] },
        { name: "Calendar", href: "/shifts/calendar", icon: CalendarDays, roles: ['OWNER', 'MANAGER'] },
        { name: "Requests", href: "/shifts/requests", icon: MessageSquare, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
      ]
    },
    {
      name: "Leaves",
      items: [
        { name: "Dashboard", href: "/leave", icon: CalendarRange, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Leave Types", href: "/leave/types", icon: Settings, roles: ['OWNER', 'MANAGER'] },
        { name: "Balances", href: "/leave/balances", icon: Users, roles: ['OWNER', 'MANAGER'] },
        { name: "Requests", href: "/leave/requests", icon: MessageSquare, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Calendar", href: "/leave/calendar", icon: CalendarDays, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Holidays", href: "/leave/holidays", icon: Calendar, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Reports", href: "/leave/reports", icon: LayoutDashboard, roles: ['OWNER', 'MANAGER'] },
      ]
    },
    {
      name: "Training",
      items: [
        { name: "Trainer Dashboard", href: "/pt/dashboard", icon: LayoutDashboard, roles: ['TRAINER'] },
        { name: "PT Calendar", href: "/pt/calendar", icon: CalendarDays, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "Fitness Hub", href: "/pt/fitness", icon: Dumbbell, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "PT Progress", href: "/pt/progress", icon: TrendingUp, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "Client Photos", href: "/pt/photos", icon: Image, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "Workout Notes", href: "/pt/notes", icon: FileText, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "Body Measurements", href: "/pt/measurements", icon: Activity, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "Client Feedback", href: "/pt/feedback", icon: MessageSquare, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "PT Earnings", href: "/pt/earnings", icon: IndianRupee, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
        { name: "Trainer Performance", href: "/pt/performance", icon: Star, roles: ['OWNER', 'MANAGER', 'TRAINER'] },
      ]
    },
    {
      name: "Payroll & Finance",
      items: [
        { name: "Analytics Dashboard", href: "/analytics", icon: BarChart2, roles: ['OWNER', 'MANAGER'] },
        { name: "Payroll", href: "/payroll", icon: Calculator, roles: ['OWNER', 'MANAGER'] },
        { name: "Comprehensive Reports", href: "/reports/comprehensive", icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'ADMIN'] },
        { name: "Sales Report", href: "/reports/sales", icon: LineChart, roles: ['OWNER', 'MANAGER'] },
        { name: "Finance Report", href: "/reports/finance", icon: IndianRupee, roles: ['OWNER', 'MANAGER'] },
      ]
    },
    {
      name: "Facilities",
      items: [
        { name: "Equipment", href: "/equipment", icon: Wrench, roles: ['OWNER', 'MANAGER'] },
        { name: "Cafe", href: "/cafe", icon: Coffee, roles: ['OWNER', 'CAFE'] },
        { name: "Cleaning", href: "/cleaning", icon: Sparkles, roles: ['OWNER', 'MANAGER', 'CLEANING'] },
      ]
    },
    {
      name: "System",
      items: [
        { name: "Notifications", href: "/notifications", icon: Bell, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Profile", href: "/profile", icon: User, roles: ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'] },
        { name: "Security & Audits", href: "/security", icon: ShieldCheck, roles: ['OWNER', 'ADMIN'] },
        { name: "Settings", href: "/settings", icon: Settings, roles: ['OWNER'] },
      ]
    }
  ]

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground flex-shrink-0 transition-all duration-300 ease-in-out border-r border-border h-full flex flex-col overflow-hidden",
        sidebarOpen ? "w-64" : "w-20 hidden md:block"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-border px-4 flex-shrink-0">
        {sidebarOpen ? (
          <span className="text-xl font-bold text-white truncate">Atlas Fitness Live</span>
        ) : (
          <span className="text-xl font-bold text-white">AF</span>
        )}
      </div>

      <div className="py-4 px-3 flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
        {navGroups.map((group) => {
          // Filter items based on roles
          const filteredItems = group.items.filter(item => item.roles.some(role => hasRole(role)))
          
          // If no items in this group for the current role, don't render the group at all
          if (filteredItems.length === 0) return null;

          const isMainOrSystem = group.name === 'Main' || group.name === 'System';
          
          // When sidebar is closed, don't show the collapsible UI, just show icons
          if (!sidebarOpen) {
            return (
              <div key={group.name} className="flex flex-col gap-1 mb-2">
                {filteredItems.map(item => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      title={item.name}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-md transition-colors",
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )
          }

          // Render Main and System without accordion headers (flat items)
          if (isMainOrSystem) {
            return (
              <div key={group.name} className="flex flex-col gap-1 mb-1">
                {filteredItems.map(item => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-md transition-colors group",
                        isActive 
                          ? "bg-primary text-white" 
                          : "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                      <span className="font-medium truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )
          }

          // Render collapsible groups (HRMS, Attendance, Shifts, Leaves)
          const isOpen = openGroups[group.name]
          const isAnyChildActive = filteredItems.some(item => location.pathname === item.href)

          return (
            <div key={group.name} className="flex flex-col gap-1">
              <button
                onClick={() => toggleGroup(group.name)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors mb-1",
                  isAnyChildActive && !isOpen ? "text-primary font-semibold" : "hover:bg-muted hover:text-foreground text-muted-foreground font-semibold"
                )}
              >
                <span className="uppercase text-xs tracking-wider">{group.name}</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {isOpen && (
                <div className="flex flex-col gap-1 pl-2 border-l border-border ml-3 mt-1">
                  {filteredItems.map(item => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md transition-colors text-sm",
                          isActive 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0 mr-3 opacity-70" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
