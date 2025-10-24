"use client";

import React, { useState, useRef } from 'react';
import { Document } from '@/entities/Document';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, FileText, Loader2, File, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DocumentConverterPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState('md');
  const [convertedDocument, setConvertedDocument] = useState<any>(null);

  const supportedFormats = [
    { value: 'md', label: 'Markdown (.md)' },
    { value: 'txt', label: 'Plain Text (.txt)' },
    { value: 'html', label: 'HTML (.html)' },
    { value: 'json', label: 'JSON (summarized)' },
    { value: 'csv', label: 'CSV (tabular data)' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select a file smaller than 10MB", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setConvertedDocument(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select a file smaller than 10MB", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setConvertedDocument(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }
    setConverting(true);
    setConvertedDocument(null);
    try {
      const uploadResult = await UploadFile({ file: selectedFile });
      const conversionPrompt = `Analyze the attached document. Convert its content into a well-structured ${targetFormat.toUpperCase()} format. For JSON, summarize key points. For CSV, extract tabular data. For other formats, maintain structure. Output ONLY the final, converted content without any additional explanations or markdown formatting.`;
      
      let llmParams: any = { prompt: conversionPrompt, file_urls: [uploadResult.file_url] };
      if (targetFormat === 'json') {
        llmParams.response_json_schema = {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'A concise summary of the document.' },
            key_points: { type: 'array', items: { type: 'string' }, description: 'A list of key points.' }
          },
          required: ['summary', 'key_points']
        };
      }

      const result = await InvokeLLM(llmParams);
      const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

      const docData = {
        title: `${selectedFile.name.split('.')[0]}.${targetFormat}`,
        type: targetFormat as any,
        content: content,
      };
      const document = await Document.create(docData);
      setConvertedDocument(document);
      toast({ title: "Conversion successful" });
    } catch (error) {
      toast({ title: "Conversion failed", description: String(error), variant: "destructive" });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedDocument?.content) return;
    const mimeTypes: { [key: string]: string } = { 'txt': 'text/plain', 'md': 'text/markdown', 'html': 'text/html', 'json': 'application/json', 'csv': 'text/csv' };
    const blob = new Blob([convertedDocument.content], { type: mimeTypes[targetFormat] || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedDocument.title;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download started" });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><RefreshCw className="h-8 w-8 text-primary" />AI Document Converter</h1>
        <p className="text-muted-foreground">Convert documents using advanced AI processing</p>
      </div>
      <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Supported inputs: PDF, DOCX, TXT, MD. Max file size: 10MB</AlertDescription></Alert>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Upload & Convert</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary" onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDrop={handleDrop}>
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{selectedFile ? selectedFile.name : "Click or drag & drop file"}</p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.docx,.txt,.md" />
            </div>
            <Select value={targetFormat} onValueChange={setTargetFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{supportedFormats.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent></Select>
            <Button onClick={handleConvert} disabled={!selectedFile || converting} className="w-full" size="lg">
              {converting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Converting...</> : <><RefreshCw className="h-4 w-4 mr-2" />Convert</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent>
            {convertedDocument ? (
              <div className="space-y-4">
                <Textarea readOnly value={convertedDocument.content} className="h-64 font-mono text-sm" />
                <Button onClick={handleDownload} className="w-full"><Download className="h-4 w-4 mr-2" />Download</Button>
              </div>
            ) : (
              <div className="text-center py-12 h-full flex flex-col justify-center items-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{converting ? 'AI is processing...' : 'Converted document will appear here'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}