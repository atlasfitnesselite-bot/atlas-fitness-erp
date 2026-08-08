import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../../lib/api';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, File, Trash2, Download } from 'lucide-react';

const DocumentManager = ({ member, refreshMember }) => {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file || !type || !title) {
      toast({ title: 'Error', description: 'Please fill all fields and select a file', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('title', title);

    try {
            const res = await api(`/api/members/${member.id}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.data) throw new Error('Upload failed');

      toast({ title: 'Success', description: 'Document uploaded successfully' });
      setFile(null);
      setTitle('');
      setType('');
      
      // reset file input
      const fileInput = document.getElementById('document-upload');
      if (fileInput) fileInput.value = '';
      
      refreshMember();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
            const res = await api(`/api/members/${member.id}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data) throw new Error('Failed to delete document');

      toast({ title: 'Success', description: 'Document deleted' });
      refreshMember();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Upload member IDs, medical certificates, or contracts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <CustomSelect
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="" disabled>Document Type</option>
                <option value="ID Proof (Aadhaar)">ID Proof (Aadhaar)</option>
                <option value="Passport">Passport</option>
                <option value="Medical Certificate">Medical Certificate</option>
                <option value="Membership Contract">Membership Contract</option>
                <option value="Waiver Form">Waiver Form</option>
                <option value="Other">Other</option>
              </CustomSelect>
            </div>
            
            <div className="space-y-2">
              <Input 
                placeholder="Document Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Input 
              id="document-upload"
              type="file" 
              onChange={handleFileChange} 
              className="flex-1"
            />
            <Button onClick={handleUpload} disabled={loading || !file}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Saved Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(!member.documents || member.documents.length === 0) ? (
            <p className="text-muted-foreground col-span-2">No documents uploaded.</p>
          ) : (
            member.documents.map((doc) => (
              <Card key={doc.id} className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium truncate" title={doc.title}>{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => window.open(doc.fileUrl, '_blank')}>
                    <Download className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
