import { CustomSelect } from '@/components/ui/custom-select';
import { useEffect, useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, Upload, Loader2, Trash2, Plus } from "lucide-react"
import api from '../../lib/api';
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/useAuthStore"

export default function Settings() {
  const { toast } = useToast()
  const { token } = useAuthStore()
  
  const [companySettings, setCompanySettings] = useState({
    companyName: "",
    contactEmail: "",
    timezone: "",
    dateFormat: ""
  })
  const [logo, setLogo] = useState(null)
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const fileInputRef = useRef(null)

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: "",
    secondaryColor: "",
    mode: "light"
  })
  const [isSavingTheme, setIsSavingTheme] = useState(false)

  const [roles, setRoles] = useState([])
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDesc, setNewRoleDesc] = useState("")
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const [companyRes, themeRes, rolesRes] = await Promise.all([
          api.get("/api/settings/company", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} })),
          api.get("/api/settings/theme", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} })),
          api.get("/api/roles", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ])
        
        if (companyRes.data) {
          setCompanySettings(prev => ({ ...prev, ...companyRes.data }))
        }
        
        const savedLogo = localStorage.getItem('companyLogo')
        if (savedLogo) setLogo(savedLogo)
        if (themeRes.data) {
          setThemeSettings(prev => ({ ...prev, ...themeRes.data }))
        }
        if (rolesRes.data) {
          setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : [])
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load settings."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [toast, token])

  const handleSaveCompany = async () => {
    try {
      setIsSavingCompany(true)
      await api.put("/api/settings/company", companySettings, { headers: { Authorization: `Bearer ${token}` } })
      toast({
        title: "Success",
        description: "Company settings updated successfully."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update company settings."
      })
    } finally {
      setIsSavingCompany(false)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setLogo(base64String)
        localStorage.setItem('companyLogo', base64String)
        toast({ title: "Success", description: "Logo uploaded locally." })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveTheme = async () => {
    try {
      setIsSavingTheme(true)
      await api.put("/api/settings/theme", themeSettings, { headers: { Authorization: `Bearer ${token}` } })
      toast({
        title: "Success",
        description: "System preferences updated successfully."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update system preferences."
      })
    } finally {
      setIsSavingTheme(false)
    }
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    if (!newRoleName) return
    setIsCreatingRole(true)
    try {
      const { data } = await api.post("/api/roles", { name: newRoleName, description: newRoleDesc }, { headers: { Authorization: `Bearer ${token}` } })
      setRoles(prev => [...prev, data])
      setNewRoleName("")
      setNewRoleDesc("")
      toast({ title: "Success", description: "Role created successfully." })
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to create role." })
    } finally {
      setIsCreatingRole(false)
    }
  }

  const handleDeleteRole = async (id) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await api.delete(`/api/roles/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setRoles(prev => prev.filter(r => r.id !== id))
      toast({ title: "Success", description: "Role deleted successfully." })
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete role." })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company information and system preferences.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="system">System Preferences</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center border border-dashed border-slate-300 overflow-hidden">
                  {logo ? (
                    <img src={logo} alt="Company Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">Recommended size: 256x256px. Max 2MB.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companySettings.companyName || ""} 
                    onChange={e => setCompanySettings({...companySettings, companyName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email" 
                    value={companySettings.contactEmail || ""} 
                    onChange={e => setCompanySettings({...companySettings, contactEmail: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone" 
                    value={companySettings.timezone || ""} 
                    onChange={e => setCompanySettings({...companySettings, timezone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Input 
                    id="dateFormat" 
                    value={companySettings.dateFormat || ""} 
                    onChange={e => setCompanySettings({...companySettings, dateFormat: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveCompany} disabled={isSavingCompany}>
                {isSavingCompany ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
              <CardDescription>Configure the application's appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border" 
                      style={{ backgroundColor: themeSettings.primaryColor || '#DC2626' }}
                    ></div>
                    <Input 
                      id="primaryColor" 
                      value={themeSettings.primaryColor || ""} 
                      onChange={e => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                      className="flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border" 
                      style={{ backgroundColor: themeSettings.secondaryColor || '#0F172A' }}
                    ></div>
                    <Input 
                      id="secondaryColor" 
                      value={themeSettings.secondaryColor || ""} 
                      onChange={e => setThemeSettings({...themeSettings, secondaryColor: e.target.value})}
                      className="flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Mode</Label>
                  <CustomSelect
                    id="mode"
                    className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    value={themeSettings.mode || "light"}
                    onChange={e => setThemeSettings({...themeSettings, mode: e.target.value})}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </CustomSelect>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTheme} disabled={isSavingTheme}>
                {isSavingTheme ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage system roles and access levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-medium">Existing Roles</h3>
                  {roles.length === 0 ? (
                    <div className="p-4 border rounded-lg bg-background text-muted-foreground text-sm">
                      No roles found.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden divide-y">
                      {roles.map(role => (
                        <div key={role.id} className="flex items-center justify-between p-4 bg-card hover:bg-background transition-colors">
                          <div>
                            <p className="font-semibold text-foreground">{role.name}</p>
                            <p className="text-xs text-muted-foreground">{role.description || "No description provided."}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-background p-4 rounded-lg border">
                  <h3 className="text-sm font-medium mb-4">Create New Role</h3>
                  <form onSubmit={handleCreateRole} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input 
                        id="roleName" 
                        required
                        placeholder="e.g. SENIOR_TRAINER" 
                        value={newRoleName}
                        onChange={e => setNewRoleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleDesc">Description</Label>
                      <Input 
                        id="roleDesc" 
                        placeholder="Optional description" 
                        value={newRoleDesc}
                        onChange={e => setNewRoleDesc(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreatingRole}>
                      {isCreatingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Add Role
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
