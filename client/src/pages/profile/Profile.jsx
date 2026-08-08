import { useEffect, useState, useRef } from "react"
import api from '../../lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"

export default function Profile() {
  const { user, token, updateUser } = useAuthStore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    roles: user?.roles || [],
  })
  const [shifts, setShifts] = useState([])

  const [avatarUrl, setAvatarUrl] = useState(null)
  const fileInputRef = useRef(null)

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    pushAlerts: false
  })

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile', axiosConfig)
        const data = response.data
        setFormData({
          name: data.name || user?.name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          roles: data.roles || user?.roles || []
        })
        if (data.preferences) {
          setPreferences({
            emailAlerts: data.preferences.emailAlerts ?? true,
            pushAlerts: data.preferences.pushAlerts ?? false
          })
        }
        
        // Fetch Shifts
        if (user?.employeeId) {
           try {
             const shiftRes = await api.get(`/api/employees/${user.employeeId}/shifts`, axiosConfig)
             if (shiftRes.data && Array.isArray(shiftRes.data)) {
                setShifts(shiftRes.data)
             }
           } catch (e) {
             console.error("Failed to load shifts", e)
           }
        } else if (user?.id) {
           // Fallback to searching by user.id if employeeId is not mapped securely
           try {
             // In backend, getEmployees by email or userId could work, 
             // but we'll try `/api/shifts/calendar` and filter locally as fallback if needed.
             // Usually user.employeeId should be populated.
           } catch (e) {}
        }
        
        
        const savedAvatar = localStorage.getItem(`avatar_${user?.id}`)
        if (savedAvatar) setAvatarUrl(savedAvatar)
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          toast({
            title: "Session Expired",
            description: "Your session has expired or user no longer exists. Please log in again.",
            variant: "destructive"
          })
          useAuthStore.getState().logout()
        } else {
          toast({
            title: "Error fetching profile",
            description: error.response?.data?.message || "Could not load profile data.",
            variant: "destructive"
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleOverviewSave = async () => {
    try {
      setIsSaving(true)
      await api.put('/api/profile', { name: formData.name }, axiosConfig)
      
      updateUser({ name: formData.name })
      
      toast({
        title: "Profile updated",
        description: "Your personal information has been saved successfully."
      })
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setAvatarUrl(base64String)
        if (user?.id) localStorage.setItem(`avatar_${user.id}`, base64String)
        toast({ title: "Success", description: "Avatar uploaded locally." })
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordSave = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive"
      })
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast({
        title: "Validation Error",
        description: "New passwords do not match.",
        variant: "destructive"
      })
    }

    try {
      setIsPasswordSaving(true)
      await api.put('/api/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, axiosConfig)
      
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      })
    } catch (error) {
      toast({
        title: "Error updating password",
        description: error.response?.data?.message || "Check your current password and try again.",
        variant: "destructive"
      })
    } finally {
      setIsPasswordSaving(false)
    }
  }

  const togglePreference = async (key) => {
    const newValue = !preferences[key]
    const newPreferences = { ...preferences, [key]: newValue }
    
    setPreferences(newPreferences)
    
    try {
      await api.put('/api/profile/preferences', newPreferences, axiosConfig)
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated."
      })
    } catch (error) {
      // Revert on error
      setPreferences(preferences)
      toast({
        title: "Error updating preferences",
        description: "Could not save your changes.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border border-border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name || 'User'}`} alt="@user" />
                      <AvatarFallback>{formData.name?.charAt(0) || 'U'}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    disabled 
                    className="bg-background cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 000-0000" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled
                    className="bg-background cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={formData.roles?.join(', ')} 
                    disabled 
                    className="bg-background capitalize cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleOverviewSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule</CardTitle>
              <CardDescription>Your assigned shifts and work schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              {shifts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border border-dashed rounded-lg bg-background">
                  <Calendar className="w-10 h-10 text-foreground mb-2" />
                  <p>You have no upcoming shifts assigned.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shifts.map((shiftAssign) => (
                    <div key={shiftAssign.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: shiftAssign.shift?.color || '#6366f1' }} />
                          <span className="font-semibold text-foreground">{shiftAssign.shift?.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {shiftAssign.shift?.startTime} - {shiftAssign.shift?.endTime}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">
                          {format(new Date(shiftAssign.startDate), 'MMM dd, yyyy')} 
                          {shiftAssign.endDate ? ` to ${format(new Date(shiftAssign.endDate), 'MMM dd, yyyy')}` : ' onwards'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePasswordSave} disabled={isPasswordSaving}>
                {isPasswordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPasswordSaving ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your app preferences and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base cursor-pointer" onClick={() => togglePreference("emailAlerts")}>
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
                </div>
                <Button 
                  variant={preferences.emailAlerts ? "default" : "outline"}
                  onClick={() => togglePreference("emailAlerts")}
                  className="w-24"
                >
                  {preferences.emailAlerts ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between pt-2 pb-4 border-b">
                <div className="space-y-0.5">
                  <Label className="text-base cursor-pointer" onClick={() => togglePreference("pushAlerts")}>
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive push alerts for important updates.</p>
                </div>
                <Button 
                  variant={preferences.pushAlerts ? "default" : "outline"}
                  onClick={() => togglePreference("pushAlerts")}
                  className="w-24"
                >
                  {preferences.pushAlerts ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark mode appearance.</p>
                </div>
                <Button variant="outline" disabled>System</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
