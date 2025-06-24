
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { AIScheduleService, AIScheduleItem } from '@/services/aiScheduleService';

interface AIChatProps {
  onScheduleGenerated: (schedule: AIScheduleItem[]) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ onScheduleGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const handleGenerateSchedule = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter your schedule requirements.",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key required",
        description: "Please enter your OpenAI API key to use AI features.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const aiService = new AIScheduleService(apiKey);
      const result = await aiService.generateSchedule(prompt);

      if (result.success) {
        onScheduleGenerated(result.schedule);
        setPrompt('');
        toast({
          title: "Schedule generated! ✨",
          description: `Created ${result.schedule.length} schedule items from your prompt.`,
        });
      } else {
        toast({
          title: "Generation failed",
          description: result.error || "Failed to generate schedule. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Schedule generation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateSchedule();
    }
  };

  const examplePrompts = [
    "Study DSA from 6am to 9am, then break for an hour, work on FSD from 10 to 1, lunch after that",
    "Gym at 6am, breakfast, work from 9 to 5 with lunch break at 1pm",
    "Morning meditation, study algorithms until noon, aptitude practice from 2 to 4pm, evening walk"
  ];

  return (
    <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bot className="h-5 w-5" />
          🧠 AI Schedule Assistant
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showApiKeyInput && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              OpenAI API Key (required for AI features)
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => setShowApiKeyInput(false)}
                variant="outline"
                disabled={!apiKey.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {!showApiKeyInput && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">✓ API Key configured</span>
            <Button
              onClick={() => setShowApiKeyInput(true)}
              variant="ghost"
              size="sm"
            >
              Change Key
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tell me how you want to plan your day:
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Study DSA from 6am to 9am, then gym, work on projects in the afternoon..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerateSchedule}
              disabled={isLoading || !prompt.trim() || !apiKey.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Try these examples:
          </label>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-xs bg-white border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                {example.length > 50 ? `${example.substring(0, 50)}...` : example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
