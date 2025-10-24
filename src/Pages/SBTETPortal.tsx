"use client";

import React from 'react';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ExternalLink, BookOpen, Calendar, Award, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function SBTETPortalPage() {
  const { isLoggedIn } = useAppLevelAuth();

  const sbtetLinks = [
    {
      id: 'syllabus',
      title: 'View Syllabus',
      description: 'Access official course syllabus, curriculum details, and subject schemes directly from the SBTET website.',
      url: 'https://sbtet.telangana.gov.in/index.html#!/index/ViewSyllabus',
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      id: 'attendance',
      title: 'Student Attendance',
      description: 'Check your attendance records and status for all subjects. Requires SBTET login on their portal.',
      url: 'https://sbtet.telangana.gov.in/index.html#!/index/StudentAttendance',
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      id: 'results',
      title: 'Diploma Results',
      description: 'View your latest examination results, grades, and detailed mark sheets from the official source.',
      url: 'https://sbtet.telangana.gov.in/index.html#!/index/DiplomaStudentResult',
      icon: Award,
      color: 'text-purple-500'
    }
  ];

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          SBTET Portal
        </h1>
        <p className="text-muted-foreground">Direct links to official SBTET Telangana services.</p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          The SBTET website does not allow direct integration. These links will open the official SBTET website in a new browser tab for a secure and reliable experience.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sbtetLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-muted ${link.color}`}>
                    <Icon className="h-6 w-6 text-background" />
                  </div>
                  <CardTitle>{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => openInNewTab(link.url)}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit SBTET Site
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}