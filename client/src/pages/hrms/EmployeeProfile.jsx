import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  User,
  Phone,
  Briefcase,
  Wallet,
  FileText,
  MessageSquare,
  Clock,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  ChevronLeft,
  Calendar,
  Coffee,
  Camera,
  Award,
} from "lucide-react"
import ConfigurePayrollDialog from "./ConfigurePayrollDialog"

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  // Masking toggles
  const [revealSalary, setRevealSalary] = useState(false)
  const [revealGovt, setRevealGovt] = useState(false)

  // Upload/Notes state
  const [docName, setDocName] = useState("")
  const [docFile, setDocFile] = useState("")
  const [docCategory, setDocCategory] = useState("DOCUMENT")
  const [noteContent, setNoteContent] = useState("")
  const [noteType, setNoteType] = useState("GENERAL")
  const [notes, setNotes] = useState([])
  const [documents, setDocuments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [attMonth, setAttMonth] = useState(new Date().getMonth() + 1)
  const [attYear, setAttYear] = useState(new Date().getFullYear())
  const [leaveBalance, setLeaveBalance] = useState([])
  const [shifts, setShifts] = useState([])

  const token = localStorage.getItem("token") || ""

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result
      try {
        const res = await api(`/api/employees/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          data: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            profilePicture: base64String,
            joiningDate: employee.joiningDate
          }
        })
        if (res.data) {
          toast.success("Profile photo updated successfully!")
          fetchEmployeeDetails()
        } else {
          toast.error("Failed to update profile photo")
        }
      } catch (err) {
        console.error(err)
        toast.error("Error updating profile photo")
      }
    }
    reader.readAsDataURL(file)
  }

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/employees/${id}`)
      if (res.data) {
        const data = res.data
        setEmployee(data)
      } else {
        navigate("/404")
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/api/employees/${id}/notes`)
      if (res.data) {
        setNotes(res.data)
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/api/employees/${id}/documents`)
      if (res.data) {
        setDocuments(res.data)
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/api/employees/${id}/attendance?month=${attMonth}&year=${attYear}`)
      if (res.data) {
        const data = res.data
        setAttendance(data.records || [])
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const fetchLeaveBalance = async () => {
    try {
      const res = await api.get(`/api/employees/${id}/leave-balance`)
      if (res.data) {
        setLeaveBalance(res.data)
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const fetchShifts = async () => {
    try {
      const res = await api.get(`/api/employees/${id}/shifts`)
      if (res.data) {
        setShifts(res.data)
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  useEffect(() => {
    fetchEmployeeDetails()
    fetchNotes()
    fetchDocuments()
    fetchLeaveBalance()
    fetchShifts()
  }, [id])

  useEffect(() => {
    fetchAttendance()
  }, [id, attMonth, attYear])
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    try {
      const res = await api(`/api/employees/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        data: { content: noteContent }
      })
      if (res.data) {
        setNoteContent("")
        fetchNotes()
        fetchEmployeeDetails() // Refresh timeline
      }
    } catch (err) {
      console.error(err)
      if (err.response?.data?.message) alert(err.response.data.message)
    }
  }

  const handleUploadDocument = async (e) => {
    e.preventDefault()
    if (!docName.trim() || !docFile.trim()) return

    const prefix = docCategory === "CERTIFICATE" ? "[CERTIFICATE] " : ""

    try {
      const res = await api(`/api/employees/${id}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: prefix + docName,
          fileName: docFile.split("\\").pop() || "uploaded_file.pdf",
          fileUrl: "/mock-uploads/" + docFile,
          fileSize: 1024 * 150, // 150KB mock size
          mimeType: "application/pdf"
        })
      })
      if (res.data) {
        setDocName("")
        setDocFile("")
        fetchDocuments()
        fetchEmployeeDetails() // Refresh timeline
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Delete this document?")) return
    try {
      const res = await api(`/api/employees/${id}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchDocuments()
        fetchEmployeeDetails()
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const standardDocs = documents.filter(d => !d.name.startsWith("[CERTIFICATE]"))
  const certificates = documents.filter(d => d.name.startsWith("[CERTIFICATE]"))

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="h-40 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!employee) return null

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/employees")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Profile</h1>
          <p className="text-muted-foreground">View and update employee records, documents, and historical timelines.</p>
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="bg-card text-white overflow-hidden relative">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {employee.profilePicture ? (
              <img 
                src={employee.profilePicture} 
                alt={`${employee.firstName} ${employee.lastName}`} 
                className="h-20 w-20 rounded-full object-cover border-2 border-slate-700"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-2xl text-red-500">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="h-5 w-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-bold">{employee.firstName} {employee.lastName}</h2>
              <Badge className="bg-red-600 text-white w-fit mx-auto sm:mx-0">{employee.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{employee.employeeId}</p>
            <p className="text-sm text-foreground">{employee.designation?.name || "No Designation"} — {employee.department?.name || "No Department"}</p>
          </div>
        </CardContent>
      </Card>
 
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Personal
          </TabsTrigger>
          <TabsTrigger value="employment" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Employment
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Salary & ID
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Documents
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <Award className="h-4 w-4" /> Performance & Notes
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Attendance
          </TabsTrigger>
        </TabsList>

        {/* Tab contents */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Verify employee personal and emergency contact information.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">Full Name</span>
                  <span className="font-semibold text-foreground">{employee.firstName} {employee.lastName}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Work Email</span>
                  <span className="font-semibold text-foreground">{employee.email}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Mobile Contact</span>
                  <span className="font-semibold text-foreground">{employee.mobile}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">Address</span>
                  <span className="font-semibold text-foreground">
                    {employee.address ? `${employee.address.addressLine1}, ${employee.address.city}, ${employee.address.country}` : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Emergency Contact</span>
                  <span className="font-semibold text-foreground">
                    {employee.emergencyContacts && employee.emergencyContacts[0]
                      ? `${employee.emergencyContacts[0].name} (${employee.emergencyContacts[0].relationship}) - ${employee.emergencyContacts[0].phone}`
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Metadata</CardTitle>
              <CardDescription>Review contract details, department hierarchies, and manager reporting lines.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">Department</span>
                  <span className="font-semibold text-foreground">{employee.department?.name || "—"}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Designation</span>
                  <span className="font-semibold text-foreground">{employee.designation?.name || "—"}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Employment Contract</span>
                  <span className="font-semibold text-foreground">{employee.employmentType?.name || "—"}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">Date of Joining</span>
                  <span className="font-semibold text-foreground">
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Reporting Line Manager</span>
                  <span className="font-semibold text-foreground">
                    {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Shift Assignment</CardTitle>
              <CardDescription>View current shift and working timings.</CardDescription>
            </CardHeader>
            <CardContent>
              {shifts.length > 0 ? (
                <div className="space-y-4">
                  {shifts.map(shift => (
                    <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{shift.name}</p>
                          <Badge variant="outline" className="bg-card">{shift.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shift.startTime} - {shift.endTime} 
                        </p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No active shifts assigned.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Compensation details</CardTitle>
                <CardDescription>Masked payroll structure for security audit clearance.</CardDescription>
              </div>
              <div className="flex gap-2">
                <ConfigurePayrollDialog 
                  employeeId={id} 
                  employeeName={`${employee?.firstName} ${employee?.lastName}`} 
                  onSuccess={fetchEmployeeDetails} 
                />
                <Button variant="outline" size="sm" onClick={() => setRevealSalary(!revealSalary)}>
                  {revealSalary ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {revealSalary ? "Mask Details" : "Reveal Salaries"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">Base Salary (Monthly)</span>
                  <span className="font-semibold text-foreground font-mono">
                    {revealSalary
                      ? `?${employee.payrollStructure?.baseSalary?.toLocaleString() || "0.00"}`
                      : "••••••"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Allowance</span>
                  <span className="font-semibold text-foreground font-mono">
                    {revealSalary
                      ? (() => {
                          try {
                            const allowances = JSON.parse(employee.payrollStructure?.standardAllowances || "{}");
                            const total = Object.values(allowances).reduce((a, b) => a + Number(b), 0);
                            return `₹${total.toLocaleString()}`;
                          } catch (e) {
                            return "₹0.00";
                          }
                        })()
                      : "••••••"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">PT Commission</span>
                  <span className="font-semibold text-foreground font-mono">
                    {revealSalary
                      ? `${employee.payrollStructure?.ptCommissionPercentage || 0}%`
                      : "•••"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Bank Name</span>
                  <span className="font-semibold text-foreground">
                    {revealSalary ? employee.salaryInformation?.bankName || "—" : "••••••"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-medium">Bank Account Number</span>
                  <span className="font-semibold text-foreground font-mono">
                    {revealSalary ? employee.salaryInformation?.accountNumber || "—" : "••••••••••••"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Government Documents & IDs</CardTitle>
                <CardDescription>Protected national identification markers.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setRevealGovt(!revealGovt)}>
                {revealGovt ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {revealGovt ? "Mask IDs" : "Reveal Documents"}
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">National identification ID</span>
                  <span className="font-semibold text-foreground font-mono">
                    {revealGovt ? employee.governmentDocuments?.panSsn || "—" : "••••••••••••"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="block text-muted-foreground font-medium">Passport Identification Number</span>
                  <span className="font-semibold text-foreground font-mono">
                    {revealGovt ? employee.governmentDocuments?.passportNumber || "—" : "••••••••••••"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Vault</CardTitle>
              <CardDescription>Onboard, verify, and delete employee documents and professional certifications securely.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleUploadDocument} className="flex flex-col sm:flex-row gap-4 bg-background p-4 rounded-lg border">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="docName">Document Name</Label>
                    <Input id="docName" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Offer Letter" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="docCategory">Category</Label>
                    <CustomSelect
                      id="docCategory"
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none"
                    >
                      <option value="DOCUMENT">Onboarding Document</option>
                      <option value="CERTIFICATE">Professional Certificate</option>
                    </CustomSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="docFile">File Source Path</Label>
                    <Input id="docFile" value={docFile} onChange={(e) => setDocFile(e.target.value)} placeholder="Select mock file path..." required />
                  </div>
                </div>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white self-end">
                  <Upload className="mr-2 h-4 w-4" /> Upload File
                </Button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Documents */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" /> Onboarding & Personal Documents
                  </h4>
                  {standardDocs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg text-sm">
                      No onboarding documents uploaded.
                    </div>
                  ) : (
                    <div className="border rounded-lg divide-y bg-card text-sm">
                      {standardDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-background">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="h-8 w-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              PDF
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium text-foreground truncate">{doc.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{doc.fileName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(doc.fileUrl, "_blank")}>
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDocument(doc.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certificates */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-red-600" /> Professional Certificates
                  </h4>
                  {certificates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg text-sm">
                      No training certificates uploaded.
                    </div>
                  ) : (
                    <div className="border rounded-lg divide-y bg-card text-sm">
                      {certificates.map((doc) => {
                        const cleanName = doc.name.replace("[CERTIFICATE] ", "")
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-background">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="h-8 w-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                CERT
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-medium text-foreground truncate">{cleanName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate">{doc.fileName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(doc.fileUrl, "_blank")}>
                                <Download className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDocument(doc.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Internal Performance & Audit Notes</CardTitle>
                <CardDescription>Document employee performance track records, disciplinary actions, or general notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="noteContent">Write Note</Label>
                    <textarea
                      id="noteContent"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add an internal performance rating or general log entry..."
                      className="flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="noteType" className="text-xs">Type</Label>
                      <CustomSelect
                        id="noteType"
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="flex h-9 rounded-md border border-border bg-card px-3 py-1 text-xs focus-visible:outline-none"
                      >
                        <option value="GENERAL">GENERAL</option>
                        <option value="PERFORMANCE">PERFORMANCE</option>
                        <option value="DISCIPLINARY">DISCIPLINARY</option>
                      </CustomSelect>
                    </div>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                      Save Note
                    </Button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General / Disciplinary Notes */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b pb-2">General & Disciplinary Log</h4>
                    {notes.filter(n => n.type !== 'PERFORMANCE').length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No general log entries.</p>
                    ) : (
                      <div className="space-y-3">
                        {notes.filter(n => n.type !== 'PERFORMANCE').map((note) => (
                          <div key={note.id} className="border p-3 rounded-lg space-y-2 bg-background/50 text-sm">
                            <div className="flex items-center justify-between">
                              <Badge variant={note.type === 'DISCIPLINARY' ? 'destructive' : 'secondary'} className="text-[9px]">{note.type}</Badge>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 text-xs whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Performance Reports */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-500" /> Performance Reports
                    </h4>
                    {notes.filter(n => n.type === 'PERFORMANCE').length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No performance reports logged.</p>
                    ) : (
                      <div className="space-y-3">
                        {notes.filter(n => n.type === 'PERFORMANCE').map((note) => (
                          <div key={note.id} className="border-l-4 border-l-amber-500 border p-3 rounded-r-lg space-y-2 bg-amber-50/20 text-sm">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[9px]">PERFORMANCE REPORT</Badge>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-foreground font-medium text-xs whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Timeline</CardTitle>
                <CardDescription>Historical employee timeline and audit log entries.</CardDescription>
              </CardHeader>
              <CardContent className="relative pl-6 border-l border-border space-y-6">
                {employee.timeline?.map((t) => (
                  <div key={t.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-red-600 bg-card" />
                    <div>
                      <span className="block text-xs font-semibold text-foreground">{t.event}</span>
                      <span className="block text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</span>
                      {t.description && <p className="text-[11px] text-muted-foreground mt-1">{t.description}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Attendance & Leaves</h3>
            <div className="flex items-center gap-2">
              <CustomSelect 
                className="h-9 rounded-md border border-border bg-card px-3 py-1 text-sm outline-none"
                value={attMonth}
                onChange={(e) => setAttMonth(Number(e.target.value))}
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </CustomSelect>
              <CustomSelect 
                className="h-9 rounded-md border border-border bg-card px-3 py-1 text-sm outline-none"
                value={attYear}
                onChange={(e) => setAttYear(Number(e.target.value))}
              >
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </CustomSelect>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-emerald-50 text-emerald-900 border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">Total Present</span>
              <span className="text-xl font-bold mt-1 block">
                {attendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length}
              </span>
            </div>
            <div className="p-4 rounded-xl border bg-rose-50 text-rose-900 border-rose-100">
              <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider block">Total Absent</span>
              <span className="text-xl font-bold mt-1 block">
                {attendance.filter(r => r.status === 'ABSENT').length}
              </span>
            </div>
            <div className="p-4 rounded-xl border bg-amber-50 text-amber-900 border-amber-100">
              <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider block">Total Late Days</span>
              <span className="text-xl font-bold mt-1 block">
                {attendance.filter(r => r.status === 'LATE').length}
              </span>
            </div>
            <div className="p-4 rounded-xl border bg-background text-foreground">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Avg Working Hours</span>
              <span className="text-xl font-bold mt-1 block">
                {attendance.length > 0 ? (attendance.reduce((sum, r) => sum + (r.workingHours || 0), 0) / (attendance.filter(r => r.workingHours > 0).length || 1)).toFixed(1) : 0} hrs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Daily clock in/out roster entries.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-[10px] font-semibold text-muted-foreground uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Clock In</th>
                        <th className="py-2.5 px-3">Clock Out</th>
                        <th className="py-2.5 px-3">Work Hours</th>
                        <th className="py-2.5 px-3">Late (m)</th>
                        <th className="py-2.5 px-3">Break (m)</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {attendance.length > 0 ? (
                        attendance.map((r) => (
                          <tr key={r.id || r.date} className="hover:bg-background/50">
                            <td className="py-2.5 px-3 font-medium">
                              {new Date(r.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-2.5 px-3">
                              {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td className="py-2.5 px-3">
                              {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">
                              {r.workingHours ? r.workingHours.toFixed(2) + ' hrs' : '-'}
                            </td>
                            <td className="py-2.5 px-3">
                              {r.lateMinutes ? r.lateMinutes : '-'}
                            </td>
                            <td className="py-2.5 px-3">
                              {r.breakMinutes ? r.breakMinutes : '-'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                r.status === 'ABSENT' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                r.status === 'LATE' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                r.status === 'ON_LEAVE' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                'bg-slate-100 text-slate-600 border border-border'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-muted-foreground">
                            No attendance records for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Balance</CardTitle>
                  <CardDescription>Available leaves for the current year.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaveBalance.length > 0 ? (
                    leaveBalance.map(lb => {
                      const percentage = lb.allocated > 0 ? (lb.balance / lb.allocated) * 100 : 0;
                      let colorClass = "bg-emerald-500";
                      if (percentage < 25) colorClass = "bg-rose-500";
                      else if (percentage <= 50) colorClass = "bg-amber-500";

                      return (
                        <div key={lb.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-foreground">{lb.leaveType?.name || lb.type}</span>
                            <span className="text-muted-foreground text-xs">Bal: {lb.balance} / {lb.allocated}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colorClass}`} style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Used: {lb.used}</span>
                            {lb.carryForward > 0 && <span>CF: {lb.carryForward}</span>}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">No leave balance found.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
