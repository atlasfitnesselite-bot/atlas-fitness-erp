import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Download, Printer, MoreVertical, 
  Eye, Edit, Trash, Activity, Archive 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MemberDirectory = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || '';
      const res = await api.get(`/api/members?search=${search}`);
      if (!res.data) throw new Error("Failed to fetch members");
      const data = res.data;
      setMembers(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const token = localStorage.getItem("token") || '';
        const res = await api(`/api/members/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data) throw new Error("Failed to delete");
        toast({
          title: "Success",
          description: "Member deleted successfully"
        });
        fetchMembers();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete member",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member Directory</h1>
          <p className="text-muted-foreground">Manage gym members, view profiles, and update information.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => navigate('/members/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, mobile, or email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profilePicture} />
                          <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.firstName} {member.lastName}</div>
                          <div className="text-sm text-muted-foreground">{member.memberId || `MEM-${String(member.id).padStart(4, '0')}`}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{member.mobile}</div>
                      <div className="text-sm text-muted-foreground">{member.email || 'No email'}</div>
                    </TableCell>
                    <TableCell>{member.branch}</TableCell>
                    <TableCell>{new Date(member.joiningDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/members/${member.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/members/${member.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(member.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default MemberDirectory;
