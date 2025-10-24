"use client";

import React, { useState, useEffect } from 'react';
import { Scholarship } from '@/entities/Scholarship';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Plus, Search, Filter, ExternalLink, BookmarkPlus, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fetchRealTimeScholarships, getScholarshipRecommendations, ScholarshipData } from '@/services/scholarshipService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScholarshipsPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [realTimeScholarships, setRealTimeScholarships] = useState<ScholarshipData[]>([]);
  const [recommendations, setRecommendations] = useState<ScholarshipData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const fields = [
    'Computer Science', 'Engineering', 'Medicine', 'Business', 'Arts', 'Science',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Psychology', 'Education'
  ];

  const levels = ['Undergraduate', 'Graduate', 'Postgraduate', 'PhD', 'all'];
  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'India', 'Global'];

  useEffect(() => {
    if (isLoggedIn) {
      loadSavedScholarships();
    }
  }, [isLoggedIn]);

  const loadSavedScholarships = async () => {
    try {
      const data = await Scholarship.list('deadline:asc');
      setScholarships(data);
    } catch (error) {
      console.error('Error loading scholarships:', error);
    }
  };

  const searchRealTimeScholarships = async () => {
    setLoading(true);
    try {
      const data = await fetchRealTimeScholarships(selectedField, selectedLevel, selectedCountry);
      setRealTimeScholarships(data);
      toast({ title: "Success", description: `Found ${data.length} current scholarships` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch scholarship data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const userProfile = {
        field: selectedField || 'Computer Science',
        level: selectedLevel || 'Undergraduate',
        interests: [selectedField || 'Technology'],
        location: selectedCountry || 'Global'
      };
      
      const data = await getScholarshipRecommendations(userProfile);
      setRecommendations(data);
      toast({ title: "Success", description: `Found ${data.length} personalized recommendations` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to get recommendations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveScholarship = async (scholarshipData: ScholarshipData) => {
    try {
      const data = {
        title: scholarshipData.title,
        organization: scholarshipData.organization,
        description: scholarshipData.description,
        amount: scholarshipData.amount,
        eligibility: scholarshipData.eligibility,
        requirements: scholarshipData.requirements,
        deadline: scholarshipData.deadline,
        applicationUrl: scholarshipData.applicationUrl,
        category: scholarshipData.category as any,
        level: scholarshipData.level as any,
        country: scholarshipData.country,
        field: scholarshipData.field,
        status: 'interested' as any,
        saved: true
      };

      await Scholarship.create(data);
      loadSavedScholarships();
      toast({ title: "Saved", description: "Scholarship saved to your list" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save scholarship", variant: "destructive" });
    }
  };

  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRealTime = realTimeScholarships.filter(scholarship =>
    scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ScholarshipCard = ({ scholarship, isRealTime = false }: { scholarship: any, isRealTime?: boolean }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{scholarship.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{scholarship.organization}</p>
          </div>
          {isRealTime && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveScholarship(scholarship)}
            >
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{scholarship.description}</p>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{scholarship.amount}</Badge>
          <Badge variant="outline">{scholarship.category}</Badge>
          <Badge variant="outline">{scholarship.level}</Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Deadline:</p>
          <p className="text-sm text-muted-foreground">
            {scholarship.deadline}
          </p>
        </div>

        {scholarship.eligibility && scholarship.eligibility.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Eligibility:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {scholarship.eligibility.slice(0, 3).map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {scholarship.applicationUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(scholarship.applicationUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply
            </Button>
          )}
          {!isRealTime && (
            <Badge className="ml-auto">{scholarship.status}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Scholarship Hub
          </h1>
          <p className="text-muted-foreground">Discover and track scholarship opportunities</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Field of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {fields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.filter(level => level !== 'all').map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={searchRealTimeScholarships} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Search Live Scholarships
            </Button>
            <Button variant="outline" onClick={getRecommendations} disabled={loading}>
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="saved" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="saved">My Scholarships ({scholarships.length})</TabsTrigger>
          <TabsTrigger value="live">Live Search ({realTimeScholarships.length})</TabsTrigger>
          <TabsTrigger value="recommended">Recommended ({recommendations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          {filteredScholarships.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved scholarships</h3>
                <p className="text-muted-foreground mb-4">Search for live scholarships to save them here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScholarships.map(scholarship => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          {realTimeScholarships.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live results</h3>
                <p className="text-muted-foreground mb-4">Click "Search Live Scholarships" to find current opportunities</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRealTime.map((scholarship, index) => (
                <ScholarshipCard key={index} scholarship={scholarship} isRealTime />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">Set your preferences and click "Get Recommendations"</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((scholarship, index) => (
                <ScholarshipCard key={index} scholarship={scholarship} isRealTime />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}