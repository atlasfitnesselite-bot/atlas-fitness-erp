import { Outlet } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import TopNav from "./components/TopNav"
import GlobalSearch from "@/components/GlobalSearch"
import { useUIStore } from "@/store/useUIStore"

export default function DashboardLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <GlobalSearch />
      
      {/* Overlay Backdrop for Mobile/Tablet */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
      
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
