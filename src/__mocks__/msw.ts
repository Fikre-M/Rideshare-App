// MSW v2 setup for mocking HTTP requests
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock responses for different AI services
const mockResponses = {
  openai: {
    models: {
      data: [
        { id: 'gpt-4o', object: 'model' },
        { id: 'gpt-3.5-turbo', object: 'model' }
      ]
    },
    chat: {
      id: 'chatcmpl-test',
      object: 'chat.completion',
      choices: [{
        message: {
          role: 'assistant',
          content: JSON.stringify({
            surgeMultiplier: 1.5,
            finalPrice: 18.75,
            reasoning: 'High demand due to weather'
          })
        }
      }],
      usage: { total_tokens: 150 }
    }
  },
  
  googleai: {
    candidates: [{
      content: {
        parts: [{
          text: 'Hello! I can help you with your rideshare needs.'
        }]
      }
    }]
  },
  
  mapbox: {
    geocoding: {
      features: [{
        place_name: '123 Main St, New York, NY',
        center: [-73.9857, 40.7484],
        geometry: {
          coordinates: [-73.9857, 40.7484]
        }
      }]
    },
    
    directions: {
      routes: [{
        distance: 5000,
        duration: 900,
        geometry: {
          coordinates: [
            [-73.9857, 40.7484],
            [-73.9757, 40.7584]
          ]
        }
      }]
    }
  }
};

// Define request handlers
export const handlers = [
  // OpenAI API
  http.get('https://api.openai.com/v1/models', () => {
    return HttpResponse.json(mockResponses.openai.models);
  }),
  
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as any;
    const content = body.messages?.[0]?.content || '';
    
    // Return different responses based on content
    if (content.includes('rate limit')) {
      return HttpResponse.json(
        { error: { type: 'rate_limit_exceeded', message: 'Rate limit exceeded' } },
        { status: 429 }
      );
    }
    
    if (content.includes('invalid')) {
      return HttpResponse.json(
        { error: { type: 'invalid_request_error', message: 'Invalid request' } },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(mockResponses.openai.chat);
  }),
  
  // Google AI API
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', () => {
    return HttpResponse.json(mockResponses.googleai);
  }),
  
  // Mapbox API
  http.get('https://api.mapbox.com/geocoding/v5/mapbox.places/*', () => {
    return HttpResponse.json(mockResponses.mapbox.geocoding);
  }),
  
  http.get('https://api.mapbox.com/directions/v5/mapbox/driving/*', () => {
    return HttpResponse.json(mockResponses.mapbox.directions);
  }),
  
  // Backend AI API
  http.post('http://localhost:8001/api/ai/*', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Mock backend response' }
    });
  }),
];

// Setup server
export const server = setupServer(...handlers);