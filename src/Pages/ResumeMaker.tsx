"use client";

import React, { useState, useEffect } from 'react';
import { Resume } from '@/entities/Resume';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Eye, Save, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

export default function ResumeMakerPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<any[]>([]);
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [resumeData, setResumeData] = useState({
    title: '',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    template: 'modern'
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadResumes();
    }
  }, [isLoggedIn]);

  const loadResumes = async () => {
    try {
      const data = await Resume.list('createdAt:desc');
      setResumes(data);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resumeData.title) {
      toast({ title: "Title required", description: "Please enter a resume title", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (currentResume) {
        await Resume.update(currentResume.id, resumeData);
        toast({ title: "Success", description: "Resume updated successfully" });
      } else {
        const newResume = await Resume.create(resumeData);
        setCurrentResume(newResume);
        toast({ title: "Success", description: "Resume created successfully" });
      }
      loadResumes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save resume", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
      }]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }]
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: [],
        url: ''
      }]
    }));
  };

  const addSkill = () => {
    const skill = prompt('Enter skill:');
    if (skill) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const { personalInfo, summary, experience, education, skills, projects } = resumeData;

    // Header
    pdf.setFontSize(24);
    pdf.text(personalInfo.fullName || 'Your Name', 20, 30);
    
    pdf.setFontSize(12);
    let yPos = 45;
    if (personalInfo.email) {
      pdf.text(`Email: ${personalInfo.email}`, 20, yPos);
      yPos += 7;
    }
    if (personalInfo.phone) {
      pdf.text(`Phone: ${personalInfo.phone}`, 20, yPos);
      yPos += 7;
    }
    if (personalInfo.address) {
      pdf.text(`Address: ${personalInfo.address}`, 20, yPos);
      yPos += 7;
    }

    // Summary
    if (summary) {
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('Professional Summary', 20, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      const summaryLines = pdf.splitTextToSize(summary, 170);
      pdf.text(summaryLines, 20, yPos);
      yPos += summaryLines.length * 7;
    }

    // Experience
    if (experience.length > 0) {
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('Experience', 20, yPos);
      yPos += 10;
      
      experience.forEach((exp: any) => {
        pdf.setFontSize(14);
        pdf.text(`${exp.position} at ${exp.company}`, 20, yPos);
        yPos += 7;
        pdf.setFontSize(12);
        pdf.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 20, yPos);
        yPos += 7;
        if (exp.description) {
          const descLines = pdf.splitTextToSize(exp.description, 170);
          pdf.text(descLines, 20, yPos);
          yPos += descLines.length * 7;
        }
        yPos += 5;
      });
    }

    // Education
    if (education.length > 0) {
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('Education', 20, yPos);
      yPos += 10;
      
      education.forEach((edu: any) => {
        pdf.setFontSize(14);
        pdf.text(`${edu.degree} in ${edu.field}`, 20, yPos);
        yPos += 7;
        pdf.setFontSize(12);
        pdf.text(`${edu.institution} (${edu.startDate} - ${edu.endDate})`, 20, yPos);
        yPos += 7;
        if (edu.gpa) {
          pdf.text(`GPA: ${edu.gpa}`, 20, yPos);
          yPos += 7;
        }
        yPos += 5;
      });
    }

    // Skills
    if (skills.length > 0) {
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('Skills', 20, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      pdf.text(skills.join(', '), 20, yPos);
    }

    pdf.save(`${resumeData.title || 'resume'}.pdf`);
  };

  const loadResume = (resume: any) => {
    setCurrentResume(resume);
    setResumeData(resume);
  };

  const createNew = () => {
    setCurrentResume(null);
    setResumeData({
      title: '',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        website: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      template: 'modern'
    });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Resume Maker
          </h1>
          <p className="text-muted-foreground">Create professional resumes with ease</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNew} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Resume
          </Button>
          {currentResume && (
            <>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={generatePDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resume List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resumes.map((resume) => (
                <Button
                  key={resume.id}
                  variant={currentResume?.id === resume.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => loadResume(resume)}
                >
                  {resume.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resume Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Resume Title</Label>
                <Input
                  value={resumeData.title}
                  onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Software Engineer Resume"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={resumeData.personalInfo.address}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, address: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Professional Summary</Label>
                <Textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  placeholder="Brief professional summary..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Experience</CardTitle>
                <Button onClick={addExperience} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.experience.map((exp: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].company = e.target.value;
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                    />
                    <Input
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].position = e.target.value;
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                    />
                    <Input
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].startDate = e.target.value;
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                    />
                    <Input
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].endDate = e.target.value;
                        setResumeData(prev => ({ ...prev, experience: newExp }));
                      }}
                    />
                  </div>
                  <Textarea
                    placeholder="Job description and achievements..."
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[index].description = e.target.value;
                      setResumeData(prev => ({ ...prev, experience: newExp }));
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newExp = resumeData.experience.filter((_, i) => i !== index);
                      setResumeData(prev => ({ ...prev, experience: newExp }));
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Education</CardTitle>
                <Button onClick={addEducation} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].institution = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].degree = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={edu.field}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].field = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                    <Input
                      placeholder="GPA (optional)"
                      value={edu.gpa}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].gpa = e.target.value;
                        setResumeData(prev => ({ ...prev, education: newEdu }));
                      }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newEdu = resumeData.education.filter((_, i) => i !== index);
                      setResumeData(prev => ({ ...prev, education: newEdu }));
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Skills</CardTitle>
                <Button onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                    <span>{skill}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => {
                        const newSkills = resumeData.skills.filter((_, i) => i !== index);
                        setResumeData(prev => ({ ...prev, skills: newSkills }));
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}