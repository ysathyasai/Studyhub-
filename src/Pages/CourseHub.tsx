"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CommunityGroup } from '@/entities/CommunityGroup';
import { CommunityPost } from '@/entities/CommunityPost';
import { User } from '@/entities/User';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Users, Share2, Upload, Link as LinkIcon, Code, FileText, Video, Heart, MessageCircle, Pin, Copy, Search, Filter, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadFile } from '@/integrations/Core';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CommunityHubPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [groupForm, setGroupForm] = useState({ name: '', description: '', category: 'general', isPublic: true, tags: [] });
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'text', attachments: [] as any[] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      const [groupsData, usersData, userData] = await Promise.all([
        CommunityGroup.list('createdAt:desc'),
        User.list(),
        User.me()
      ]);
      setGroups(groupsData);
      setUsers(usersData.filter((u: any) => u.isPublic));
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPosts = async (groupId: string) => {
    try {
      const postsData = await CommunityPost.filter({ groupId }, 'createdAt:desc');
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name) {
      toast({ title: "Missing fields", description: "Group name is required", variant: "destructive" });
      return;
    }
    try {
      await CommunityGroup.create({
        ...groupForm,
        inviteCode: generateInviteCode(),
        members: [{ userId: currentUser.id, role: 'admin', joinedAt: new Date().toISOString() }],
        memberCount: 1
      });
      loadData();
      setIsGroupFormOpen(false);
      setGroupForm({ name: '', description: '', category: 'general', isPublic: true, tags: [] });
      toast({ title: "Success", description: "Community group created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    }
  };

  const joinGroup = async (inviteCode: string) => {
    const code = inviteCode || prompt('Enter group invite code:');
    if (!code) return;
    try {
      const group = groups.find(g => g.inviteCode === code.toUpperCase());
      if (!group) {
        toast({ title: "Invalid code", description: "Group not found", variant: "destructive" });
        return;
      }
      if ((group.members || []).some((m: any) => m.userId === currentUser.id)) {
        toast({ title: "Already a member", description: "You're already in this group" });
        return;
      }
      const updatedMembers = [...(group.members || []), { userId: currentUser.id, role: 'member', joinedAt: new Date().toISOString() }];
      await CommunityGroup.update(group.id, { members: updatedMembers, memberCount: updatedMembers.length });
      loadData();
      toast({ title: "Success", description: "Joined group successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to join group", variant: "destructive" });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await UploadFile({ file });
      const attachment = { name: file.name, url: result.file_url, type: file.type, size: file.size };
      setPostForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
      toast({ title: "Success", description: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content || !selectedGroup) {
      toast({ title: "Missing fields", description: "Title, content, and group selection are required", variant: "destructive" });
      return;
    }
    try {
      await CommunityPost.create({ ...postForm, groupId: selectedGroup.id });
      loadPosts(selectedGroup.id);
      setIsPostFormOpen(false);
      setPostForm({ title: '', content: '', type: 'text', attachments: [] });
      toast({ title: "Success", description: "Post created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: "Copied!", description: "Invite code copied to clipboard" });
  };

  const filteredGroups = groups.filter(group => 
    (group.name.toLowerCase().includes(searchTerm.toLowerCase()) || group.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || group.category === filterCategory)
  );

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Users className="h-8 w-8 text-primary" />Community Hub</h1>
          <p className="text-muted-foreground">Connect, share, and learn together</p>
        </div>
      </div>

      <Tabs defaultValue="groups">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search groups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="study-group">Study Groups</SelectItem>
                  <SelectItem value="subject-specific">Subject Specific</SelectItem>
                  <SelectItem value="project-collaboration">Project Collaboration</SelectItem>
                  <SelectItem value="exam-prep">Exam Preparation</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" onClick={() => joinGroup('')}><Share2 className="mr-2 h-4 w-4" />Join</Button>
              <Dialog open={isGroupFormOpen} onOpenChange={setIsGroupFormOpen}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Create</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Create Group</DialogTitle></DialogHeader>
                  <form onSubmit={createGroup} className="space-y-4">
                    <Input value={groupForm.name} onChange={(e) => setGroupForm(p => ({ ...p, name: e.target.value }))} placeholder="Group Name" required />
                    <Textarea value={groupForm.description} onChange={(e) => setGroupForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                    <Select value={groupForm.category} onValueChange={(v) => setGroupForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="study-group">Study Group</SelectItem>
                        <SelectItem value="subject-specific">Subject Specific</SelectItem>
                        <SelectItem value="project-collaboration">Project Collaboration</SelectItem>
                        <SelectItem value="exam-prep">Exam Prep</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsGroupFormOpen(false)}>Cancel</Button><Button type="submit">Create</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><Card><CardHeader><CardTitle>Groups ({filteredGroups.length})</CardTitle></CardHeader><CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredGroups.map(group => (
                <div key={group.id} className={`p-3 rounded-lg border cursor-pointer ${selectedGroup?.id === group.id ? 'bg-primary/10 border-primary' : 'hover:bg-secondary'}`} onClick={() => { setSelectedGroup(group); loadPosts(group.id); }}>
                  <div className="flex justify-between items-start"><div className="flex-1"><h3 className="font-medium">{group.name}</h3><p className="text-sm text-muted-foreground">{group.memberCount} members</p></div><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyInviteLink(group.inviteCode); }}><Copy className="h-4 w-4" /></Button></div>
                </div>
              ))}
            </CardContent></Card></div>
            <div className="lg:col-span-2">{selectedGroup ? <div className="space-y-4"><Card><CardHeader><div className="flex justify-between items-start"><div><CardTitle>{selectedGroup.name}</CardTitle><CardDescription>{selectedGroup.description}</CardDescription></div>
              <Dialog open={isPostFormOpen} onOpenChange={setIsPostFormOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Post</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Create Post</DialogTitle></DialogHeader>
                  <form onSubmit={createPost} className="space-y-4">
                    <Input value={postForm.title} onChange={(e) => setPostForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" required />
                    <Textarea value={postForm.content} onChange={(e) => setPostForm(p => ({ ...p, content: e.target.value }))} placeholder="Content" required />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Upload</Button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                    {postForm.attachments.map((att, i) => <div key={i} className="text-sm">{att.name}</div>)}
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsPostFormOpen(false)}>Cancel</Button><Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Post'}</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
            </div></CardHeader></Card>
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
              {posts.map(post => { const author = getUserById(post.creatorId); return (
                <Card key={post.id}><CardContent className="p-4"><div className="flex items-start gap-3"><Avatar><AvatarFallback>{author?.firstName?.[0] || 'U'}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="font-medium">{author?.firstName} {author?.lastName}</span><span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span></div>
                    <h3 className="font-medium mb-2">{post.title}</h3><p className="text-muted-foreground mb-3">{post.content}</p>
                    {(post.attachments || []).map((att: any, i: number) => <div key={i}><a href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{att.name}</a></div>)}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2"><button className="flex items-center gap-1 hover:text-primary"><Heart className="h-4 w-4" />{(post.likes || []).length}</button><button className="flex items-center gap-1 hover:text-primary"><MessageCircle className="h-4 w-4" />{(post.comments || []).length}</button></div>
                  </div>
                </div></CardContent></Card>
              );})}
              {posts.length === 0 && <Card><CardContent className="text-center py-12"><p>No posts yet. Be the first!</p></CardContent></Card>}
            </div></div> : <Card><CardContent className="text-center py-12"><Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">Select a Group</h3></CardContent></Card>}</div>
          </div>
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader><CardTitle>StudyHub Users</CardTitle><CardDescription>Find other students to connect with.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.field || 'Student'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Send className="h-4 w-4 mr-2" />Invite to Group</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}