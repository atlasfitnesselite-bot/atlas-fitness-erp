import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import api from '../../lib/api';
import { 
  Camera, TrendingUp, Calendar as CalendarIcon, Upload, 
  Activity, ArrowRight, Loader2, Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

const backendUrl = 'http://localhost:3000'

export default function ClientProgressProfile() {
  const { id } = useParams()
  const { token, hasRole } = useAuthStore()
  
  const [data, setData] = useState({
    measurements: [],
    progressPhotos: [],
    latestAssessment: null,
    sessionHistory: []
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  const [compareLeft, setCompareLeft] = useState('')
  const [compareRight, setCompareRight] = useState('')
  const fileInputRef = useRef(null)

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/pt/members/${id}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
      
      if (res.data.progressPhotos?.length >= 2) {
        setCompareLeft(res.data.progressPhotos[res.data.progressPhotos.length - 1].id) // Oldest
        setCompareRight(res.data.progressPhotos[0].id) // Newest
      } else if (res.data.progressPhotos?.length === 1) {
        setCompareRight(res.data.progressPhotos[0].id)
      }
    } catch (err) {
      toast.error('Failed to load client progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [id, token])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
      setUploading(true)
      await api.post(`/api/pt/members/${id}/progress-photos`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Progress photo uploaded successfully')
      fetchProgress()
    } catch (err) {
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
  }

  const leftPhoto = data.progressPhotos.find(p => p.id === compareLeft)
  const rightPhoto = data.progressPhotos.find(p => p.id === compareRight)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transformation Tracker</h1>
          <p className="text-muted-foreground mt-1">Track body metrics, progress photos, and milestones</p>
        </div>
        {(hasRole('OWNER') || hasRole('MANAGER') || hasRole('TRAINER')) && (
          <div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2 bg-black text-white hover:bg-neutral-800">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Upload Progress Photo
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm border-border/50">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              Latest Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.latestAssessment ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Body Fat</span>
                  <span className="font-semibold text-lg">{data.latestAssessment.bodyFatPercentage}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Muscle Mass</span>
                  <span className="font-semibold text-lg">{data.latestAssessment.muscleMass} kg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Visceral Fat</span>
                  <span className="font-semibold text-lg">{data.latestAssessment.visceralFat}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">BMR</span>
                  <span className="font-semibold text-lg">{data.latestAssessment.bmr} kcal</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2 text-center">
                  Last updated: {new Date(data.latestAssessment.date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <Info className="w-8 h-8 mb-2 opacity-50" />
                <p>No assessment recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Side-by-Side Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.progressPhotos.length > 0 ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="w-full">
                    <Label className="text-xs mb-1 block text-muted-foreground">Before Photo</Label>
                    <Select value={compareLeft} onValueChange={setCompareLeft}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.progressPhotos.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {new Date(p.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground hidden sm:block shrink-0 mt-4" />
                  <div className="w-full">
                    <Label className="text-xs mb-1 block text-muted-foreground">After Photo</Label>
                    <Select value={compareRight} onValueChange={setCompareRight}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.progressPhotos.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {new Date(p.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/20 rounded-xl border border-border overflow-hidden aspect-[3/4] flex items-center justify-center relative group">
                    {leftPhoto ? (
                      <img src={`${backendUrl}${leftPhoto.photoUrl}`} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Select 'Before' photo</span>
                    )}
                    {leftPhoto && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm font-medium">{new Date(leftPhoto.date).toLocaleDateString()}</div>}
                  </div>
                  
                  <div className="bg-muted/20 rounded-xl border border-border overflow-hidden aspect-[3/4] flex items-center justify-center relative">
                    {rightPhoto ? (
                      <img src={`${backendUrl}${rightPhoto.photoUrl}`} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Select 'After' photo</span>
                    )}
                    {rightPhoto && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm font-medium">{new Date(rightPhoto.date).toLocaleDateString()}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                <Camera className="w-12 h-12 mb-4 opacity-20" />
                <p>No progress photos uploaded yet.</p>
                <p className="text-sm mt-1">Upload photos to view the side-by-side comparison.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg">Measurement History</CardTitle>
          <CardDescription>Chronological record of physical measurements</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {data.measurements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-4 py-4">Chest (cm)</th>
                    <th className="px-4 py-4">Waist (cm)</th>
                    <th className="px-4 py-4">Hip (cm)</th>
                    <th className="px-4 py-4">Biceps (cm)</th>
                    <th className="px-4 py-4">Thigh (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.measurements.map(m => (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="px-4 py-4">{m.chest || '-'}</td>
                      <td className="px-4 py-4">{m.waist || '-'}</td>
                      <td className="px-4 py-4">{m.hip || '-'}</td>
                      <td className="px-4 py-4">{m.biceps || '-'}</td>
                      <td className="px-4 py-4">{m.thigh || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="text-center py-8 text-muted-foreground">
              No measurements recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
