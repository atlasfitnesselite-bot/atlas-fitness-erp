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
import { ShieldCheck, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EmploymentTypes() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  
  // Form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("ACTIVE")

  const token = localStorage.getItem("token") || ""

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/employment-types")
      const data = res.data
      if (res.data) {
        setTypes(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error fetching types:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const handleOpenCreate = () => {
    setEditingType(null)
    setName("")
    setDescription("")
    setStatus("ACTIVE")
    setOpen(true)
  }

  const handleOpenEdit = (type) => {
    setEditingType(type)
    setName(type.name)
    setDescription(type.description || "")
    setStatus(type.status)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { name, description, status }
    
    try {
      const url = editingType ? `/api/employment-types/${editingType.id}` : "/api/employment-types"
      const method = editingType ? "PUT" : "POST"
      
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
        fetchTypes()
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
    if (!confirm("Are you sure you want to delete this employment type?")) return
    try {
      const res = await api(`/api/employment-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchTypes()
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
          <h1 className="text-2xl font-bold tracking-tight">Employment Types</h1>
          <p className="text-muted-foreground">Configure contract types like Full-Time, Part-Time, Intern, or Freelance.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-red-600 hover:bg-red-700 text-white w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Employment Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employment Classifications</CardTitle>
          <CardDescription>Setup operational contract categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
            </div>
          ) : types.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto text-foreground mb-3" />
              <p className="text-base font-semibold">No employment types found</p>
              <p className="text-sm">Add contract groupings (e.g. Full-Time, Part-Time) to get started.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classification Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Active Headcount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-semibold text-foreground">{type.name}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">
                        {type.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{type.employeeCount || 0} Members</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={type.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-slate-100 text-foreground"}>
                          {type.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(type)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
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
              <DialogTitle>{editingType ? "Edit Employment Type" : "Create Employment Type"}</DialogTitle>
              <DialogDescription>
                Define operational classification metadata. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Classification Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Full-Time Permanent" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job contract specifics" />
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
