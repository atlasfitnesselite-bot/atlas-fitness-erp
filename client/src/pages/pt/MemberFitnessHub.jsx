import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Utensils, CalendarDays, Activity, Flame, Droplets, Plus, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/useAuthStore"
import api from '../../lib/api';
import { ChevronDown, Check } from "lucide-react"

const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="relative w-full">
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className="truncate">
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {open && (
        <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {options.length === 0 ? (
            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none opacity-50">No options found</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${value === opt.value ? 'bg-accent text-accent-foreground' : ''}`}
              >
                {opt.label}
                {value === opt.value && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Invisible overlay to close dropdown when clicking outside */}
      {open && <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />}
    </div>
  )
}

export default function MemberFitnessHub() {
  const [plans, setPlans] = useState({ workout: null, diet: null })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  const { hasRole, token } = useAuthStore()
  const canCreate = hasRole('OWNER') || hasRole('MANAGER') || hasRole('TRAINER')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editPlanId, setEditPlanId] = useState(null)
  
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])

  const [formData, setFormData] = useState({
    memberId: '',
    trainerId: '',
    type: 'WORKOUT',
    title: '',
    workoutDesc: '',
    exercises: [],
    calories: '',
    water: '',
    protein: '',
    meals: []
  })

  const addExercise = () => setFormData(p => ({ ...p, exercises: [...p.exercises, { name: '', sets: 3, reps: 10 }] }))
  const removeExercise = (i) => setFormData(p => ({ ...p, exercises: p.exercises.filter((_, idx) => idx !== i) }))
  const updateExercise = (i, field, val) => setFormData(p => {
    const newEx = [...p.exercises]
    newEx[i] = { ...newEx[i], [field]: val }
    return { ...p, exercises: newEx }
  })

  const addMeal = () => setFormData(p => ({ ...p, meals: [...p.meals, { time: '', name: '', items: '' }] }))
  const removeMeal = (i) => setFormData(p => ({ ...p, meals: p.meals.filter((_, idx) => idx !== i) }))
  const updateMeal = (i, field, val) => setFormData(p => {
    const newMeals = [...p.meals]
    newMeals[i] = { ...newMeals[i], [field]: val }
    return { ...p, meals: newMeals }
  })

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/pt/fitness-plans", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      const data = res.data || []
      const plansArray = Array.isArray(data) ? data : (data.data || [])
      
      let workoutData = plansArray.find(p => p.type === 'WORKOUT')
      let dietData = plansArray.find(p => p.type === 'DIET')

      if (workoutData && typeof workoutData.content === 'string') {
        try { workoutData = { ...workoutData, content: JSON.parse(workoutData.content) } } catch(e) {}
      }
      if (dietData && typeof dietData.content === 'string') {
        try { dietData = { ...dietData, content: JSON.parse(dietData.content) } } catch(e) {}
      }

      setPlans({
        workout: workoutData || null,
        diet: dietData || null
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Notice", description: "Could not load current fitness plans." })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    if (!canCreate) return;
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [memRes, empRes] = await Promise.all([
        api.get("/api/members", { headers }).catch(() => ({ data: [] })),
        api.get("/api/employees", { headers }).catch(() => ({ data: { employees: [] } }))
      ])
      let memList = memRes.data?.data || memRes.data?.items || (Array.isArray(memRes.data) ? memRes.data : [])
      setMembers(memList)

      let allEmps = empRes.data?.items || empRes.data?.data || (Array.isArray(empRes.data) ? empRes.data : [])
      setTrainers(allEmps.filter(e => e.status === 'ACTIVE'))
    } catch (e) {
      console.error("Failed to fetch users", e)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchUsers()
  }, [])

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let contentObj = {}
      if (formData.type === 'WORKOUT') {
        contentObj = {
          description: formData.workoutDesc,
          exercises: formData.exercises
        }
      } else {
        contentObj = {
          calories: formData.calories,
          water: formData.water,
          protein: formData.protein,
          meals: formData.meals
        }
      }

      if (editPlanId) {
        await api.put(`/api/pt/fitness-plans/${editPlanId}`, {
          memberId: formData.memberId,
          trainerId: formData.trainerId,
          type: formData.type,
          title: formData.title,
          content: contentObj
        }, { headers: { Authorization: `Bearer ${token}` } })
        toast({ title: "Success", description: "Plan updated." })
      } else {
        await api.post("/api/pt/fitness-plans", {
          memberId: formData.memberId,
          trainerId: formData.trainerId,
          type: formData.type,
          title: formData.title,
          content: contentObj
        }, { headers: { Authorization: `Bearer ${token}` } })
        toast({ title: "Success", description: "Plan created." })
      }
      
      setIsDialogOpen(false)
      setEditPlanId(null)
      setFormData({ 
        memberId: '', trainerId: '', type: 'WORKOUT', title: '', 
        workoutDesc: '', exercises: [], calories: '', water: '', protein: '', meals: [] 
      })
      fetchPlans()
    } catch (err) {
      toast({ title: "Error", description: err.message || err.response?.data?.message || "Failed to create plan", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlan = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/api/pt/fitness-plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "Plan deleted." });
      fetchPlans();
    } catch (e) {
      toast({ title: "Error", description: "Could not delete plan.", variant: "destructive" });
    }
  }

  const handleEditPlan = (plan) => {
    setEditPlanId(plan.id)
    const content = plan.content || {}
    setFormData({
      memberId: plan.memberId,
      trainerId: plan.trainerId,
      type: plan.type,
      title: plan.title || '',
      workoutDesc: plan.type === 'WORKOUT' ? content.description || '' : '',
      exercises: plan.type === 'WORKOUT' ? content.exercises || [] : [],
      calories: plan.type === 'DIET' ? content.calories || '' : '',
      water: plan.type === 'DIET' ? content.water || '' : '',
      protein: plan.type === 'DIET' ? content.protein || '' : '',
      meals: plan.type === 'DIET' ? content.meals || [] : [],
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-card/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Fitness Hub</h1>
          <p className="text-foreground mt-2 max-w-lg">Track tailored workout routines and diet plans. Stay committed to goals with professional guidance.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditPlanId(null)
                setFormData({ memberId: '', trainerId: '', type: 'WORKOUT', title: '', workoutDesc: '', exercises: [], calories: '', water: '', protein: '', meals: [] })
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-card text-foreground hover:bg-slate-100 border-0">
                  <Plus className="mr-2 h-4 w-4" /> Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editPlanId ? "Edit Fitness Plan" : "Create New Fitness Plan"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePlan} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Member</Label>
                    <CustomDropdown 
                      value={formData.memberId} 
                      onChange={v => setFormData({...formData, memberId: v})}
                      placeholder="Select Member..."
                      options={members.map(m => ({ value: m.id?.toString(), label: `${m.firstName} ${m.lastName}` }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Trainer</Label>
                    <CustomDropdown 
                      value={formData.trainerId} 
                      onChange={v => setFormData({...formData, trainerId: v})}
                      placeholder="Select Trainer..."
                      options={trainers.map(t => ({ value: t.id?.toString(), label: `${t.firstName} ${t.lastName} ${t.designation?.name ? `(${t.designation.name})` : ''}`.trim() }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <CustomDropdown 
                      value={formData.type} 
                      onChange={v => setFormData({...formData, type: v})}
                      placeholder="Select Plan Type"
                      options={[
                        { value: 'WORKOUT', label: 'Workout' },
                        { value: 'DIET', label: 'Diet' }
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Strength Training Phase 1" />
                  </div>

                  {formData.type === 'WORKOUT' ? (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="space-y-2">
                        <Label>Workout Description</Label>
                        <Input value={formData.workoutDesc} onChange={e => setFormData({...formData, workoutDesc: e.target.value})} placeholder="e.g. Focus on progressive overload" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Exercises</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addExercise}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                        </div>
                        {formData.exercises.map((ex, i) => (
                          <div key={i} className="flex gap-2 items-center bg-muted/30 border border-border p-2 rounded-md">
                            <Input placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} className="flex-1 bg-background" />
                            <Input type="number" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} className="w-16 bg-background" />
                            <Input type="number" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} className="w-16 bg-background" />
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(i)} className="text-red-500 p-0 h-8 w-8 hover:bg-red-100 hover:text-red-700">&times;</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                          <Label>Calories</Label>
                          <Input value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} placeholder="e.g. 2000" />
                        </div>
                        <div className="space-y-2">
                          <Label>Water</Label>
                          <Input value={formData.water} onChange={e => setFormData({...formData, water: e.target.value})} placeholder="e.g. 3L" />
                        </div>
                        <div className="space-y-2">
                          <Label>Protein</Label>
                          <Input value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} placeholder="e.g. 150g" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Meals</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addMeal}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                        </div>
                        {formData.meals.map((meal, i) => (
                          <div key={i} className="flex flex-col gap-2 bg-muted/30 border border-border p-3 rounded-md relative mt-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeMeal(i)} className="absolute top-1 right-1 text-red-500 p-0 h-6 w-6 hover:bg-red-100 hover:text-red-700">&times;</Button>
                            <Input placeholder="Time (e.g. 8:00 AM)" value={meal.time} onChange={e => updateMeal(i, 'time', e.target.value)} className="w-full pr-8 bg-background" />
                            <Input placeholder="Meal Name (e.g. Breakfast)" value={meal.name} onChange={e => updateMeal(i, 'name', e.target.value)} className="w-full bg-background" />
                            <Input placeholder="Items (e.g. 2 eggs, toast)" value={meal.items} onChange={e => updateMeal(i, 'items', e.target.value)} className="w-full bg-background" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Plan"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {!canCreate && (
             <Button className="bg-card text-foreground hover:bg-slate-100 border-0">
               <Activity className="mr-2 h-4 w-4" /> Request Update
             </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-slate-100">
          <TabsTrigger value="workout" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Dumbbell className="h-4 w-4 mr-2" /> Workout Plan
          </TabsTrigger>
          <TabsTrigger value="diet" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Utensils className="h-4 w-4 mr-2" /> Diet Plan
          </TabsTrigger>
        </TabsList>
        
        {/* WORKOUT TAB */}
        <TabsContent value="workout" className="mt-6">
          {loading ? (
             <div className="space-y-4">
               <div className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="h-48 bg-slate-100 animate-pulse rounded-xl"></div>
                 <div className="h-48 bg-slate-100 animate-pulse rounded-xl"></div>
               </div>
             </div>
          ) : plans.workout ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plans.workout.title || "Current Routine"}</CardTitle>
                    <CardDescription>{plans.workout.description || plans.workout.content?.description || "Follow this plan for optimal results."}</CardDescription>
                  </div>
                  {canCreate && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plans.workout)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plans.workout.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {plans.workout.content?.exercises?.map((ex, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background border border-slate-100">
                        <div className="h-12 w-12 rounded-full bg-card text-white flex items-center justify-center shrink-0">
                          <Dumbbell className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{ex.name}</p>
                          <p className="text-sm text-muted-foreground">{ex.sets} Sets • {ex.reps} Reps</p>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No exercises found.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-background/50">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <Dumbbell className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No Workout Plan Yet</h3>
                <p className="text-muted-foreground max-w-md mt-2 mb-6">
                  You don't have an active workout plan assigned. Reach out to your trainer to get started on your fitness journey.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* DIET TAB */}
        <TabsContent value="diet" className="mt-6">
          {loading ? (
             <div className="space-y-4">
               <div className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
             </div>
          ) : plans.diet ? (
             <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plans.diet.title || "Nutrition Guide"}</CardTitle>
                    <CardDescription>{plans.diet.description || plans.diet.content?.description || "Fuel your body right."}</CardDescription>
                  </div>
                  {canCreate && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plans.diet)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plans.diet.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 flex items-center gap-4">
                       <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                         <Flame className="h-6 w-6" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-orange-600/80">Daily Calories</p>
                         <p className="text-2xl font-bold text-orange-700">{plans.diet.content?.calories || "2000"} kcal</p>
                       </div>
                     </div>
                     <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex items-center gap-4">
                       <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                         <Droplets className="h-6 w-6" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-blue-600/80">Water Intake</p>
                         <p className="text-2xl font-bold text-blue-700">{plans.diet.content?.water || "3L"}</p>
                       </div>
                     </div>
                     <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex items-center gap-4">
                       <div className="p-3 bg-green-100 rounded-lg text-green-600">
                         <Activity className="h-6 w-6" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-green-600/80">Protein Target</p>
                         <p className="text-2xl font-bold text-green-700">{plans.diet.content?.protein || "150g"}</p>
                       </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" /> Meal Schedule
                    </h3>
                    <div className="space-y-3">
                      {plans.diet.content?.meals?.map((meal, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-background border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{meal.time}</span>
                            <span className="font-semibold text-foreground text-lg">{meal.name}</span>
                            <span className="text-slate-600 text-sm mt-1">{meal.items}</span>
                          </div>
                        </div>
                      )) || <p className="text-muted-foreground">No meals defined.</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
          ) : (
            <Card className="border-dashed border-2 bg-background/50">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <Utensils className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No Diet Plan Yet</h3>
                <p className="text-muted-foreground max-w-md mt-2 mb-6">
                  Your personalized nutrition plan has not been generated yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
