import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"

export default function Forbidden() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">403 Forbidden</h1>
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Link to="/">
          <Button size="lg">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
