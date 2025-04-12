import React, { useState } from 'react'
import axios from 'axios'

const StockLookup = () => {
  const [ticker, setTicker] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStock = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`)
      const quote = response.data.quoteResponse.result[0]

      if (!quote) {
        throw new Error('Stock not found')
      }

      setData({
        name: quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        percentChange: quote.regularMarketChangePercent,
      })
    } catch (err) {
      setError('Could not fetch stock data')
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 400 }}>
      <h2>Stock Lookup</h2>
      <input
        type="text"
        placeholder="Enter Ticker (e.g. AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
      />
      <button onClick={fetchStock} disabled={!ticker || loading} style={{ marginLeft: '0.5rem' }}>
        {loading ? 'Loading...' : 'Check'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div style={{ marginTop: '1rem' }}>
          <strong>{data.name}</strong>
          <p>
            Price: ${data.price.toFixed(2)} <br />
            Change: {data.change.toFixed(2)} ({data.percentChange.toFixed(2)}%)
          </p>
        </div>
      )}
    </div>
  )
}

export default StockLookup
