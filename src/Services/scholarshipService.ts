import { InvokeLLM } from '@/integrations/Core';

export interface ScholarshipData {
  title: string;
  organization: string;
  description: string;
  amount: string;
  eligibility: string[];
  requirements: string[];
  deadline: string;
  applicationUrl: string;
  category: string;
  level: string;
  country: string;
  field: string;
}

export const fetchRealTimeScholarships = async (
  field?: string,
  level?: string,
  country?: string
): Promise<ScholarshipData[]> => {
  try {
    const prompt = `Find current scholarship opportunities for students. Search for real-time scholarship information from reliable sources like government websites, universities, and scholarship databases.

Search criteria:
- Field of study: ${field || 'Any field'}
- Academic level: ${level || 'All levels'}
- Country/Region: ${country || 'Global'}

Please provide a comprehensive list of current scholarships with the following information for each:
1. Scholarship title
2. Offering organization
3. Brief description
4. Award amount
5. Eligibility criteria
6. Application requirements
7. Application deadline
8. Application URL/website
9. Category (merit, need-based, minority, field-specific, etc.)
10. Academic level (undergraduate, graduate, etc.)
11. Country/region
12. Field of study

Focus on scholarships that are currently open for applications or will open soon. Include both government and private scholarships.`;

    const response = await InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          scholarships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                organization: { type: "string" },
                description: { type: "string" },
                amount: { type: "string" },
                eligibility: {
                  type: "array",
                  items: { type: "string" }
                },
                requirements: {
                  type: "array",
                  items: { type: "string" }
                },
                deadline: { type: "string" },
                applicationUrl: { type: "string" },
                category: { type: "string" },
                level: { type: "string" },
                country: { type: "string" },
                field: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response.scholarships || [];
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    throw new Error('Failed to fetch scholarship data');
  }
};

export const getScholarshipRecommendations = async (
  userProfile: {
    field: string;
    level: string;
    gpa?: string;
    interests: string[];
    location: string;
  }
): Promise<ScholarshipData[]> => {
  try {
    const prompt = `Based on the following student profile, recommend the most suitable scholarships:

Student Profile:
- Field of Study: ${userProfile.field}
- Academic Level: ${userProfile.level}
- GPA: ${userProfile.gpa || 'Not specified'}
- Interests: ${userProfile.interests.join(', ')}
- Location: ${userProfile.location}

Find scholarships that match this profile and rank them by relevance. Include both merit-based and need-based options.`;

    const response = await InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                organization: { type: "string" },
                description: { type: "string" },
                amount: { type: "string" },
                eligibility: {
                  type: "array",
                  items: { type: "string" }
                },
                requirements: {
                  type: "array",
                  items: { type: "string" }
                },
                deadline: { type: "string" },
                applicationUrl: { type: "string" },
                category: { type: "string" },
                level: { type: "string" },
                country: { type: "string" },
                field: { type: "string" },
                matchScore: { type: "number" },
                matchReason: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response.recommendations || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw new Error('Failed to get scholarship recommendations');
  }
};