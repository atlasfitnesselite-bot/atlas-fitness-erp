import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Maximize2, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Chart from 'react-apexcharts';

export default function TransformationTimeline() {
  const { memberId: paramMemberId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(paramMemberId || '');
  const [photos, setPhotos] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [compareFrom, setCompareFrom] = useState('');
  const [compareTo, setCompareTo] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      if (selectedMember !== paramMemberId) {
        navigate(`/pt/timeline/${selectedMember}`, { replace: true });
      }
      fetchProgress();
    } else {
      setPhotos([]);
      setMeasurements([]);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members', err);
    }
  };

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/pt/members/${selectedMember}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedPhotos = res.data?.progressPhotos || [];
      const fetchedMeasurements = res.data?.measurements || [];
      
      setPhotos(fetchedPhotos.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setMeasurements(fetchedMeasurements.sort((a, b) => new Date(a.date) - new Date(b.date)));
      
      if (fetchedPhotos.length >= 2) {
        setCompareFrom(fetchedPhotos[0].id); // Oldest
        setCompareTo(fetchedPhotos[fetchedPhotos.length - 1].id); // Newest
      } else if (fetchedPhotos.length === 1) {
        setCompareFrom(fetchedPhotos[0].id);
        setCompareTo(fetchedPhotos[0].id);
      }
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  const fromPhoto = photos.find(p => p.id === compareFrom);
  const toPhoto = photos.find(p => p.id === compareTo);

  const chartOptions = {
    chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
    colors: ['#dc2626', '#3b82f6', '#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { 
      categories: measurements.map(m => format(new Date(m.date), 'MMM d')),
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    theme: { mode: 'dark' },
    tooltip: { theme: 'dark' },
    legend: { labels: { colors: '#94a3b8' } }
  };

  const chartSeries = [
    { name: 'Weight (kg)', data: measurements.map(m => m.weight || 0) },
    { name: 'Body Fat (%)', data: measurements.map(m => m.bodyFat || 0) },
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transformation Timeline</h1>
          <p className="text-muted-foreground mt-1">Visualize client progress through photos and measurements</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="w-full sm:w-96">
            <Label className="text-xs mb-1 block text-muted-foreground">Select Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id?.toString()}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedMember && (
        <>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <div className="space-y-8">
              {/* Side-by-Side Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Side-by-Side Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {photos.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-3xl">
                        <div className="w-full">
                          <Label className="text-xs mb-1 block text-muted-foreground">Compare From</Label>
                          <Select value={compareFrom} onValueChange={setCompareFrom}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                            <SelectContent>
                              {photos.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {format(new Date(p.date), 'MMM d, yyyy')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground hidden sm:block shrink-0 mt-4" />
                        <div className="w-full">
                          <Label className="text-xs mb-1 block text-muted-foreground">Compare To</Label>
                          <Select value={compareTo} onValueChange={setCompareTo}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                            <SelectContent>
                              {photos.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {format(new Date(p.date), 'MMM d, yyyy')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
                        {/* From Photo */}
                        <div className="flex flex-col gap-3">
                          <div className="bg-muted/20 rounded-xl border border-border overflow-hidden aspect-[3/4] flex items-center justify-center relative">
                            {fromPhoto ? (
                              <img src={fromPhoto.photoUrl || fromPhoto.url} alt="From" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Invalid+Image' }} />
                            ) : (
                              <span className="text-muted-foreground text-sm">Select 'From' photo</span>
                            )}
                            {fromPhoto && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm font-medium">{format(new Date(fromPhoto.date), 'MMM d, yyyy')}</div>}
                          </div>
                          {fromPhoto && (
                            <div className="flex gap-4 justify-center text-sm text-muted-foreground">
                              {fromPhoto.weight && <span>Weight: {fromPhoto.weight} kg</span>}
                              {fromPhoto.bodyFat && <span>Body Fat: {fromPhoto.bodyFat}%</span>}
                            </div>
                          )}
                        </div>
                        
                        {/* To Photo */}
                        <div className="flex flex-col gap-3">
                          <div className="bg-muted/20 rounded-xl border border-border overflow-hidden aspect-[3/4] flex items-center justify-center relative">
                            {toPhoto ? (
                              <img src={toPhoto.photoUrl || toPhoto.url} alt="To" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Invalid+Image' }} />
                            ) : (
                              <span className="text-muted-foreground text-sm">Select 'To' photo</span>
                            )}
                            {toPhoto && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm font-medium">{format(new Date(toPhoto.date), 'MMM d, yyyy')}</div>}
                          </div>
                          {toPhoto && (
                            <div className="flex gap-4 justify-center text-sm text-muted-foreground">
                              {toPhoto.weight && <span>Weight: {toPhoto.weight} kg</span>}
                              {toPhoto.bodyFat && <span>Body Fat: {toPhoto.bodyFat}%</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No progress photos available for this member.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Measurements Chart */}
              {measurements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Body Measurements Progress</CardTitle>
                    <CardDescription>Weight and body fat progression over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <Chart options={chartOptions} series={chartSeries} type="line" height="100%" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chronological Timeline */}
              {photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chronological Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {photos.map(photo => (
                        <div key={photo.id} className="flex flex-col gap-2">
                          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border">
                            <img 
                              src={photo.photoUrl || photo.url} 
                              alt={`Progress ${photo.date}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200?text=Error' }}
                            />
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            {format(new Date(photo.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
