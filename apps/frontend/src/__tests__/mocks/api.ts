import { Response } from 'node-fetch';

export const mockApi = {
  // Success response
  success: (): Response => {
    const response = new Response(JSON.stringify({
      success: true,
      data: {
        houses: {
          '1': {
            name: 'First House',
            description: 'Description of first house',
            influences: ['Sun', 'Moon', 'Mars']
          }
        }
      }
    }), {
      status: 200,
      statusText: 'OK'
    });
    return response;
  },

  // Server error response
  serverError: (): Response => {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      statusText: 'Internal Server Error'
    });
  },

  // Authentication error response
  authError: (): Response => {
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication failed'
    }), {
      status: 401,
      statusText: 'Unauthorized'
    });
  },

  // Validation error response
  validationError: (): Response => {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid input data'
    }), {
      status: 422,
      statusText: 'Unprocessable Entity'
    });
  },

  // Timeout response
  timeout: (): Response => {
    return new Response(JSON.stringify({
      success: false,
      error: 'Request timeout'
    }), {
      status: 408,
      statusText: 'Request Timeout'
    })
  }),

  // Authentication error (401/403)
  authError: (status: 401 | 403 = 401): MockedResponse => ({
    status,
    json: () => Promise.resolve({
      error: status === 401 ? 'Unauthorized' : 'Forbidden'
    })
  }),

  // Validation error (422)
  validationError: (): MockedResponse => ({
    status: 422,
    json: () => Promise.resolve({
      error: 'Invalid data format'
    })
  }),

  // Timeout
  timeout: (): MockedResponse => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 11000);
    });
  }
};