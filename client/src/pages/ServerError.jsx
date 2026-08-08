import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"

export default function ServerError() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">500 Server Error</h1>
        <p className="text-lg text-muted-foreground">
          Something went wrong on our end. We're working on fixing it. Please try again later.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh Page</Button>
          <Link to="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
