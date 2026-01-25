
import { GoogleGenAI, Type } from "@google/genai";
import { CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProductionInsights(result: CalculationResult): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this brewery production run:
        - Keg Type: ${result.kegType}
        - Available Product: ${result.availableProduct}L
        - Kegs Filled: ${result.totalKegs}
        - Total Litres Filled: ${result.filledLitres}L
        - Waste: ${result.wasteLitres}L (${result.wastePercentage.toFixed(2)}%)
        
        Provide a very brief (2 sentence) professional assessment of efficiency.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Calculation complete. Efficiency looks stable.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Analysis unavailable at this moment.";
  }
}
