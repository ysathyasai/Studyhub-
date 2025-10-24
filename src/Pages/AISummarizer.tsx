"use client";

import React, { useState, useRef } from 'react';
import { AISummarizer } from '@/entities/AISummarizer';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Youtube, FileText, ClipboardList, Loader2, Sparkles, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UploadFile, InvokeLLM } from '@/integrations/Core';

export default function AISummarizerPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputType, setInputType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "File too large", description: "Please select a file smaller than 10MB.", variant: "destructive" });
        return;
      }
      setFileInput(file);
    }
  };

  const getLLMParams = async () => {
    const basePrompt = `Summarize the following content. Provide a concise main summary and a list of key bullet points. The summary should capture the essential information, and the key points should highlight the most important takeaways.`;
    
    const responseSchema = {
      type: "object",
      properties: {
        title: { type: "string", description: "A concise title for the content." },
        summary: { type: "string", description: "The main summary of the content." },
        keyPoints: { type: "array", items: { type: "string" }, description: "A list of key bullet points." }
      },
      required: ["title", "summary", "keyPoints"]
    };

    switch (inputType) {
      case 'text':
        if (!textInput.trim()) throw new Error("Text input is empty.");
        return { 
          prompt: `${basePrompt}

Text to summarize:
${textInput}`,
          response_json_schema: responseSchema
        };
      case 'youtube':
        if (!youtubeUrl.trim()) throw new Error("YouTube URL is empty.");
        return { 
          prompt: `${basePrompt}

Summarize the content of this YouTube video: ${youtubeUrl}`,
          add_context_from_internet: true,
          response_json_schema: responseSchema
        };
      case 'file':
        if (!fileInput) throw new Error("No file selected.");
        const uploadResult = await UploadFile({ file: fileInput });
        return { 
          prompt: `${basePrompt}

Summarize the content of the attached file named "${fileInput.name}".`,
          file_urls: [uploadResult.file_url],
          response_json_schema: responseSchema
        };
      default:
        throw new Error("Invalid input type.");
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummaryResult(null);
    try {
      const llmParams = await getLLMParams();
      const result = await InvokeLLM(llmParams);

      const summaryData = {
        ...result,
        sourceType: inputType,
        originalSource: inputType === 'text' ? 'Text Input' : inputType === 'youtube' ? youtubeUrl : fileInput?.name,
      };
      
      const savedSummary = await AISummarizer.create(summaryData);
      setSummaryResult(savedSummary);
      toast({ title: "Success", description: "Content summarized successfully." });

    } catch (error: any) {
      toast({ title: "Summarization Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleDownload = () => {
    if (!summaryResult) return;
    const keyPointsContent = summaryResult.keyPoints?.map((p: string) => `- ${p}`).join('\n') || 'No key points available.';
    const content = `Title: ${summaryResult.title}

Summary:
${summaryResult.summary}

Key Points:
${keyPointsContent}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summaryResult.title.replace(/ /g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><ClipboardList className="h-8 w-8 text-primary" />AI Summarizer</h1>
        <p className="text-muted-foreground">Get key insights from text, files, and YouTube videos instantly.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={inputType} onValueChange={setInputType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" />Text</TabsTrigger>
                <TabsTrigger value="file"><Upload className="h-4 w-4 mr-2" />File</TabsTrigger>
                <TabsTrigger value="youtube"><Youtube className="h-4 w-4 mr-2" />YouTube</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <Textarea placeholder="Paste your text here..." className="h-48" value={textInput} onChange={e => setTextInput(e.target.value)} />
              </TabsContent>
              <TabsContent value="file" className="mt-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{fileInput ? fileInput.name : "Click to upload a file"}</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT up to 10MB</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.docx,.txt,.md" />
                </div>
              </TabsContent>
              <TabsContent value="youtube" className="mt-4">
                <Input placeholder="Enter YouTube video URL" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
              </TabsContent>
            </Tabs>
            <Button onClick={handleSummarize} disabled={isSummarizing} className="w-full mt-4" size="lg">
              {isSummarizing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Summarizing...</> : <><Sparkles className="h-4 w-4 mr-2" />Summarize</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Your generated summary will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSummarizing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">AI is working its magic...</p>
              </div>
            ) : summaryResult ? (
              <div className="space-y-4 h-80 overflow-y-auto pr-2">
                <h3 className="text-xl font-semibold text-foreground">{summaryResult.title}</h3>
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Summary</h4>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">{summaryResult.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Key Points</h4>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {summaryResult.keyPoints?.map((point: string, index: number) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <Button onClick={handleDownload} variant="outline" className="w-full mt-4"><Download className="h-4 w-4 mr-2" />Download Summary</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Provide some content and click "Summarize" to begin.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}