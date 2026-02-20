/**
 * API Key Validator Service
 * Tests if provided API keys are valid before accepting them
 */

class KeyValidatorService {
  /**
   * Validate Google AI (Gemini) API key
   * @param {string} apiKey - The API key to validate
   * @param {string} model - The model to test (default: gemini-2.5-flash)
   * @returns {Promise<{valid: boolean, error: string|null}>}
   */
  async validateGoogleAI(apiKey, model = 'gemini-2.5-flash') {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key is required' };
    }

    if (!apiKey.startsWith('AIza')) {
      return { valid: false, error: 'Invalid API key format. Google AI keys start with "AIza"' };
    }

    try {
      // Dynamically import to avoid loading if not needed
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });
      
      // Test with a simple prompt
      const result = await genModel.generateContent('Hello');
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        return { valid: true, error: null };
      }
      
      return { valid: false, error: 'API key validation failed: No response received' };
    } catch (error) {
      console.error('Google AI validation error:', error);
      
      if (error.message?.includes('API key')) {
        return { valid: false, error: 'Invalid API key. Please check your key and try again.' };
      } else if (error.message?.includes('quota')) {
        // Quota exceeded means the key is valid, just no quota left
        return { valid: true, error: null };
      } else if (error.message?.includes('model')) {
        return { valid: false, error: `Model "${model}" not found or not accessible with this key` };
      } else if (error.message?.includes('403')) {
        return { valid: false, error: 'API key does not have permission to access this service' };
      } else if (error.message?.includes('404')) {
        return { valid: false, error: 'Invalid API endpoint or model not found' };
      }
      
      return { valid: false, error: `Validation failed: ${error.message}` };
    }
  }

  /**
   * Validate OpenAI API key
   * @param {string} apiKey - The API key to validate
   * @returns {Promise<{valid: boolean, error: string|null}>}
   */
  async validateOpenAI(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key is required' };
    }

    if (!apiKey.startsWith('sk-')) {
      return { valid: false, error: 'Invalid API key format. OpenAI keys start with "sk-"' };
    }

    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { valid: true, error: null };
      }

      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key. Please check your key and try again.' };
      } else if (response.status === 429) {
        // Rate limited means the key is valid
        return { valid: true, error: null };
      } else if (response.status === 403) {
        return { valid: false, error: 'API key does not have permission to access this service' };
      }

      const errorData = await response.json().catch(() => ({}));
      return { valid: false, error: errorData.error?.message || `Validation failed with status ${response.status}` };
    } catch (error) {
      console.error('OpenAI validation error:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        return { valid: false, error: 'Network error. Please check your internet connection.' };
      }
      
      return { valid: false, error: `Validation failed: ${error.message}` };
    }
  }

  /**
   * Validate Mapbox access token
   * @param {string} token - The access token to validate
   * @returns {Promise<{valid: boolean, error: string|null}>}
   */
  async validateMapbox(token) {
    if (!token || token.trim() === '') {
      return { valid: false, error: 'Access token is required' };
    }

    if (!token.startsWith('pk.')) {
      return { valid: false, error: 'Invalid token format. Mapbox tokens start with "pk."' };
    }

    try {
      // Test the token with a simple API request
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}&limit=1`
      );

      if (response.ok) {
        return { valid: true, error: null };
      }

      if (response.status === 401) {
        return { valid: false, error: 'Invalid access token. Please check your token and try again.' };
      } else if (response.status === 403) {
        return { valid: false, error: 'Access token does not have permission to access this service' };
      }

      const errorData = await response.json().catch(() => ({}));
      return { valid: false, error: errorData.message || `Validation failed with status ${response.status}` };
    } catch (error) {
      console.error('Mapbox validation error:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        return { valid: false, error: 'Network error. Please check your internet connection.' };
      }
      
      return { valid: false, error: `Validation failed: ${error.message}` };
    }
  }

  /**
   * Validate all provided keys
   * @param {Object} keys - Object containing keys to validate
   * @returns {Promise<Object>} - Object with validation results for each key
   */
  async validateAll(keys) {
    const results = {};

    if (keys.googleAI) {
      results.googleAI = await this.validateGoogleAI(keys.googleAI, keys.googleAIModel);
    }

    if (keys.openAI) {
      results.openAI = await this.validateOpenAI(keys.openAI);
    }

    if (keys.mapbox) {
      results.mapbox = await this.validateMapbox(keys.mapbox);
    }

    return results;
  }
}

export default new KeyValidatorService();
