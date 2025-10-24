"use client";

import React, { useState, useEffect } from 'react';
import { Portfolio } from '@/entities/Portfolio';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Briefcase, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PortfolioBuilderPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '', description: '', personalInfo: {}, projects: [], skills: [], experience: [], education: []
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadPortfolio();
    }
  }, [isLoggedIn]);

  const loadPortfolio = async () => {
    const portfolios = await Portfolio.list();
    if (portfolios.length > 0) {
      setPortfolio(portfolios[0]);
      setFormData(portfolios[0]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      if (portfolio) {
        await Portfolio.update(portfolio.id, formData);
      } else {
        const newPortfolio = await Portfolio.create(formData);
        setPortfolio(newPortfolio);
      }
      toast({ title: "Portfolio saved!" });
    } catch (error) {
      toast({ title: "Error saving portfolio", variant: "destructive" });
    }
  };

  const handleFieldChange = (section: string, index: number, field: string, value: string) => {
    const updatedSection = [...formData[section]];
    updatedSection[index][field] = value;
    setFormData({ ...formData, [section]: updatedSection });
  };
  
  const addArrayItem = (section: string, newItem: object) => {
    setFormData(prev => ({...prev, [section]: [...(prev[section] || []), newItem]}));
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Briefcase className="h-8 w-8 text-primary" /> Portfolio Builder</h1>
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Portfolio</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <Input placeholder="Full Name" value={formData.personalInfo.name} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, name: e.target.value}})} />
              <Input placeholder="Email" value={formData.personalInfo.email} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, email: e.target.value}})} />
              <Textarea placeholder="Bio" value={formData.personalInfo.bio} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, bio: e.target.value}})} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Experience</CardTitle><Button size="sm" onClick={() => addArrayItem('experience', {})}><Plus/></Button></div></CardHeader>
            <CardContent className="space-y-2">
              {formData.experience.map((exp, i) => (
                <div key={i} className="p-2 border rounded space-y-2">
                  <Input placeholder="Company" value={exp.company} onChange={e => handleFieldChange('experience', i, 'company', e.target.value)} />
                  <Input placeholder="Position" value={exp.position} onChange={e => handleFieldChange('experience', i, 'position', e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Projects</CardTitle><Button size="sm" onClick={() => addArrayItem('projects', {})}><Plus/></Button></div></CardHeader>
            <CardContent className="space-y-2">
              {formData.projects.map((proj, i) => (
                <div key={i} className="p-2 border rounded space-y-2">
                  <Input placeholder="Project Name" value={proj.name} onChange={e => handleFieldChange('projects', i, 'name', e.target.value)} />
                  <Textarea placeholder="Description" value={proj.description} onChange={e => handleFieldChange('projects', i, 'description', e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div className="flex justify-between"><CardTitle>Skills</CardTitle><Button size="sm" onClick={() => addArrayItem('skills', {})}><Plus/></Button></div></CardHeader>
            <CardContent className="space-y-2">
              {formData.skills.map((skill, i) => (
                <div key={i} className="p-2 border rounded">
                  <Input placeholder="Skill Name" value={skill.name} onChange={e => handleFieldChange('skills', i, 'name', e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}