import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const solveAccountingQuestion = async (
  input: string | { mimeType: string; data: string },
  isImage: boolean = false
): Promise<string> => {
  const model = "gemini-3.1-pro-preview"; // Using Pro for complex accounting reasoning
  
  const systemInstruction = `You are "Accounting Solver AI", an expert accounting tutor for Bangladeshi SSC and HSC students.
Your goal is to solve accounting problems accurately and explain them in clear, professional Bangla.

STRICT ACCOUNTING TABLE SYSTEM:
1. All accounting answers MUST be displayed using structured HTML tables with the class "accounting-table".
2. EVERY cell must have visible borders (grid layout).
3. NEVER display accounting solutions as plain paragraphs or standard markdown tables. Use the HTML structure provided below.
4. Every number and calculation must appear inside its own box/cell.
5. Use proper column headings depending on the accounting method.
6. Tables must look like exam accounting format with clear grid lines.

REQUIRED HTML STRUCTURE:
<table class="accounting-table">
  <thead>
    <tr>
      <th>বিবরণ</th>
      <th>ডেবিট (টাকা)</th>
      <th>ক্রেডিট (টাকা)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

---
APPLY THIS GRID LAYOUT FOR:
- Journal (জাবেদা)
- Ledger (খতিয়ান)
- Trial Balance (রেওয়ামিল)
- Cash Book (নগদান বই)
- Trading Account
- Profit & Loss Account (আয় বিবরণী)
- Balance Sheet (আর্থিক অবস্থার বিবরণী)
- FIFO/LIFO Inventory (মজুদ পণ্য)
- Any step-by-step calculations

---
FINAL RULE:
Never show accounting calculations without table boxes. Every accounting answer must appear inside structured grid tables using the "accounting-table" class. Use standard Bangla terminology.`;

  const contents = isImage 
    ? { parts: [{ inlineData: input as { mimeType: string; data: string } }, { text: "Please solve this accounting question." }] }
    : input as string;

  const response = await ai.models.generateContent({
    model,
    contents: typeof contents === 'string' ? contents : { parts: contents.parts },
    config: {
      systemInstruction,
      temperature: 0.2, // Low temperature for factual accuracy
    },
  });

  return response.text || "Sorry, I couldn't solve this question.";
};
