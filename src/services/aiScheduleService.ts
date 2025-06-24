
export interface AIScheduleItem {
  start: string;
  end: string;
  task: string;
}

export interface AIScheduleResponse {
  success: boolean;
  schedule: AIScheduleItem[];
  error?: string;
}

export class AIScheduleService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSchedule(prompt: string): Promise<AIScheduleResponse> {
    try {
      const systemPrompt = `You are a smart schedule assistant. Parse natural language input and return a structured daily schedule.

Rules:
1. Convert all times to 12-hour format (e.g., "6:00 AM", "2:30 PM")
2. Fill in reasonable gaps and durations when not specified
3. Avoid scheduling conflicts
4. Keep tasks concise and clear
5. Return ONLY valid JSON array format

Example input: "Study DSA from 6am to 9am, then break for an hour, work on FSD from 10 to 1, lunch after that"
Example output: [
  {"start": "6:00 AM", "end": "9:00 AM", "task": "Study DSA"},
  {"start": "9:00 AM", "end": "10:00 AM", "task": "Break"},
  {"start": "10:00 AM", "end": "1:00 PM", "task": "Work on FSD"},
  {"start": "1:00 PM", "end": "2:00 PM", "task": "Lunch"}
]

Return only the JSON array, no other text.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      let schedule: AIScheduleItem[];
      try {
        schedule = JSON.parse(aiResponse);
      } catch (parseError) {
        // Try to extract JSON from the response if it contains extra text
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          schedule = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }

      // Validate the schedule format
      if (!Array.isArray(schedule)) {
        throw new Error('AI response is not an array');
      }

      const validatedSchedule = schedule.map((item, index) => {
        if (!item.start || !item.end || !item.task) {
          throw new Error(`Invalid schedule item at index ${index}`);
        }
        return {
          start: item.start,
          end: item.end,
          task: item.task,
        };
      });

      return {
        success: true,
        schedule: validatedSchedule,
      };

    } catch (error) {
      console.error('AI Schedule Service Error:', error);
      return {
        success: false,
        schedule: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
