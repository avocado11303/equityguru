import { GoogleGenerativeAI } from "@google/generative-ai";
import yahooFinance from "yahoo-finance2";

export const config = { runtime: "nodejs" };

// In-memory conversation history
let conversationHistory = [];

// Top 30 Indian stocks mapping
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
  "bharat forge": "BHARATFORG.NS",
  "shree cement": "SHREECEM.NS"
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let stockDataText = "";

    // Detect stock name in user message
    const nameMatch = Object.keys(stockMap).find((name) =>
      message.toLowerCase().includes(name)
    );

    if (nameMatch) {
      const symbol = stockMap[nameMatch];
      try {
        const quote = await yahooFinance.quote(symbol);
        if (quote && quote.regularMarketPrice) {
          stockDataText = `**${quote.longName} (${symbol})**\n- Current Price: ₹${quote.regularMarketPrice}\n- Open: ₹${quote.regularMarketOpen}\n- High: ₹${quote.regularMarketDayHigh}\n- Low: ₹${quote.regularMarketDayLow}\n- Change: ₹${quote.regularMarketChange} (${quote.regularMarketChangePercent.toFixed(2)}%)`;
        } else {
          stockDataText = `Could not fetch live stock price for ${symbol}.`;
        }
      } catch (err) {
        console.error("Yahoo Finance error:", err);
        stockDataText = `Could not fetch live stock price at the moment.`;
      }
    }

    // Concise system prompt
    const systemPrompt = `
You are EquityGuru, an AI assistant specialized in Indian stock market (NSE & BSE).
Answer concisely in **3-5 sentences maximum**.
Provide structured, expert responses in Markdown format with headings and bullets.
Do NOT give long paragraphs or unrelated information.
`;

    // Prepare last 5 messages as context
    const context = conversationHistory
      .slice(-5)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const finalPrompt = `
${systemPrompt}

Conversation so far:
${context}

User asked: "${message}"

${stockDataText ? "Live Stock Data:\n" + stockDataText : ""}
`;

    const result = await model.generateContent(finalPrompt);
    const aiMessage = result.response.text();

    // Update conversation history
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "assistant", content: aiMessage });

    res.status(200).json({ message: aiMessage });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ message: "Error connecting to AI API" });
  }
}
