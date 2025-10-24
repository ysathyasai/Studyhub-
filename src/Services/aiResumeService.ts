import { InvokeLLM } from '@/integrations/Core';

export interface ResumeEnhancement {
  enhancedSummary: string;
  improvedExperience: any[];
  skillSuggestions: string[];
  formatSuggestions: string[];
  overallScore: number;
  feedback: string[];
}

export const enhanceResumeWithAI = async (resumeData: any): Promise<ResumeEnhancement> => {
  try {
    const prompt = `As an expert resume writer and career counselor, analyze and enhance the following resume data. Provide specific improvements and suggestions.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Please provide:
1. An enhanced professional summary that's more compelling and ATS-friendly
2. Improved experience descriptions with stronger action verbs and quantified achievements
3. Additional relevant skills that might be missing
4. Format and structure suggestions
5. An overall score (1-100) and specific feedback

Focus on:
- Using strong action verbs
- Quantifying achievements where possible
- Making it ATS-friendly
- Highlighting transferable skills
- Improving readability and impact`;

    const response = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          enhancedSummary: { type: "string" },
          improvedExperience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                position: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                description: { type: "string" },
                improvements: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          skillSuggestions: {
            type: "array",
            items: { type: "string" }
          },
          formatSuggestions: {
            type: "array",
            items: { type: "string" }
          },
          overallScore: { type: "number" },
          feedback: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error enhancing resume:', error);
    throw new Error('Failed to enhance resume with AI');
  }
};

export const generateCoverLetter = async (
  resumeData: any,
  jobDescription: string,
  companyName: string
): Promise<string> => {
  try {
    const prompt = `Generate a professional cover letter based on the following information:

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

Company Name: ${companyName}

Create a compelling cover letter that:
1. Addresses the specific job requirements
2. Highlights relevant experience from the resume
3. Shows enthusiasm for the company
4. Is professional yet personable
5. Is approximately 3-4 paragraphs long

Format it as a complete cover letter ready to send.`;

    const response = await InvokeLLM({ prompt });
    return response;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
};

export const optimizeForATS = async (resumeData: any, jobDescription?: string): Promise<any> => {
  try {
    const prompt = `Optimize this resume for Applicant Tracking Systems (ATS). ${
      jobDescription ? `Target job description: ${jobDescription}` : ''
    }

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Provide ATS optimization suggestions including:
1. Keyword optimization
2. Format improvements for ATS parsing
3. Section organization
4. Skills alignment
5. Industry-specific terminology

Return the optimized resume data with improvements.`;

    const response = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          optimizedResume: { type: "object" },
          keywordSuggestions: {
            type: "array",
            items: { type: "string" }
          },
          atsScore: { type: "number" },
          improvements: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error optimizing for ATS:', error);
    throw new Error('Failed to optimize resume for ATS');
  }
};