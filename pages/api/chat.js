import { GoogleGenerativeAI } from "@google/generative-ai";
import yahooFinance from "yahoo-finance2";

export const config = {
  runtime: "nodejs",
};

// In-memory conversation history
let conversationHistory = [];

// Simple stock name → Yahoo Finance symbol mapping
const stockMap = {
  "reliance": "RELIANCE.NS",
  "tcs": "TCS.NS",
  "infosys": "INFY.NS",
  "hdfc": "HDFC.NS",
  "icici": "ICICIBANK.NS",
  "hdfcbank": "HDFCBANK.NS",
  "kotak mahindra": "KOTAKBANK.NS",
  "larsentoubro": "LT.NS",
  "bharti airtel": "BHARTIARTL.NS",
  "itc": "ITC.NS",
  "asian paints": "ASIANPAINT.NS",
  "maruti": "MARUTI.NS",
  "hcl tech": "HCLTECH.NS",
  "wipro": "WIPRO.NS",
  "sun pharma": "SUNPHARMA.NS",
  "ntpc": "NTPC.NS",
  "powergrid": "POWERGRID.NS",
  "ultratech": "ULTRATECH.NS",
  "titan": "TITAN.NS",
  "dr reddy": "DRREDDY.NS",
  "adani ports": "ADANIPORTS.NS",
  "divislabs": "DIVISLAB.NS",
  "tech mahindra": "TECHM.NS",
  "indusind": "INDUSINDBK.NS",
  "grasim": "GRASIM.NS",
  "bpcl": "BPCL.NS",
  "ntpc": "NTPC.NS",
  "bharat forge": "BHARATFORG.NS",
  "shree cement": "SHREECEM.NS",
  "hcl": "HCLTECH.NS"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let stockDataText = "";

    // 1️⃣ Detect stock name in user message
    const nameMatch = Object.keys(stockMap).find((name) =>
      message.toLowerCase().includes(name)
    );

    if (nameMatch) {
      const symbol = stockMap[nameMatch];

      try {
        // 2️⃣ Fetch live stock data from Yahoo Finance
        const quote = await yahooFinance.quote(symbol);

        if (quote && quote.regularMarketPrice) {
          stockDataText = `Current price for ${quote.longName} (${symbol}): ₹${quote.regularMarketPrice}, Open = ₹${quote.regularMarketOpen}, High = ₹${quote.regularMarketDayHigh}, Low = ₹${quote.regularMarketDayLow}, Change = ₹${quote.regularMarketChange} (${quote.regularMarketChangePercent.toFixed(
            2
          )}%)`;
        } else {
          stockDataText = `Could not fetch live stock price for ${symbol}.`;
        }
      } catch (err) {
        console.error("Yahoo Finance error:", err);
        stockDataText = `Could not fetch live stock price at the moment.`;
      }
    }

    // 3️⃣ System / persona prompt
    const systemPrompt = `
You are StockSage, an AI assistant specialized in Indian stock market (NSE & BSE).
Respond only about Indian stocks.
Provide concise, structured, and expert answers in Markdown format.
Include headings, bullets, and plain language. Avoid general AI chatter.
`;

    // 4️⃣ Prepare conversation context
    const context = conversationHistory
      .slice(-5)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // 5️⃣ Combine system prompt + context + user message + stock data
    const finalPrompt = `
${systemPrompt}

Conversation so far:
${context}

User asked: "${message}"

${stockDataText ? "Here is live stock data:\n" + stockDataText : ""}
`;

    // 6️⃣ Call Gemini API
    const result = await model.generateContent(finalPrompt);
    const aiMessage = result.response.text();

    // 7️⃣ Update conversation history
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "assistant", content: aiMessage });

    res.status(200).json({ message: aiMessage });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ message: "Error connecting to AI API" });
  }
}
