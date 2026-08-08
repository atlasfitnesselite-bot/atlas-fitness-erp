import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import api from "../../lib/api"
import { ArrowRight } from "lucide-react"

export default function PTProgress() {
  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await api.get("/api/members")
      let membersData = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : [])
      if (!Array.isArray(membersData)) membersData = []
      setMembers(membersData)
    } catch (error) {
      console.error("Error fetching members", error)
      setMembers([])
    }
  }

  const handleProceed = () => {
    if (selectedMemberId) {
      navigate(`/pt/members/${selectedMemberId}/progress`)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">PT Progress & Photos</CardTitle>
          <CardDescription>Select a client to view their transformation tracker, body metrics, and progress photos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Client</label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id.toString()}>{m.firstName} {m.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleProceed} disabled={!selectedMemberId} className="w-full">
            View Transformation Tracker <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
