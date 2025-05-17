require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');

// Initialize Express
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok', message: 'Server is running' });
});

// Chart data endpoint
app.post('/api/v1/chart-data', (req, res) => {
  try {
    const birthDetails = req.body;
    
    // Basic validation
    if (!birthDetails || !birthDetails.dateOfBirth || !birthDetails.timeOfBirth) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        error: 'Missing required fields',
        required: ['dateOfBirth', 'timeOfBirth', 'locationName', 'latitude', 'longitude']
      });
    }
    
    // Mock response for now
    const mockResponse = {
      status: 'success',
      data: {
        rasi: [
          { name: 'Sun', house: 1, sign: 'Aries', degree: 10 },
          { name: 'Moon', house: 4, sign: 'Cancer', degree: 15 },
          { name: 'Mars', house: 7, sign: 'Libra', degree: 20 },
          { name: 'Mercury', house: 10, sign: 'Capricorn', degree: 5 },
          { name: 'Jupiter', house: 2, sign: 'Taurus', degree: 25 },
          { name: 'Venus', house: 5, sign: 'Leo', degree: 15 },
          { name: 'Saturn', house: 8, sign: 'Scorpio', degree: 10 },
          { name: 'Rahu', house: 11, sign: 'Aquarius', degree: 20 },
          { name: 'Ketu', house: 5, sign: 'Leo', degree: 20 }
        ],
        navamsa: [
          { name: 'Sun', house: 9, sign: 'Sagittarius', degree: 5 },
          { name: 'Moon', house: 10, sign: 'Capricorn', degree: 20 },
          { name: 'Mars', house: 11, sign: 'Aquarius', degree: 15 },
          { name: 'Mercury', house: 12, sign: 'Pisces', degree: 10 },
          { name: 'Jupiter', house: 1, sign: 'Aries', degree: 25 },
          { name: 'Venus', house: 2, sign: 'Taurus', degree: 15 },
          { name: 'Saturn', house: 3, sign: 'Gemini', degree: 20 },
          { name: 'Rahu', house: 4, sign: 'Cancer', degree: 10 },
          { name: 'Ketu', house: 10, sign: 'Capricorn', degree: 10 }
        ]
      }
    };
    
    res.status(StatusCodes.OK).json(mockResponse);
    
  } catch (error) {
    console.error('Error in chart-data endpoint:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    error: 'Internal server error',
    message: err.message
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
