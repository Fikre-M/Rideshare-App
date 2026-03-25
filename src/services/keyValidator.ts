/**
 * API Key Validator Service
 * Tests if provided API keys are valid before accepting them
 */

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

interface KeysToValidate {
  googleAI?: string;
  googleAIModel?: string;
  openAI?: string;
  mapbox?: string;
}

interface ValidationResults {
  googleAI?: ValidationResult;
  openAI?: ValidationResult;
  mapbox?: ValidationResult;
}

class KeyValidatorService {
  async validateGoogleAI(apiKey: string, model = 'gemini-2.5-flash'): Promise<ValidationResult> {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key is required' };
    }
    if (!apiKey.startsWith('AIza')) {
      return { valid: false, error: 'Invalid API key format. Google AI keys start with "AIza"' };
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent('Hello');
      const response = await result.response;
      const text = response.text();
      if (text) return { valid: true, error: null };
      return { valid: false, error: 'API key validation failed: No response received' };
    } catch (error: any) {
      console.error('Google AI validation error:', error);
      if (error.message?.includes('API key')) {
        return { valid: false, error: 'Invalid API key. Please check your key and try again.' };
      } else if (error.message?.includes('quota')) {
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

  async validateOpenAI(apiKey: string): Promise<ValidationResult> {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key is required' };
    }
    if (!apiKey.startsWith('sk-')) {
      return { valid: false, error: 'Invalid API key format. OpenAI keys start with "sk-"' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      });

      if (response.ok) return { valid: true, error: null };
      if (response.status === 401) return { valid: false, error: 'Invalid API key. Please check your key and try again.' };
      if (response.status === 429) return { valid: true, error: null };
      if (response.status === 403) return { valid: false, error: 'API key does not have permission to access this service' };

      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      return { valid: false, error: errorData.error?.message || `Validation failed with status ${response.status}` };
    } catch (error: any) {
      console.error('OpenAI validation error:', error);
      if (error.message?.includes('Failed to fetch')) {
        return { valid: false, error: 'Network error. Please check your internet connection.' };
      }
      return { valid: false, error: `Validation failed: ${error.message}` };
    }
  }

  async validateMapbox(token: string): Promise<ValidationResult> {
    if (!token || token.trim() === '') {
      return { valid: false, error: 'Access token is required' };
    }
    if (!token.startsWith('pk.')) {
      return { valid: false, error: 'Invalid token format. Mapbox tokens start with "pk."' };
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}&limit=1`
      );

      if (response.ok) return { valid: true, error: null };
      if (response.status === 401) return { valid: false, error: 'Invalid access token. Please check your token and try again.' };
      if (response.status === 403) return { valid: false, error: 'Access token does not have permission to access this service' };

      const errorData = await response.json().catch(() => ({})) as { message?: string };
      return { valid: false, error: errorData.message || `Validation failed with status ${response.status}` };
    } catch (error: any) {
      console.error('Mapbox validation error:', error);
      if (error.message?.includes('Failed to fetch')) {
        return { valid: false, error: 'Network error. Please check your internet connection.' };
      }
      return { valid: false, error: `Validation failed: ${error.message}` };
    }
  }

  async validateAll(keys: KeysToValidate): Promise<ValidationResults> {
    const results: ValidationResults = {};
    if (keys.googleAI) results.googleAI = await this.validateGoogleAI(keys.googleAI, keys.googleAIModel);
    if (keys.openAI) results.openAI = await this.validateOpenAI(keys.openAI);
    if (keys.mapbox) results.mapbox = await this.validateMapbox(keys.mapbox);
    return results;
  }
}

export default new KeyValidatorService();
