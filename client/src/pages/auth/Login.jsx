import api from '../../lib/api';
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "@/hooks/use-toast"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setLoginError('')
    try {
      const res = await api.post('/api/auth/login', { 
        email: data.email, 
        password: data.password 
      })

      const result = res.data
      if (!result) {
        throw new Error('Login failed')
      }

      // Store token in localStorage for compatibility with all pages
      localStorage.setItem('token', result.access_token)

      // Store in Zustand auth store
      login(result.user, result.access_token)

      toast({
        title: "Login Successful",
        description: "Welcome back to Atlas Fitness Live.",
      })
      navigate("/")
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid email or password"
      setLoginError(errorMessage)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to your account</h2>
        <p className="text-sm text-muted-foreground mt-2">Enter your email and password to access your dashboard.</p>
      </div>

      {loginError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="admin@atlasfitness.com" 
            {...register("email")}
            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm font-medium text-red-600 hover:text-red-500">
              Forgot password?
            </Link>
          </div>
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

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  )
}
