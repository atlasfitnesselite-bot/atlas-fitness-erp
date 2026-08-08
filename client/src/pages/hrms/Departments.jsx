import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building, Plus, Edit, Trash2, ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  
  // Form fields
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [managerId, setManagerId] = useState("")

  const token = localStorage.getItem("token") || ""

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/departments")
      const data = res.data
      if (res.data) {
        setDepartments(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error fetching departments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleOpenCreate = () => {
    setEditingDept(null)
    setName("")
    setCode("")
    setDescription("")
    setStatus("ACTIVE")
    setManagerId("")
    setOpen(true)
  }

  const handleOpenEdit = (dept) => {
    setEditingDept(dept)
    setName(dept.name)
    setCode(dept.code)
    setDescription(dept.description || "")
    setStatus(dept.status)
    setManagerId(dept.managerId || "")
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { name, code, description, status, managerId: managerId || undefined }
    
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : "/api/departments"
      const method = editingDept ? "PUT" : "POST"
      
      const res = await api(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        data: payload
      })

      if (res.data) {
        setOpen(false)
        fetchDepartments()
      } else {
        const errorData = res.data
        alert(errorData.message || "Something went wrong")
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this department?")) return
    try {
      const res = await api(`/api/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchDepartments()
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage business divisions and assign heads of departments.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-red-600 hover:bg-red-700 text-white w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>View, edit, and configure your organization's departments.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto text-foreground mb-3" />
              <p className="text-base font-semibold">No departments found</p>
              <p className="text-sm">Get started by creating your first company department.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-semibold text-foreground">{dept.code}</TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">
                        {dept.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept.employeeCount || 0} Members</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={dept.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-slate-100 text-foreground"}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(dept)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingDept ? "Edit Department" : "Create Department"}</DialogTitle>
              <DialogDescription>
                Provide details for the business department. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Department Code</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DEPT-HR" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Human Resources" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <CustomSelect
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </CustomSelect>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
