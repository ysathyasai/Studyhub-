"use client";

import React, { useState, useEffect } from 'react';
import { ResearchPaper } from '@/entities/ResearchPaper';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Search, Edit, Trash2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ResearchPapersPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [papers, setPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [paperData, setPaperData] = useState({
    title: '',
    abstract: '',
    introduction: '',
    methodology: '',
    results: '',
    discussion: '',
    conclusion: '',
    references: [],
    keywords: [],
    status: 'draft',
    subjectId: ''
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      const [papersData, subjectsData] = await Promise.all([
        ResearchPaper.list('createdAt:desc'),
        Subject.list()
      ]);
      setPapers(papersData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!paperData.title) {
      toast({ title: "Title required", description: "Please enter a paper title", variant: "destructive" });
      return;
    }

    try {
      if (selectedPaper) {
        await ResearchPaper.update(selectedPaper.id, paperData);
        toast({ title: "Success", description: "Research paper updated successfully" });
      } else {
        await ResearchPaper.create(paperData);
        toast({ title: "Success", description: "Research paper created successfully" });
      }
      loadData();
      setIsEditing(false);
      setSelectedPaper(null);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save research paper", variant: "destructive" });
    }
  };

  const handleEdit = (paper: any) => {
    setSelectedPaper(paper);
    setPaperData(paper);
    setIsEditing(true);
  };

  const handleDelete = async (paperId: string) => {
    try {
      await ResearchPaper.delete(paperId);
      setPapers(papers.filter(p => p.id !== paperId));
      toast({ title: "Success", description: "Research paper deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete research paper", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setPaperData({
      title: '',
      abstract: '',
      introduction: '',
      methodology: '',
      results: '',
      discussion: '',
      conclusion: '',
      references: [],
      keywords: [],
      status: 'draft',
      subjectId: ''
    });
  };

  const addKeyword = () => {
    const keyword = prompt('Enter keyword:');
    if (keyword) {
      setPaperData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const addReference = () => {
    const reference = prompt('Enter reference:');
    if (reference) {
      setPaperData(prev => ({
        ...prev,
        references: [...prev.references, reference]
      }));
    }
  };

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.keywords?.some((keyword: string) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Research Papers
          </h1>
          <p className="text-muted-foreground">Organize and structure your research papers</p>
        </div>
        <Button onClick={() => { resetForm(); setIsEditing(true); setSelectedPaper(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Paper
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Papers List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Papers</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPaper?.id === paper.id ? 'bg-primary/10 border-primary' : 'hover:bg-secondary'
                  }`}
                  onClick={() => setSelectedPaper(paper)}
                >
                  <h3 className="font-medium truncate">{paper.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={paper.status === 'completed' ? 'default' : 'secondary'}>
                      {paper.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleEdit(paper); }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleDelete(paper.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Paper Editor/Viewer */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedPaper ? 'Edit Paper' : 'New Paper'}</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={paperData.title}
                      onChange={(e) => setPaperData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Research paper title"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select value={paperData.subjectId} onValueChange={(value) => setPaperData(prev => ({ ...prev, subjectId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Abstract</Label>
                  <Textarea
                    value={paperData.abstract}
                    onChange={(e) => setPaperData(prev => ({ ...prev, abstract: e.target.value }))}
                    rows={4}
                    placeholder="Brief summary of your research..."
                  />
                </div>

                <div>
                  <Label>Introduction</Label>
                  <Textarea
                    value={paperData.introduction}
                    onChange={(e) => setPaperData(prev => ({ ...prev, introduction: e.target.value }))}
                    rows={6}
                    placeholder="Introduction and background..."
                  />
                </div>

                <div>
                  <Label>Methodology</Label>
                  <Textarea
                    value={paperData.methodology}
                    onChange={(e) => setPaperData(prev => ({ ...prev, methodology: e.target.value }))}
                    rows={6}
                    placeholder="Research methodology and approach..."
                  />
                </div>

                <div>
                  <Label>Results</Label>
                  <Textarea
                    value={paperData.results}
                    onChange={(e) => setPaperData(prev => ({ ...prev, results: e.target.value }))}
                    rows={6}
                    placeholder="Research findings and results..."
                  />
                </div>

                <div>
                  <Label>Discussion</Label>
                  <Textarea
                    value={paperData.discussion}
                    onChange={(e) => setPaperData(prev => ({ ...prev, discussion: e.target.value }))}
                    rows={6}
                    placeholder="Discussion of results..."
                  />
                </div>

                <div>
                  <Label>Conclusion</Label>
                  <Textarea
                    value={paperData.conclusion}
                    onChange={(e) => setPaperData(prev => ({ ...prev, conclusion: e.target.value }))}
                    rows={4}
                    placeholder="Conclusions and future work..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Keywords</Label>
                      <Button size="sm" variant="outline" onClick={addKeyword}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {paperData.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => {
                              const newKeywords = paperData.keywords.filter((_, i) => i !== index);
                              setPaperData(prev => ({ ...prev, keywords: newKeywords }));
                            }}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={paperData.status} onValueChange={(value) => setPaperData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>References</Label>
                    <Button size="sm" variant="outline" onClick={addReference}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {paperData.references.map((reference: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded">
                        <span className="flex-1 text-sm">{reference}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newReferences = paperData.references.filter((_, i) => i !== index);
                            setPaperData(prev => ({ ...prev, references: newReferences }));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedPaper ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedPaper.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedPaper.status === 'completed' ? 'default' : 'secondary'}>
                        {selectedPaper.status}
                      </Badge>
                      {selectedPaper.subjectId && (
                        <Badge variant="outline">
                          {subjects.find(s => s.id === selectedPaper.subjectId)?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleEdit(selectedPaper)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedPaper.abstract && (
                  <div>
                    <h3 className="font-semibold mb-2">Abstract</h3>
                    <p className="text-muted-foreground">{selectedPaper.abstract}</p>
                  </div>
                )}
                
                {selectedPaper.introduction && (
                  <div>
                    <h3 className="font-semibold mb-2">Introduction</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedPaper.introduction}</p>
                  </div>
                )}

                {selectedPaper.methodology && (
                  <div>
                    <h3 className="font-semibold mb-2">Methodology</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedPaper.methodology}</p>
                  </div>
                )}

                {selectedPaper.results && (
                  <div>
                    <h3 className="font-semibold mb-2">Results</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedPaper.results}</p>
                  </div>
                )}

                {selectedPaper.discussion && (
                  <div>
                    <h3 className="font-semibold mb-2">Discussion</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedPaper.discussion}</p>
                  </div>
                )}

                {selectedPaper.conclusion && (
                  <div>
                    <h3 className="font-semibold mb-2">Conclusion</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedPaper.conclusion}</p>
                  </div>
                )}

                {selectedPaper.keywords && selectedPaper.keywords.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPaper.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPaper.references && selectedPaper.references.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">References</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedPaper.references.map((reference: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground">{reference}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a paper to view or create a new one</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}