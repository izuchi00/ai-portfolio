"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Smile, Tag, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner"; // Import LoadingSpinner

const TextAnalysis = () => {
  const [inputText, setInputText] = useState<string>("");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAnalyzeText = () => {
    if (inputText.trim() === "") {
      toast.error("Please enter some text to analyze.");
      return;
    }

    setIsLoading(true);
    setSentiment(null);
    setKeywords([]);
    setSummary(null);

    // Simulate AI analysis
    setTimeout(() => {
      const lowerText = inputText.toLowerCase();
      let simulatedSentiment = "Neutral";
      let simulatedKeywords: string[] = [];
      let simulatedSummary = "This is a simulated summary of your text. For real-time, advanced summarization, a backend integration with a large language model is required.";

      if (lowerText.includes("great") || lowerText.includes("excellent") || lowerText.includes("happy") || lowerText.includes("positive")) {
        simulatedSentiment = "Positive";
      } else if (lowerText.includes("bad") || lowerText.includes("terrible") || lowerText.includes("sad") || lowerText.includes("negative")) {
        simulatedSentiment = "Negative";
      }

      // Simple keyword extraction simulation
      const commonWords = ["the", "a", "an", "is", "are", "was", "were", "and", "or", "but", "to", "of", "in", "for", "on", "with", "this", "that", "it", "its"];
      simulatedKeywords = Array.from(new Set(
        lowerText
          .replace(/[.,!?;:"']/g, "")
          .split(/\s+/)
          .filter(word => word.length > 3 && !commonWords.includes(word))
          .slice(0, 5) // Limit to 5 keywords
      ));

      setSentiment(simulatedSentiment);
      setKeywords(simulatedKeywords);
      setSummary(simulatedSummary);
      setIsLoading(false);
      toast.success("Simulated text analysis complete!");
    }, 2000); // Simulate 2-second analysis time
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">AI-Powered Text Analysis</CardTitle>
          <CardDescription className="text-center mt-2">
            Extract insights from your text: sentiment, keywords, and summaries (simulated).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="text-input">Enter Text for Analysis</Label>
            <Textarea
              id="text-input"
              placeholder="Type or paste your text here..."
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            size="lg"
            onClick={handleAnalyzeText}
            disabled={inputText.trim() === "" || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size={16} className="mr-2" />
                Analyzing...
              </>
            ) : (
              "Analyze Text (Demo)"
            )}
          </Button>

          {(sentiment || keywords.length > 0 || summary) && (
            <div className="mt-8 space-y-6">
              <h3 className="text-2xl font-semibold text-center">Simulated Analysis Results:</h3>

              {sentiment && (
                <div className="flex items-center gap-4 p-4 border rounded-md bg-muted">
                  <Smile className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="text-lg font-medium">Sentiment:</h4>
                    <p className="text-muted-foreground">{sentiment}</p>
                  </div>
                </div>
              )}

              {keywords.length > 0 && (
                <div className="flex items-start gap-4 p-4 border rounded-md bg-muted">
                  <Tag className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-medium">Keywords:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-md px-3 py-1">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {summary && (
                <div className="flex items-start gap-4 p-4 border rounded-md bg-muted">
                  <BookOpen className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-medium">Summary:</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-destructive-foreground font-medium text-center">
                Note: These results are simulated. For real AI text analysis, a backend integration is required.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextAnalysis;