import { Outlet } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import TopNav from "./components/TopNav"
import GlobalSearch from "@/components/GlobalSearch"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <GlobalSearch />
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
