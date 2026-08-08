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
import { Briefcase, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Designations() {
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingDesig, setEditingDesig] = useState(null)
  
  // Form fields
  const [name, setName] = useState("")
  const [level, setLevel] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("ACTIVE")

  const token = localStorage.getItem("token") || ""

  const fetchDesignations = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/designations")
      const data = res.data
      if (res.data) {
        setDesignations(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error fetching designations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesignations()
  }, [])

  const handleOpenCreate = () => {
    setEditingDesig(null)
    setName("")
    setLevel("")
    setDescription("")
    setStatus("ACTIVE")
    setOpen(true)
  }

  const handleOpenEdit = (desig) => {
    setEditingDesig(desig)
    setName(desig.name)
    setLevel(desig.level || "")
    setDescription(desig.description || "")
    setStatus(desig.status)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { name, level: level || undefined, description, status }
    
    try {
      const url = editingDesig ? `/api/designations/${editingDesig.id}` : "/api/designations"
      const method = editingDesig ? "PUT" : "POST"
      
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
        fetchDesignations()
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
    if (!confirm("Are you sure you want to delete this designation?")) return
    try {
      const res = await api(`/api/designations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchDesignations()
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
          <h1 className="text-2xl font-bold tracking-tight">Designations</h1>
          <p className="text-muted-foreground">Manage employee job roles, levels, and operational titles.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-red-600 hover:bg-red-700 text-white w-fit">
          <Plus className="mr-2 h-4 w-4" /> Add Designation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Designations</CardTitle>
          <CardDescription>Configure professional roles and hierarchies.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
            </div>
          ) : designations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto text-foreground mb-3" />
              <p className="text-base font-semibold">No designations found</p>
              <p className="text-sm">Create job descriptions and levels for employee alignment.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Designation Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Active Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designations.map((desig) => (
                    <TableRow key={desig.id}>
                      <TableCell className="font-semibold text-foreground">{desig.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-red-200 text-red-700">
                          {desig.level || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">
                        {desig.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{desig.employeeCount || 0} Staff</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={desig.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-slate-100 text-foreground"}>
                          {desig.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(desig)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(desig.id)}>
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
              <DialogTitle>{editingDesig ? "Edit Designation" : "Create Designation"}</DialogTitle>
              <DialogDescription>
                Provide detailed title and level mapping. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Designation Title</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Software Engineer" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level Hierarchy</Label>
                <Input id="level" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. L3, Senior, Lead" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Functional requirements" />
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
