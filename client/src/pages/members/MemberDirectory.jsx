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
import { CustomSelect } from '@/components/ui/custom-select';

const MemberDirectory = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('memberId:asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setPage(1);
  }, [search, sortOption, statusFilter, genderFilter, limit]);

  useEffect(() => {
    fetchMembers();
  }, [search, sortOption, statusFilter, genderFilter, page, limit]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const [sortBy, sortOrder] = sortOption.split(':');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (genderFilter) params.set('gender', genderFilter);

      const res = await api.get(`/api/members?${params.toString()}`);
      if (!res.data) throw new Error("Failed to fetch members");
      const data = res.data;
      setMembers(data.data || []);
      if (data.meta) {
        setMeta({ total: data.meta.total || 0, totalPages: data.meta.totalPages || 1 });
      }
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

  const handleExportCsv = () => {
    const headers = ['Member ID', 'Name', 'Mobile', 'Email', 'Branch', 'Join Date', 'Status'];
    const rows = members.map((m) => [
      m.memberId,
      `${m.firstName}${m.lastName && m.lastName !== '-' ? ' ' + m.lastName : ''}`,
      m.mobile,
      m.email || '',
      m.branch || '',
      m.joiningDate ? new Date(m.joiningDate).toLocaleDateString() : '',
      m.status,
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Members_Page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <Button variant="outline" className="hidden sm:flex" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => navigate('/members/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row justify-between gap-3">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, mobile, or email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-nowrap">
              <div className="w-48 shrink-0">
                <CustomSelect
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="memberId:asc">Sort: ID (001 → 999)</option>
                  <option value="memberId:desc">Sort: ID (999 → 001)</option>
                  <option value="firstName:asc">Sort: Name (A → Z)</option>
                  <option value="firstName:desc">Sort: Name (Z → A)</option>
                  <option value="joiningDate:desc">Sort: Newest Joined</option>
                  <option value="joiningDate:asc">Sort: Oldest Joined</option>
                </CustomSelect>
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                className="shrink-0"
                onClick={() => setShowFilters((v) => !v)}
              >
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <Button variant="outline" className="shrink-0" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t">
              <CustomSelect
                className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="PENDING">PENDING</option>
                <option value="INACTIVE">INACTIVE</option>
              </CustomSelect>
              <CustomSelect
                className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </CustomSelect>
              <CustomSelect
                className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                value={String(limit)}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
                <option value="250">250 per page</option>
              </CustomSelect>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('');
                  setGenderFilter('');
                  setSortOption('memberId:asc');
                  setSearch('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
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
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <Avatar>
                          <AvatarImage src={member.profilePicture} />
                          <AvatarFallback>
                            {member.firstName?.[0]}
                            {member.lastName && member.lastName !== '-' ? member.lastName[0] : ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.firstName}
                            {member.lastName && member.lastName !== '-' ? ` ${member.lastName}` : ''}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({member.memberId || `MEM-${String(member.id).padStart(4, '0')}`})
                          </span>
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
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <div>
            Showing {members.length} of {meta.total} members (Page {page} of {meta.totalPages})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MemberDirectory;
