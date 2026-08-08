import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../../lib/api';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Trash2 } from 'lucide-react';

const NotesSection = ({ member, refreshMember }) => {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Reception');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!content.trim()) {
      toast({ title: 'Error', description: 'Note content cannot be empty', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
            const res = await api(`/api/members/${member.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: { content, category },
      });

      if (!res.data) throw new Error('Failed to add note');

      toast({ title: 'Success', description: 'Note added successfully' });
      setContent('');
      refreshMember();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
            const res = await api(`/api/members/${member.id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data) throw new Error('Failed to delete note');

      toast({ title: 'Success', description: 'Note deleted' });
      refreshMember();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
          <CardDescription>Add a new note to this member's profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-48">
            <CustomSelect
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Reception">Reception</option>
              <option value="Trainer">Trainer</option>
              <option value="Medical">Medical</option>
              <option value="Management">Management</option>
              <option value="Private">Private</option>
            </CustomSelect>
          </div>
          
          <div className="bg-card rounded-md">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              className="h-32 mb-12"
            />
          </div>

          <Button onClick={handleAddNote} disabled={loading} className="mt-4">
            {loading ? 'Adding...' : 'Add Note'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Notes</h3>
        {member.notes?.length === 0 ? (
          <p className="text-muted-foreground">No notes found.</p>
        ) : (
          member.notes?.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-semibold text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      {note.category}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">
                      Added on {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {/* Render HTML content safely */}
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: note.content }} 
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;
