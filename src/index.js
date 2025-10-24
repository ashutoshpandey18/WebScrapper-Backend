const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { scrapeData } = require('./scraper');
const { createRateLimiter } = require('./utils/limiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting per API key
const apiKeyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this API key, please try again later.'
});

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the x-api-key header'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is invalid'
    });
  }

  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main scraping endpoint
app.post('/scrape', apiKeyLimiter, validateApiKey, async (req, res) => {
  try {
    const { search, location, limit = 10 } = req.body;

    // Input validation
    if (!search || !location) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both "search" and "location" parameters are required'
      });
    }

    if (typeof search !== 'string' || typeof location !== 'string') {
      return res.status(400).json({
        error: 'Invalid parameter types',
        message: 'Both "search" and "location" must be strings'
      });
    }

    if (limit && (typeof limit !== 'number' || limit < 1 || limit > 100)) {
      return res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    console.log(`Scraping request: ${search} in ${location}, limit: ${limit}`);

    // Execute scraping
    const results = await scrapeData({ search, location, limit });

    res.status(200).json({
      success: true,
      data: results,
      metadata: {
        count: results.length,
        search,
        location,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);

    res.status(500).json({
      error: 'Scraping failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scraper API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;