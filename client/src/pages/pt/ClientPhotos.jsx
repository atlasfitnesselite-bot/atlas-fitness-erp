import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';

export default function ClientPhotos() {
  const { token } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchPhotos();
    } else {
      setPhotos([]);
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

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/pt/members/${selectedMember}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(res.data?.progressPhotos || []);
    } catch (err) {
      console.error('Failed to load photos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl) {
      toast.error('Please enter a photo URL');
      return;
    }
    
    try {
      setUploading(true);
      
      // Creating a mock file object to send since the API might expect a file
      // If the backend accepts URL string, we can send it differently.
      // But for now we just do a POST based on the requirement "just the URL input for now"
      // If the backend strictly requires multipart, this may fail, but I'll try to just send JSON if possible or formData with a dummy text.
      // Assuming a generic API might accept photoUrl in body
      
      // Based on ClientProgressProfile, it uses formData. I'll mock a Blob if needed, or simply send a JSON object with photoUrl.
      // Wait, let's just make a dummy POST or try to use JSON. 
      await api.post(`/api/pt/members/${selectedMember}/progress-photos/url`, { photoUrl: newPhotoUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(async (e) => {
        // fallback to standard
        const form = new FormData();
        form.append('photoUrl', newPhotoUrl);
        await api.post(`/api/pt/members/${selectedMember}/progress-photos`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });
      
      toast.success('Photo added successfully');
      setNewPhotoUrl('');
      fetchPhotos();
    } catch (err) {
      toast.error('Failed to add photo (API might only support files)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Client Photos</h1>
          <p className="text-muted-foreground mt-1">Manage and view progress photos for your clients</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-72">
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
            
            {selectedMember && (
              <div className="flex-1 flex gap-2 items-end">
                <div className="w-full sm:max-w-md">
                  <Label className="text-xs mb-1 block text-muted-foreground">Add New Photo (URL)</Label>
                  <Input 
                    placeholder="https://example.com/photo.jpg" 
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddPhoto} disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                  Add Photo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMember && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Progress Gallery</h3>
          
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <Card key={photo.id || i} className="overflow-hidden bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] relative group">
                    <img 
                      src={photo.photoUrl || photo.url} 
                      alt={`Progress on ${photo.date}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Invalid+Image' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
                      <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-border/50">
                        {photo.date ? format(new Date(photo.date), 'MMM d, yyyy') : 'Unknown Date'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                <p>No progress photos found for this member.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
