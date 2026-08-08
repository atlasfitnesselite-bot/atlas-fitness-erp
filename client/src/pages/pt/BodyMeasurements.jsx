import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"
import api from "../../lib/api"
import { Activity } from "lucide-react"

export default function BodyMeasurements() {
  const { user } = useAuthStore()
  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    chest: "", waist: "", hip: "", neck: "", biceps: "", forearm: "", thigh: "", calf: ""
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    if (selectedMemberId) {
      fetchProgress(selectedMemberId)
    }
  }, [selectedMemberId])

  const fetchMembers = async () => {
    try {
      const res = await api.get("/api/members")
      let memList = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : [])
      if (!Array.isArray(memList)) memList = []
      setMembers(memList)
    } catch (error) {
      console.error("Error fetching members", error)
      setMembers([])
    }
  }

  const fetchProgress = async (memberId) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/pt/members/${memberId}/progress`)
      setMeasurements(res.data?.measurements || [])
    } catch (error) {
      console.error("Error fetching progress", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedMemberId) return toast.error("Please select a member first")
    
    try {
      const payload = {}
      Object.keys(formData).forEach(k => {
        if (formData[k]) payload[k] = parseFloat(formData[k])
      })
      
      await api.post(`/api/pt/members/${selectedMemberId}/measurements`, payload)
      toast.success("Measurements saved")
      setFormData({ chest: "", waist: "", hip: "", neck: "", biceps: "", forearm: "", thigh: "", calf: "" })
      fetchProgress(selectedMemberId)
    } catch (error) {
      toast.error("Failed to save measurements")
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Body Measurements</h1>
          <p className="text-muted-foreground">Log and track client body measurements.</p>
        </div>
        <div className="w-64">
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id.toString()}>{m.firstName} {m.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log New Measurement</CardTitle>
            <CardDescription>Enter values in inches or cm</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(formData).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key}</Label>
                    <Input 
                      type="number" step="0.1" 
                      value={formData[key]} 
                      onChange={e => setFormData({...formData, [key]: e.target.value})}
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={!selectedMemberId}>
                Save Measurements
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedMemberId ? (
              <div className="text-center text-muted-foreground py-8">Select a client to view history</div>
            ) : loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : measurements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No measurements logged yet.</div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-auto">
                {measurements.map((m, i) => (
                  <div key={m.id || i} className="border p-4 rounded-lg flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{new Date(m.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(m).map(([k, v]) => {
                          if (v !== null && !["id", "memberId", "date"].includes(k)) {
                            return <span key={k} className="capitalize">{k}: {v}</span>
                          }
                          return null
                        })}
                      </div>
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
