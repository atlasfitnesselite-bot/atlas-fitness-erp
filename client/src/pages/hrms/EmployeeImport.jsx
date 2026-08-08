import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileUp, ShieldAlert, CheckCircle, RefreshCw, X } from "lucide-react"

export default function EmployeeImport({ onClose, onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [logs, setLogs] = useState([])
  const [importing, setImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const token = localStorage.getItem("token") || ""

  // Generate clean mock import template
  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "firstName,lastName,email,mobile,employeeId,departmentCode,designationName,employmentTypeName,joiningDate,status\n" +
      "John,Doe,john.doe@example.com,+1234567890,EMP-101,DEPT-HR,Senior Recruiter,Full-Time,2026-01-15,ACTIVE\n" +
      "Jane,Smith,jane.smith@example.com,+1987654321,EMP-102,DEPT-IT,Lead Architect,Full-Time,2026-02-10,ACTIVE"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "employee_import_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (selectedFile) => {
    setFile(selectedFile)
    // Parse CSV locally for preview (mock parsing)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result || ""
      const lines = text.split("\n").filter((l) => l.trim() !== "")
      const headers = lines[0].split(",")
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",")
        const obj = {}
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index] ? values[index].trim() : ""
        })
        return obj
      })

      // Validation check for previews
      const validated = rows.map((row, idx) => {
        const errors = []
        if (!row.firstName) errors.push("First name required")
        if (!row.lastName) errors.push("Last name required")
        if (!row.email || !row.email.includes("@")) errors.push("Invalid email")
        if (!row.employeeId) errors.push("Employee ID required")
        
        return {
          ...row,
          errors,
          id: idx + 1,
        }
      })
      setPreviewData(validated)
    }
    reader.readAsText(selectedFile)
  }

  const handleImportSubmit = async () => {
    if (previewData.length === 0) return
    
    setImporting(true)
    setLogs([])

    try {
      const res = await api("/api/employees/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        data: { employees: preview }
      })
      
      const data = res.data
      if (res.data) {
        setLogs(data.results || [])
        if (onImportSuccess) {
          onImportSuccess()
        }
      } else {
        alert(data.message || "Failed importing roster")
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    } finally {
      setImporting(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreviewData([])
    setLogs([])
  }

  return (
    <Card className="w-full max-w-5xl mx-auto border border-dashed border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bulk Import Roster</CardTitle>
          <CardDescription>Onboard employee databases instantly using CSV layouts.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate} size="sm">
            Download Layout Template
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive ? "border-red-500 bg-red-50/50" : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-base font-medium text-foreground">Drag & drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">Support maximum size: 5MB</p>
            <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded text-sm transition-colors">
              Choose File
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-background border p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  CSV File
                </Badge>
                <span className="font-semibold text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={importing}>
                Reset File
              </Button>
            </div>

            {logs.length > 0 ? (
              <Card className="border border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-green-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" /> Import Execution Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[240px] overflow-y-auto space-y-2 text-sm">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-1 last:border-0">
                      <span className="font-medium text-slate-700">{log.email}</span>
                      {log.success ? (
                        <Badge className="bg-green-100 text-green-800">Success (ID: {log.id})</Badge>
                      ) : (
                        <Badge variant="destructive">{log.error}</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-background">
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Status Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-semibold">{row.employeeId || "—"}</TableCell>
                        <TableCell className="font-medium">
                          {row.firstName} {row.lastName}
                        </TableCell>
                        <TableCell className="text-slate-600">{row.email}</TableCell>
                        <TableCell>{row.departmentCode || "—"}</TableCell>
                        <TableCell>{row.designationName || "—"}</TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <ShieldAlert className="h-3 w-3" /> {row.errors[0]}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Pass</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {file && logs.length === 0 && (
        <CardFooter className="flex justify-end gap-2 bg-background/50 p-4 border-t">
          <Button variant="outline" onClick={handleClear} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImportSubmit}
            disabled={importing || previewData.some((r) => r.errors.length > 0)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {importing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Execution In-Progress...
              </>
            ) : (
              "Commit Onboarding Roster"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
