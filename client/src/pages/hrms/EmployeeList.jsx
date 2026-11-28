import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  FileSpreadsheet,
  Download,
  Trash2,
  Lock,
  Eye,
  FileText,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EmployeeImport from "./EmployeeImport"

export default function EmployeeList() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Filters & State
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  
  // Selected IDs for Bulk Actions
  const [selectedIds, setSelectedIds] = useState([])

  // Modal open triggers
  const [onboardOpen, setOnboardOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Onboard Form fields
  const [employeeId, setEmployeeId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("MALE")
  const [joiningDate, setJoiningDate] = useState("")
  const [statusForm, setStatusForm] = useState("ACTIVE")
  const [roleName, setRoleName] = useState("RECEPTION")
  const [empPassword, setEmpPassword] = useState("Password123")
  const [baseSalary, setBaseSalary] = useState("")
  
  // Extra Models
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [types, setTypes] = useState([])
  const [managers, setManagers] = useState([])

  const [selectedDept, setSelectedDept] = useState("")
  const [selectedDesig, setSelectedDesig] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedManager, setSelectedManager] = useState("")

  const token = localStorage.getItem("token") || ""

  const fetchFilters = async () => {
    try {
      const [deptsRes, desigRes, typeRes, empsRes] = await Promise.all([
        api.get("/api/departments"),
        api.get("/api/designations"),
        api.get("/api/employment-types"),
        api.get("/api/employees?limit=100"),
      ])

      if (deptsRes.data) setDepartments(deptsRes.data)
      if (desigRes.data) setDesignations(desigRes.data)
      if (typeRes.data) setTypes(typeRes.data)
      if (empsRes.data) {
        setManagers(empsRes.data.items || [])
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      })
      
      const res = await api.get(`/api/employees?${params.toString()}`)
      const data = res.data
      if (res.data) {
        setEmployees(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error("Error fetching employees:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [search, status, page, sortBy, sortOrder])

  // Bulk execution handlers
  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(employees.map((e) => e.id))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} employees?`)) return
    try {
      const res = await api("/api/employees/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        data: { ids: selectedIds, status: targetStatus }
      })
      if (res.data) {
        setSelectedIds([])
        fetchEmployees()
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const handleBulkStatus = async (targetStatus) => {
    try {
      const res = await api("/api/employees/bulk-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        data: { ids: selectedIds, status: targetStatus }
      })
      if (res.data) {
        setSelectedIds([])
        fetchEmployees()
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  // Exports
  const handleExportCSV = () => {
    const headers = "Employee ID,First Name,Last Name,Email,Mobile,Joining Date,Status\n"
    const rows = employees
      .map(
        (e) =>
          `"?{e.employeeId}","?{e.firstName}","?{e.lastName}","?{e.email}","?{e.mobile}","?{e.joiningDate}","?{e.status}"`
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", "employees_roster.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOnboardSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      employeeId,
      firstName,
      lastName,
      email,
      mobile,
      dob: dob || undefined,
      gender,
      joiningDate: joiningDate || undefined,
      status: statusForm,
      departmentId: selectedDept || undefined,
      designationId: selectedDesig || undefined,
      employmentTypeId: selectedType || undefined,
      managerId: selectedManager || undefined,
      roleName,
      password: empPassword || undefined,
      baseSalary: baseSalary ? parseFloat(baseSalary) : undefined,
    }

    try {
      const res = await api.post("/api/employees", payload)
      setOnboardOpen(false)
      fetchEmployees()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || "Failed onboarding staff profile")
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage employee directories, filter profiles, and onboard new staff.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={() => setOnboardOpen(true)} className="bg-red-600 hover:bg-red-700 text-white w-fit" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Onboard Staff
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-background p-4 rounded-lg border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <CustomSelect
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 w-full md:w-40 rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="TERMINATED">TERMINATED</option>
          </CustomSelect>
          <Button variant="outline" onClick={handleExportCSV} size="sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-lg animate-in fade-in">
          <span className="text-sm font-medium text-red-800">
            {selectedIds.length} profiles selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleBulkStatus("ACTIVE")} size="sm">
              Activate
            </Button>
            <Button variant="outline" onClick={() => handleBulkStatus("SUSPENDED")} size="sm">
              Suspend
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} size="sm">
              <Trash2 className="h-4 w-4" /> Delete Profiles
            </Button>
          </div>
        </div>
      )}

      <Card>
                <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="h-10 bg-slate-100 animate-pulse rounded" />
              <div className="h-10 bg-slate-100 animate-pulse rounded" />
              <div className="h-10 bg-slate-100 animate-pulse rounded" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto text-foreground mb-3" />
              <p className="text-lg font-semibold">No employees found</p>
              <p className="text-sm">Onboard staff or import profile lists to populate roster.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === employees.length}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-background">
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => handleSelectOne(emp.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{emp.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {emp.profilePicture ? (
                          <img 
                            src={emp.profilePicture} 
                            alt={`${emp.firstName} ${emp.lastName}`} 
                            className="h-8 w-8 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-foreground overflow-hidden">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{emp.department?.name || "�"}</TableCell>
                    <TableCell>{emp.designation?.name || "�"}</TableCell>
                    <TableCell>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "�"}</TableCell>
                    <TableCell>
                      <Badge className={emp.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(/employees/)}
                        className="text-slate-600 hover:text-foreground"
                      >
                        <Eye className="mr-1 h-4 w-4" /> View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <EmployeeImport onClose={() => setImportOpen(false)} onImportSuccess={fetchEmployees} />
        </DialogContent>
      </Dialog>

      {/* Onboard Modal */}
      <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleOnboardSubmit}>
            <DialogHeader>
              <DialogTitle>Onboard New Staff</DialogTitle>
              <DialogDescription>
                Provide detailed employment, address, and profile classification.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Staff ID Code</Label>
                <Input id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. EMP-001" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <CustomSelect
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </CustomSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statusForm">Status</Label>
                <CustomSelect
                  id="statusForm"
                  value={statusForm}
                  onChange={(e) => setStatusForm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </CustomSelect>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="roleName">Login Role *</Label>
                <CustomSelect id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none">
                  <option value="RECEPTION">RECEPTION</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="TRAINER">TRAINER</option>
                  <option value="CAFE">CAFE</option>
                  <option value="CLEANING">CLEANING</option>
                </CustomSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="empPassword">Login Password</Label>
                <Input id="empPassword" type="text" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} placeholder="Password123" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseSalary">Monthly Base Salary (₹)</Label>
                <Input id="baseSalary" type="number" step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} placeholder="e.g. 15000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="selectedDept">Department</Label>
                <CustomSelect
                  id="selectedDept"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="selectedDesig">Designation</Label>
                <CustomSelect
                  id="selectedDesig"
                  value={selectedDesig}
                  onChange={(e) => setSelectedDesig(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="selectedType">Employment Type</Label>
                <CustomSelect
                  id="selectedType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="">Select Type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="selectedManager">Reporting Manager</Label>
                <CustomSelect
                  id="selectedManager"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="">Select Manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </CustomSelect>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOnboardOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

