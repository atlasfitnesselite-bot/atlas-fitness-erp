import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Trash2, Upload, Plus, File, Search, Building, User, Users } from 'lucide-react';

export default function DocumentCenter() {
  const { token, user, hasRole } = useAuthStore();
  const [documents, setDocuments] = useState({ companyDocs: [], employeeDocs: [], memberDocs: [] });
  const [loading, setLoading] = useState(true);
  
  const [employees, setEmployees] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    type: 'COMPANY',
    ownerId: '',
    title: '',
    category: 'GENERAL',
    description: ''
  });

  const isManager = hasRole('OWNER') || hasRole('MANAGER') || hasRole('ADMIN');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    if (!isManager) return;
    try {
      const [empRes, memRes] = await Promise.all([
        api.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/members', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setEmployees(empRes.data);
      setMembers(memRes.data);
    } catch (error) {
      toast.error('Failed to load dependency lists');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchDependencies();
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) {
      return toast.error('File and Title are required');
    }
    if (uploadData.type !== 'COMPANY' && !uploadData.ownerId) {
      return toast.error('Owner selection is required for Employee/Member documents');
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('type', uploadData.type);
      formData.append('title', uploadData.title);
      formData.append('category', uploadData.category);
      if (uploadData.ownerId) formData.append('ownerId', uploadData.ownerId);
      if (uploadData.description) formData.append('description', uploadData.description);

      await api.post('/api/documents/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Document uploaded successfully');
      setIsUploadOpen(false);
      setUploadData({ file: null, type: 'COMPANY', ownerId: '', title: '', category: 'GENERAL', description: '' });
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/api/documents/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentTable = ({ docs, type, hideOwner = false }) => (
    <div className="rounded-md border overflow-x-auto bg-card dark:bg-slate-950">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground bg-background dark:bg-card uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Document Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            {!hideOwner && <th className="px-4 py-3 font-medium">Belongs To</th>}
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                  <File className="h-8 w-8 mb-2 opacity-20" />
                  <p>No documents found</p>
                </div>
              </td>
            </tr>
          ) : (
            docs.map((doc) => (
              <tr key={doc.id} className="border-b last:border-0 hover:bg-background dark:hover:bg-card/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground dark:text-slate-100">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    {doc.title || doc.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">{doc.category}</Badge>
                </td>
                {!hideOwner && (
                  <td className="px-4 py-3 text-slate-600 dark:text-muted-foreground">
                    {type === 'EMPLOYEE' && doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : ''}
                    {type === 'MEMBER' && doc.member ? `${doc.member.firstName} ${doc.member.lastName}` : ''}
                    {type === 'COMPANY' ? 'Company (Global)' : ''}
                  </td>
                )}
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatSize(doc.fileSize)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700" onClick={() => window.open(`http://localhost:3000${doc.fileUrl}`, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {isManager && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(doc.id, type)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Center</h2>
          <p className="text-muted-foreground text-sm">Manage policies, contracts, and certificates securely.</p>
        </div>
        {isManager && (
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>Add a new file to the document center.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Document Scope</Label>
                  <Select value={uploadData.type} onValueChange={v => setUploadData({...uploadData, type: v, ownerId: '', category: 'GENERAL'})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPANY">Company Policy / Global</SelectItem>
                      <SelectItem value="EMPLOYEE">Employee Document</SelectItem>
                      <SelectItem value="MEMBER">Member Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {uploadData.type === 'EMPLOYEE' && (
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <Select value={uploadData.ownerId} onValueChange={v => setUploadData({...uploadData, ownerId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {uploadData.type === 'MEMBER' && (
                  <div className="space-y-2">
                    <Label>Select Member</Label>
                    <Select value={uploadData.ownerId} onValueChange={v => setUploadData({...uploadData, ownerId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger>
                      <SelectContent>
                        {members.map(mem => (
                          <SelectItem key={mem.id} value={mem.id}>{mem.firstName} {mem.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={uploadData.category} onValueChange={v => setUploadData({...uploadData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {uploadData.type === 'COMPANY' && (
                        <>
                          <SelectItem value="POLICY">Gym Policy</SelectItem>
                          <SelectItem value="TEMPLATE">Template</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </>
                      )}
                      {uploadData.type === 'EMPLOYEE' && (
                        <>
                          <SelectItem value="CONTRACT">Employment Contract</SelectItem>
                          <SelectItem value="SALARY_SLIP">Salary Slip</SelectItem>
                          <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                          <SelectItem value="MEDICAL">Medical Certificate</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </>
                      )}
                      {uploadData.type === 'MEMBER' && (
                        <>
                          <SelectItem value="PT_AGREEMENT">PT Agreement</SelectItem>
                          <SelectItem value="MEDICAL">Medical Certificate</SelectItem>
                          <SelectItem value="INVOICE">Invoice</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input 
                    placeholder="e.g., Q3 Safety Policy" 
                    value={uploadData.title} 
                    onChange={e => setUploadData({...uploadData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>File</Label>
                  <Input 
                    type="file" 
                    onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Upload</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="company" className="flex items-center gap-2"><Building className="h-4 w-4" /> Gym Policies</TabsTrigger>
          <TabsTrigger value="employee" className="flex items-center gap-2"><Users className="h-4 w-4" /> My HR Docs</TabsTrigger>
          {isManager && <TabsTrigger value="member" className="flex items-center gap-2"><User className="h-4 w-4" /> Member Docs</TabsTrigger>}
        </TabsList>
        <div className="mt-4">
          <TabsContent value="company" className="m-0">
            <DocumentTable docs={documents.companyDocs} type="COMPANY" hideOwner={true} />
          </TabsContent>
          <TabsContent value="employee" className="m-0">
            <DocumentTable docs={documents.employeeDocs} type="EMPLOYEE" hideOwner={!isManager} />
          </TabsContent>
          {isManager && (
            <TabsContent value="member" className="m-0">
              <DocumentTable docs={documents.memberDocs} type="MEMBER" />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
