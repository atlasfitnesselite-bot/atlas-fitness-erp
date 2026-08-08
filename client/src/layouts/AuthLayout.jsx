import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side Branding */}
      <div className="hidden md:flex flex-1 bg-card text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 bg-red-600/10 pointer-events-none" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10 text-center max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Atlas Fitness Live</h1>
          <p className="text-muted-foreground text-lg">The premium enterprise operating system for modern fitness organizations.</p>
        </div>
      </div>

      {/* Right Side Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
