import axios from 'axios';

export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  try {
    const apiKey = process.env.STOCK_API_KEY;
    const response = await axios.get(
      `https://www.alphavantage.co/query`,
      {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: `${symbol}.BSE`, // Use .BSE for Bombay Stock Exchange, or .NSE for NSE
          apikey: apiKey
        }
      }
    );

    const data = response.data['Global Quote'];
    if (!data) return res.status(404).json({ error: 'Stock data not found' });

    res.status(200).json({
      symbol: data['01. symbol'],
      currentPrice: data['05. price'],
      change: data['09. change'],
      changePercent: data['10. change percent']
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
