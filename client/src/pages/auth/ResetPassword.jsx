import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import api from '../../lib/api';

const schema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlToken = searchParams.get('token')
    
    if (!urlToken) {
      toast({
        title: "Error",
        description: "Invalid or missing reset token.",
        variant: "destructive"
      })
      navigate('/login')
    } else {
      setToken(urlToken)
    }
  }, [location, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    if (!token) return;
    
    setIsLoading(true)
    try {
      await api.post('/api/auth/reset-password', { newPassword: data.password, token })
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      })
      navigate("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to reset password',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Reset password</h2>
        <p className="text-sm text-muted-foreground mt-2">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              {...register("password")}
              className={errors.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"} 
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  )
}
