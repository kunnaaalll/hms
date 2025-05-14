"use client";

import type { SuggestAlternativeDatesOutput } from '@/ai/flows/suggest-alternative-dates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CalendarCheck, TrendingUp, TrendingDown, CheckCircle, IndianRupee } from 'lucide-react';

interface AlternativeDateSuggestionProps {
  suggestion: SuggestAlternativeDatesOutput;
  onAcceptSuggestion: (startDate: string, endDate: string) => void;
  currentPrice?: number;
  currentAvailability?: number;
}

export function AlternativeDateSuggestion({ 
  suggestion, 
  onAcceptSuggestion,
  currentPrice,
  currentAvailability 
}: AlternativeDateSuggestionProps) {
  if (!suggestion.shouldSuggestAlternatives) {
    return (
       <Card className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
           <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <CardTitle className="text-lg text-green-700 dark:text-green-300">Looks Good!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600 dark:text-green-400">{suggestion.reason || "The selected dates seem optimal for availability and price."}</p>
        </CardContent>
      </Card>
    );
  }

  const priceChange = suggestion.suggestedPrice && currentPrice ? suggestion.suggestedPrice - currentPrice : null;
  const availabilityChange = suggestion.suggestedAvailabilityScore && currentAvailability ? suggestion.suggestedAvailabilityScore - currentAvailability : null;


  return (
    <Card className="bg-accent/50 border-primary/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl text-primary">Alternative Dates Suggested</CardTitle>
        </div>
        <CardDescription className="text-sm">{suggestion.reason}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
          <div>
            <h4 className="font-semibold mb-1">Suggested Dates:</h4>
            <p className="text-sm">
              {suggestion.suggestedStartDate} to {suggestion.suggestedEndDate}
            </p>
          </div>
          {suggestion.suggestedPrice !== undefined && (
            <div>
              <h4 className="font-semibold mb-1 flex items-center">
                New Price: <IndianRupee className="h-4 w-4 inline-block mx-1" />{suggestion.suggestedPrice.toLocaleString('en-IN')}
                {priceChange !== null && (
                  <span className={`ml-2 text-xs font-bold flex items-center ${priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChange < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                    {priceChange < 0 ? `-₹${Math.abs(priceChange).toLocaleString('en-IN')}` : `+₹${priceChange.toLocaleString('en-IN')}`}
                  </span>
                )}
              </h4>
               {currentPrice && <p className="text-xs text-muted-foreground">Original: <IndianRupee className="h-3 w-3 inline-block mr-0.5" />{currentPrice.toLocaleString('en-IN')}</p>}
            </div>
          )}
          {suggestion.suggestedAvailabilityScore !== undefined && (
            <div>
              <h4 className="font-semibold mb-1 flex items-center">
                Availability: {suggestion.suggestedAvailabilityScore}%
                 {availabilityChange !== null && (
                  <span className={`ml-2 text-xs font-bold flex items-center ${availabilityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {availabilityChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {availabilityChange > 0 ? `+${availabilityChange}%` : `${availabilityChange}%`}
                  </span>
                )}
              </h4>
              {currentAvailability && <p className="text-xs text-muted-foreground">Original: {currentAvailability}%</p>}
            </div>
          )}
        </div>
        {suggestion.suggestedStartDate && suggestion.suggestedEndDate && (
          <Button 
            className="w-full" 
            onClick={() => onAcceptSuggestion(suggestion.suggestedStartDate!, suggestion.suggestedEndDate!)}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Switch to these Dates
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
