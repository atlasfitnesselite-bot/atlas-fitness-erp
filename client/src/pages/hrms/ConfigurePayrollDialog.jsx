import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Settings2 } from "lucide-react"
import { toast } from "sonner"
import api from '../../lib/api';

export default function ConfigurePayrollDialog({ employeeId, employeeName, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [baseSalary, setBaseSalary] = useState(0)
  const [ptCommission, setPtCommission] = useState(0)
  const [allowances, setAllowances] = useState([])
  const [deductions, setDeductions] = useState([])

  useEffect(() => {
    if (open) {
      fetchStructure()
    }
  }, [open])

  const fetchStructure = async () => {
    try {
      const { data } = await api.get(`/api/payroll/structure/${employeeId}`)
      if (data) {
        setBaseSalary(data.baseSalary || 0)
        setPtCommission(data.ptCommissionPercentage || 0)
        
        if (data.standardAllowances) {
          const parsed = JSON.parse(data.standardAllowances)
          setAllowances(Object.entries(parsed).map(([key, value]) => ({ key, value })))
        } else {
          setAllowances([])
        }

        if (data.standardDeductions) {
          const parsed = JSON.parse(data.standardDeductions)
          setDeductions(Object.entries(parsed).map(([key, value]) => ({ key, value })))
        } else {
          setDeductions([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch structure:", error)
      // Defaults
      setBaseSalary(0)
      setPtCommission(0)
      setAllowances([])
      setDeductions([])
    }
  }

  const addField = (setter) => {
    setter(prev => [...prev, { key: "", value: 0 }])
  }

  const updateField = (setter, index, field, val) => {
    setter(prev => {
      const copy = [...prev]
      copy[index][field] = field === 'value' ? Number(val) : val
      return copy
    })
  }

  const removeField = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      const standardAllowances = {}
      allowances.forEach(a => {
        if (a.key.trim()) standardAllowances[a.key] = a.value
      })

      const standardDeductions = {}
      deductions.forEach(d => {
        if (d.key.trim()) standardDeductions[d.key] = d.value
      })

      const payload = {
        baseSalary: Number(baseSalary),
        ptCommissionPercentage: Number(ptCommission),
        standardAllowances,
        standardDeductions
      }

      await api.put(`/api/payroll/structure/${employeeId}`, payload)
      toast.success("Payroll structure updated")
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to save structure")
    } finally {
      setLoading(false)
    }
  }

  const renderFields = (title, items, setter) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Button type="button" variant="outline" size="sm" onClick={() => addField(setter)}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No items added.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input 
                placeholder="Name (e.g. Travel)" 
                value={item.key} 
                onChange={(e) => updateField(setter, index, 'key', e.target.value)}
                className="h-8 text-sm"
              />
              <Input 
                type="number" 
                placeholder="Amount" 
                value={item.value} 
                onChange={(e) => updateField(setter, index, 'value', e.target.value)}
                className="h-8 text-sm w-32"
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeField(setter, index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" /> Configure Structure
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payroll Structure: {employeeName}</DialogTitle>
          <DialogDescription>
            Configure the base salary, commission percentage, and fixed allowances/deductions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Salary (Monthly)</Label>
              <Input 
                type="number" 
                value={baseSalary} 
                onChange={e => setBaseSalary(e.target.value)} 
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>PT Commission (%)</Label>
              <Input 
                type="number" 
                value={ptCommission} 
                onChange={e => setPtCommission(e.target.value)} 
                min="0"
                max="100"
              />
            </div>
          </div>

          <hr />

          {renderFields("Standard Allowances", allowances, setAllowances)}
          
          <hr />

          {renderFields("Standard Deductions", deductions, setDeductions)}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Saving..." : "Save Structure"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
