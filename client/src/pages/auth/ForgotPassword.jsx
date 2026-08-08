import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import api from '../../lib/api';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/api/auth/forgot-password', data)
      setIsSent(true)
      toast({
        title: "Reset link sent",
        description: "If an account exists, we have sent a reset link.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to send reset link',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Forgot password?</h2>
        <p className="text-sm text-muted-foreground mt-2">No worries, we'll send you reset instructions.</p>
      </div>

      {isSent ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
          <p className="font-medium text-sm">Check your email</p>
          <p className="text-sm mt-1">We've sent a password reset link to your email address.</p>
        </div>
      ) : (
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

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
