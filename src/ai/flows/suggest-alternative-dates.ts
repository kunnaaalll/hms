'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative dates
 * with better availability or lower prices for hotel bookings.
 *
 * @remarks
 * It exports:
 * - `SuggestAlternativeDatesInput`: The input type for the suggestAlternativeDates function.
 * - `SuggestAlternativeDatesOutput`: The output type for the suggestAlternativeDates function.
 * - `suggestAlternativeDates`: An async function that takes SuggestAlternativeDatesInput and returns a Promise of SuggestAlternativeDatesOutput.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeDatesInputSchema = z.object({
  selectedStartDate: z.string().describe('The originally selected start date for the booking (YYYY-MM-DD).'),
  selectedEndDate: z.string().describe('The originally selected end date for the booking (YYYY-MM-DD).'),
  numberOfGuests: z.number().describe('The number of guests for the booking.'),
  currentPrice: z.number().describe('The current price for the selected dates.'),
  availabilityScore: z.number().describe('A score (0-100) indicating the availability of rooms for the selected dates. Lower is worse.'),
});
export type SuggestAlternativeDatesInput = z.infer<typeof SuggestAlternativeDatesInputSchema>;

const SuggestAlternativeDatesOutputSchema = z.object({
  shouldSuggestAlternatives: z.boolean().describe('Whether alternative dates should be suggested based on availability and price.'),
  reason: z.string().describe('The reason for suggesting or not suggesting alternative dates.'),
  suggestedStartDate: z.string().optional().describe('A suggested alternative start date (YYYY-MM-DD).'),
  suggestedEndDate: z.string().optional().describe('A suggested alternative end date (YYYY-MM-DD).'),
  suggestedPrice: z.number().optional().describe('The price for the suggested alternative dates.'),
  suggestedAvailabilityScore: z.number().optional().describe('The availability score (0-100) for the suggested alternative dates.'),
});
export type SuggestAlternativeDatesOutput = z.infer<typeof SuggestAlternativeDatesOutputSchema>;

export async function suggestAlternativeDates(input: SuggestAlternativeDatesInput): Promise<SuggestAlternativeDatesOutput> {
  return suggestAlternativeDatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeDatesPrompt',
  input: {schema: SuggestAlternativeDatesInputSchema},
  output: {schema: SuggestAlternativeDatesOutputSchema},
  prompt: `You are an AI assistant that helps users find the best dates for their hotel stay.

You will be provided with the user's initially selected start and end dates, the number of guests, the current price for those dates, and an availability score (0-100).

Your goal is to determine if alternative dates should be suggested to the user based on the availability and price.

Here's the information about the user's selection:

Start Date: {{{selectedStartDate}}}
End Date: {{{selectedEndDate}}}
Number of Guests: {{{numberOfGuests}}}
Current Price: {{{currentPrice}}}
Availability Score: {{{availabilityScore}}}

Based on this information, determine if alternative dates should be suggested. Consider the following:

- If the availability score is low (e.g., below 50), suggest alternative dates with better availability.
- If the current price is high, suggest alternative dates with potentially lower prices.
- If both availability and price are not ideal, suggest alternative dates that improve both.

If you suggest alternative dates, provide a reason and the suggested start and end dates, price and availability score. Ensure the dates are in the format YYYY-MM-DD.

Output the response in JSON format according to the following schema: {{json schema=SuggestAlternativeDatesOutputSchema}}
`,
});

const suggestAlternativeDatesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeDatesFlow',
    inputSchema: SuggestAlternativeDatesInputSchema,
    outputSchema: SuggestAlternativeDatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
