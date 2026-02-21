/**
 * AI Memory Database using Dexie.js
 * Stores last 30 days of user AI interactions for context-aware responses
 */

import Dexie, { Table } from 'dexie';

export interface AIInteraction {
  id?: number;
  timestamp: Date;
  type: 'search' | 'match' | 'pricing' | 'chat' | 'route' | 'forecast';
  query: string;
  response: string;
  metadata: {
    model?: string;
    cost?: number;
    tokens?: number;
    preferences?: Record<string, any>;
    location?: { lat: number; lng: number };
    timeOfDay?: string;
    vehicleType?: string;
    price?: number;
  };
}

export interface UserPreference {
  id?: number;
  key: string;
  value: any;
  frequency: number;
  lastUsed: Date;
  context: string;
}

export interface AISession {
  id?: number;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  interactions: number;
  totalCost: number;
  models: string[];
}

class AIMemoryDatabase extends Dexie {
  interactions!: Table<AIInteraction, number>;
  preferences!: Table<UserPreference, number>;
  sessions!: Table<AISession, number>;

  constructor() {
    super('AIMemoryDB');
    
    this.version(1).stores({
      interactions: '++id, timestamp, type, [type+timestamp]',
      preferences: '++id, key, frequency, lastUsed',
      sessions: '++id, sessionId, startTime',
    });
  }

  /**
   * Add a new AI interaction
   */
  async addInteraction(interaction: Omit<AIInteraction, 'id'>): Promise<number> {
    return await this.interactions.add(interaction);
  }

  /**
   * Get recent interactions (last N days)
   */
  async getRecentInteractions(days: number = 30): Promise<AIInteraction[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.interactions
      .where('timestamp')
      .above(cutoffDate)
      .reverse()
      .toArray();
  }

  /**
   * Get interactions by type
   */
  async getInteractionsByType(
    type: AIInteraction['type'],
    limit: number = 50
  ): Promise<AIInteraction[]> {
    return await this.interactions
      .where('type')
      .equals(type)
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Get context for AI prompt (relevant history)
   */
  async getContextForPrompt(
    type: AIInteraction['type'],
    limit: number = 10
  ): Promise<string> {
    const interactions = await this.getInteractionsByType(type, limit);
    
    if (interactions.length === 0) {
      return '';
    }

    const context = interactions
      .map((interaction) => {
        const time = new Date(interaction.timestamp).toLocaleString();
        const metadata = interaction.metadata;
        
        let contextStr = `[${time}] User: ${interaction.query}\n`;
        
        if (metadata.vehicleType) {
          contextStr += `Preferred vehicle: ${metadata.vehicleType}\n`;
        }
        if (metadata.timeOfDay) {
          contextStr += `Time: ${metadata.timeOfDay}\n`;
        }
        if (metadata.price) {
          contextStr += `Price: $${metadata.price}\n`;
        }
        
        return contextStr;
      })
      .join('\n');

    return `Previous interactions:\n${context}\n`;
  }

  /**
   * Extract and update user preferences
   */
  async updatePreference(
    key: string,
    value: any,
    context: string
  ): Promise<void> {
    const existing = await this.preferences.where('key').equals(key).first();

    if (existing) {
      await this.preferences.update(existing.id!, {
        value,
        frequency: existing.frequency + 1,
        lastUsed: new Date(),
        context,
      });
    } else {
      await this.preferences.add({
        key,
        value,
        frequency: 1,
        lastUsed: new Date(),
        context,
      });
    }
  }

  /**
   * Get user preferences summary
   */
  async getPreferencesSummary(): Promise<string> {
    const preferences = await this.preferences
      .orderBy('frequency')
      .reverse()
      .limit(10)
      .toArray();

    if (preferences.length === 0) {
      return '';
    }

    const summary = preferences
      .map((pref) => `${pref.key}: ${JSON.stringify(pref.value)} (used ${pref.frequency} times)`)
      .join('\n');

    return `User preferences:\n${summary}\n`;
  }

  /**
   * Analyze patterns and generate insights
   */
  async analyzePatterns(): Promise<{
    mostCommonVehicle?: string;
    averagePrice?: number;
    peakHours?: string[];
    preferredDestinations?: string[];
  }> {
    const interactions = await this.getRecentInteractions(30);
    
    const vehicles: Record<string, number> = {};
    const prices: number[] = [];
    const hours: Record<string, number> = {};
    
    interactions.forEach((interaction) => {
      const { metadata } = interaction;
      
      if (metadata.vehicleType) {
        vehicles[metadata.vehicleType] = (vehicles[metadata.vehicleType] || 0) + 1;
      }
      
      if (metadata.price) {
        prices.push(metadata.price);
      }
      
      if (metadata.timeOfDay) {
        hours[metadata.timeOfDay] = (hours[metadata.timeOfDay] || 0) + 1;
      }
    });

    const mostCommonVehicle = Object.entries(vehicles).sort((a, b) => b[1] - a[1])[0]?.[0];
    const averagePrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : undefined;
    const peakHours = Object.entries(hours)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    return {
      mostCommonVehicle,
      averagePrice,
      peakHours,
    };
  }

  /**
   * Clean up old data (older than 30 days)
   */
  async cleanup(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    await this.interactions
      .where('timestamp')
      .below(cutoffDate)
      .delete();
  }

  /**
   * Start a new AI session
   */
  async startSession(sessionId: string): Promise<number> {
    return await this.sessions.add({
      sessionId,
      startTime: new Date(),
      interactions: 0,
      totalCost: 0,
      models: [],
    });
  }

  /**
   * Update session stats
   */
  async updateSession(
    sessionId: string,
    updates: Partial<AISession>
  ): Promise<void> {
    const session = await this.sessions.where('sessionId').equals(sessionId).first();
    if (session) {
      await this.sessions.update(session.id!, updates);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(days: number = 7): Promise<{
    totalSessions: number;
    totalInteractions: number;
    totalCost: number;
    averageCostPerSession: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await this.sessions
      .where('startTime')
      .above(cutoffDate)
      .toArray();

    const totalSessions = sessions.length;
    const totalInteractions = sessions.reduce((sum, s) => sum + s.interactions, 0);
    const totalCost = sessions.reduce((sum, s) => sum + s.totalCost, 0);
    const averageCostPerSession = totalSessions > 0 ? totalCost / totalSessions : 0;

    return {
      totalSessions,
      totalInteractions,
      totalCost,
      averageCostPerSession,
    };
  }
}

// Export singleton instance
export const aiMemoryDB = new AIMemoryDatabase();

// Initialize cleanup on app start
aiMemoryDB.cleanup().catch(console.error);
