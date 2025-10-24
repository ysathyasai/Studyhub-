"use client";

import React, { useState, useEffect } from 'react';
import { Project } from '@/entities/Project';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

export default function ProjectManagerPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    const [projectsData, subjectsData] = await Promise.all([Project.list(), Subject.list()]);
    setProjects(projectsData);
    setSubjects(subjectsData);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    try {
      if (editingProject) {
        await Project.update(editingProject.id, data);
        toast({ title: "Project updated" });
      } else {
        await Project.create(data);
        toast({ title: "Project created" });
      }
      loadData();
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      toast({ title: "Error saving project", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await Project.delete(id);
    loadData();
    toast({ title: "Project deleted" });
  };

  const ProjectForm = () => (
    <Card>
      <CardHeader><CardTitle>{editingProject ? 'Edit Project' : 'New Project'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="title" placeholder="Project Title" defaultValue={editingProject?.title} required />
          <Input name="description" placeholder="Description" defaultValue={editingProject?.description} />
          <Select name="status" defaultValue={editingProject?.status || 'planning'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Input name="dueDate" type="date" defaultValue={editingProject?.dueDate} />
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={() => { setIsFormOpen(false); setEditingProject(null); }}>Cancel</Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><FolderOpen className="h-8 w-8 text-primary" /> Project Manager</h1>
        {!isFormOpen && <Button onClick={() => { setEditingProject(null); setIsFormOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New Project</Button>}
      </div>
      {isFormOpen && <ProjectForm />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{project.title}</CardTitle>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingProject(project); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <Badge>{project.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-4">
                <Label>Progress</Label>
                <Progress value={project.progress || 0} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}