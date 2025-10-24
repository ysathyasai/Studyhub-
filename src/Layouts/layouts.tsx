"use client";

import Link from "next/link";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Timer, 
  Calendar, 
  Settings,
  GraduationCap,
  Menu,
  User,
  LogOut,
  FileText,
  HelpCircle,
  Briefcase,
  FolderOpen,
  File,
  Code,
  Calculator,
  CheckSquare,
  Award,
  Users,
  ClipboardList
} from "lucide-react";
import useAppLevelAuth from "@/hooks/useAppLevelAuth";
import React, { useState, useEffect } from 'react';
import { User as UserEntity } from "@/entities/User";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const { isLoggedIn, logout } = useAppLevelAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        setIsLoadingUser(true);
        try {
          const user = await UserEntity.me();
          setCurrentUser(user);
        } catch (error) {
          console.warn("Layout: Could not fetch current user", error);
          setCurrentUser(null);
        } finally {
          setIsLoadingUser(false);
        }
      };
      fetchUser();
    } else {
      setIsLoadingUser(false);
      setCurrentUser(null);
    }
  }, [isLoggedIn]);

  if (currentPageName === "Landing") {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
    { name: "Notes", path: "Notes", icon: BookOpen },
    { name: "Flashcards", path: "Flashcards", icon: Brain },
    { name: "Study Timer", path: "Timer", icon: Timer },
    { name: "Schedule", path: "Schedule", icon: Calendar },
    { name: "Community Hub", path: "CourseHub", icon: Users },
  ];

  const tools = [
    { name: "Resume Maker", path: "ResumeMaker", icon: User },
    { name: "Document Converter", path: "DocumentConverter", icon: FileText },
    { name: "AI Summarizer", path: "AISummarizer", icon: ClipboardList },
    { name: "Research Papers", path: "ResearchPapers", icon: BookOpen },
    { name: "Question Bank", path: "QuestionBank", icon: HelpCircle },
    { name: "Portfolio Builder", path: "PortfolioBuilder", icon: Briefcase },
    { name: "Project Manager", path: "ProjectManager", icon: FolderOpen },
    { name: "Templates", path: "Templates", icon: File },
    { name: "Code Compiler", path: "CodeCompiler", icon: Code },
    { name: "Formula Reference", path: "FormulaReference", icon: Calculator },
    { name: "Todo Lists", path: "TodoLists", icon: CheckSquare },
    { name: "Scholarships", path: "Scholarships", icon: Award },
    { name: "SBTET Portal", path: "SBTETPortal", icon: BookOpen },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(createPageUrl("login"));
  };

  const getCurrentPage = () => {
    if (currentPageName) return currentPageName;
    const path = pathname?.replace('/', '') || 'Dashboard';
    return path === '' ? 'Dashboard' : path;
  };

  const currentPage = getCurrentPage();

  const UserProfileSection = () => {
    if (!isLoggedIn) return null;
    
    if (isLoadingUser) {
      return (
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      );
    }

    if (!currentUser) return null;

    const initials = `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || "U"}`.toUpperCase();

    return (
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold text-foreground">
            {currentUser.firstName} {currentUser.lastName}
          </span>
          <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border bg-background">
        <SidebarHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <img src="https://storage.googleapis.com/space-apps-assets/store_LcRqthusyJ/IKVkghNNLA-Screenshot%202025-08-08%20200557.png" alt="StudyHub Logo" className="h-10" />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-4 py-6">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Study Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isLoggedIn && currentPage === item.path;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild={isLoggedIn}
                        isActive={isActive}
                        className={`h-11 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          !isLoggedIn 
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                            : isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg font-semibold' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                        disabled={!isLoggedIn}
                      >
                        {isLoggedIn ? (
                          <Link href={createPageUrl(item.path)} className="flex items-center gap-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-semibold">{item.name}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-semibold">{item.name}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Academic Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {tools.map((item) => {
                  const Icon = item.icon;
                  const isActive = isLoggedIn && currentPage === item.path;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild={isLoggedIn}
                        isActive={isActive}
                        className={`h-11 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          !isLoggedIn 
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                            : isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg font-semibold' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                        disabled={!isLoggedIn}
                      >
                        {isLoggedIn ? (
                          <Link href={createPageUrl(item.path)} className="flex items-center gap-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-semibold">{item.name}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-semibold">{item.name}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-border p-4 space-y-2">
          <UserProfileSection />
          <SidebarMenu>
            {isLoggedIn ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className="h-11 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Link href={createPageUrl('settings')} className="flex items-center gap-3">
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      <span className="font-semibold">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    className="h-11 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent w-full"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span className="font-semibold">Logout</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className="h-11 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Link href={createPageUrl('login')} className="flex items-center gap-3">
                      <User className="h-5 w-5 flex-shrink-0" />
                      <span className="font-semibold">Sign In</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className="h-11 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Link href={createPageUrl('signup')} className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 flex-shrink-0" />
                      <span className="font-semibold">Create Account</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="fixed top-0 left-0 right-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden bg-background">
          <SidebarTrigger className="-ml-1 h-8 w-8 rounded-md hover:bg-accent transition-colors flex items-center justify-center">
            <Menu className="h-4 w-4 text-foreground" />
          </SidebarTrigger>
          <div className="flex items-center gap-2 ml-2">
            <img src="https://storage.googleapis.com/space-apps-assets/store_LcRqthusyJ/IKVkghNNLA-Screenshot%202025-08-08%20200557.png" alt="StudyHub Logo" className="h-8" />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 pt-16 px-4 pb-6 md:p-6 bg-background min-h-screen overflow-x-hidden">
          {!isLoggedIn ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-md w-full text-center">
                <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
                  <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-primary-foreground mb-6 shadow-lg">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to StudyHub</h1>
                    <p className="text-muted-foreground text-base">Your comprehensive study companion for academic success</p>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href={createPageUrl('login')}
                      className="w-full inline-flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={createPageUrl('signup')}
                      className="w-full inline-flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-foreground bg-secondary hover:bg-accent transition-colors border border-border"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}