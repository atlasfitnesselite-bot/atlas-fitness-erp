import { useAuthStore } from "@/store/useAuthStore"
import OwnerDashboard from "./components/OwnerDashboard"
import ManagerDashboard from "./components/ManagerDashboard"
import TrainerDashboard from "./components/TrainerDashboard"
import ReceptionDashboard from "./components/ReceptionDashboard"
import CafeDashboard from "./components/CafeDashboard"
import CleaningDashboard from "./components/CleaningDashboard"

export default function Dashboard() {
  const { user, hasRole } = useAuthStore()
  
  if (hasRole('OWNER')) return <OwnerDashboard />
  if (hasRole('MANAGER')) return <ManagerDashboard />
  if (hasRole('TRAINER')) return <TrainerDashboard />
  if (hasRole('RECEPTION')) return <ReceptionDashboard />
  if (hasRole('CAFE')) return <CafeDashboard />
  if (hasRole('CLEANING')) return <CleaningDashboard />
  
  return (
    <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
      No dashboard configuration found for your role.
    </div>
  )
}
