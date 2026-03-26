/**
 * User Feedback Service
 * Handle user feedback collection and management
 */

import { UserFeedback } from './analyticsService';

export interface FeedbackSubmission {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating?: number;
  title: string;
  description: string;
  email?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface FeedbackFilter {
  type?: UserFeedback['type'];
  status?: UserFeedback['status'];
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  rating?: number;
}

export interface FeedbackStats {
  total: number;
  byType: Record<UserFeedback['type'], number>;
  byStatus: Record<UserFeedback['status'], number>;
  averageRating: number;
  recentCount: number;
}

class FeedbackService {
  private static instance: FeedbackService;
  private feedback: UserFeedback[] = [];
  private storageKey = 'user_feedback';

  constructor() {
    this.loadFeedback();
  }

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Load feedback from localStorage
   */
  private loadFeedback(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.feedback = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
      this.feedback = [];
    }
  }

  /**
   * Save feedback to localStorage
   */
  private saveFeedback(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.feedback));
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }

  /**
   * Submit new feedback
   */
  async submitFeedback(submission: FeedbackSubmission): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...submission,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.feedback.push(feedback);
    this.saveFeedback();

    console.log('Feedback submitted:', feedback);

    // In a real implementation, this would send to a backend
    // For demo purposes, we'll simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    return feedback;
  }

  /**
   * Get all feedback
   */
  getAllFeedback(): UserFeedback[] {
    return [...this.feedback].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get feedback by ID
   */
  getFeedbackById(id: string): UserFeedback | undefined {
    return this.feedback.find(f => f.id === id);
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(id: string, status: UserFeedback['status']): Promise<boolean> {
    const feedback = this.getFeedbackById(id);
    if (!feedback) return false;

    feedback.status = status;
    this.saveFeedback();

    console.log(`Feedback ${id} status updated to: ${status}`);
    return true;
  }

  /**
   * Filter feedback
   */
  filterFeedback(filter: FeedbackFilter): UserFeedback[] {
    return this.feedback.filter(item => {
      // Filter by type
      if (filter.type && item.type !== filter.type) return false;

      // Filter by status
      if (filter.status && item.status !== filter.status) return false;

      // Filter by user
      if (filter.userId && item.userId !== filter.userId) return false;

      // Filter by rating
      if (filter.rating !== undefined && item.rating !== filter.rating) return false;

      // Filter by date range
      if (filter.dateRange) {
        const itemDate = new Date(item.timestamp);
        if (itemDate < filter.dateRange.start || itemDate > filter.dateRange.end) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get feedback statistics
   */
  getFeedbackStats(): FeedbackStats {
    const total = this.feedback.length;
    const recentCount = this.feedback.filter(
      f => Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length;

    const byType = this.feedback.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<UserFeedback['type'], number>);

    const byStatus = this.feedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<UserFeedback['status'], number>);

    const ratingsWithValues = this.feedback.filter(f => f.rating !== undefined);
    const averageRating = ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValues.length
      : 0;

    return {
      total,
      byType,
      byStatus,
      averageRating,
      recentCount,
    };
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(id: string): Promise<boolean> {
    const index = this.feedback.findIndex(f => f.id === id);
    if (index === -1) return false;

    this.feedback.splice(index, 1);
    this.saveFeedback();

    console.log(`Feedback ${id} deleted`);
    return true;
  }

  /**
   * Get feedback for a specific user
   */
  getUserFeedback(userId: string): UserFeedback[] {
    return this.feedback.filter(f => f.userId === userId);
  }

  /**
   * Search feedback
   */
  searchFeedback(query: string): UserFeedback[] {
    const lowercaseQuery = query.toLowerCase();
    return this.feedback.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      (item.email && item.email.toLowerCase().includes(lowercaseQuery))
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Export feedback data
   */
  exportFeedback(): string {
    const data = {
      feedback: this.feedback,
      exportedAt: new Date().toISOString(),
      total: this.feedback.length,
      stats: this.getFeedbackStats(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import feedback data
   */
  async importFeedback(data: string): Promise<number> {
    try {
      const parsed = JSON.parse(data);
      const feedbackToImport = parsed.feedback || [];
      
      // Validate and merge feedback
      let importedCount = 0;
      for (const item of feedbackToImport) {
        if (item.id && item.title && item.description) {
          // Check if feedback already exists
          if (!this.feedback.find(f => f.id === item.id)) {
            this.feedback.push(item);
            importedCount++;
          }
        }
      }

      this.saveFeedback();
      console.log(`Imported ${importedCount} feedback items`);
      return importedCount;
    } catch (error) {
      console.error('Failed to import feedback:', error);
      throw new Error('Invalid feedback data format');
    }
  }

  /**
   * Clear all feedback
   */
  clearAllFeedback(): void {
    this.feedback = [];
    this.saveFeedback();
    console.log('All feedback cleared');
  }

  /**
   * Generate feedback report
   */
  generateReport(): {
    summary: FeedbackStats;
    recentFeedback: UserFeedback[];
    topIssues: Array<{ title: string; count: number; type: string }>;
    recommendations: string[];
  } {
    const stats = this.getFeedbackStats();
    const recentFeedback = this.feedback
      .filter(f => Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    // Find common issues
    const issueCounts = this.feedback.reduce((acc, item) => {
      if (item.type === 'bug') {
        const key = item.title.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topIssues = Object.entries(issueCounts)
      .map(([title, count]) => ({ title, count, type: 'bug' }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (stats.averageRating < 3 && stats.total > 10) {
      recommendations.push('Consider improving user experience based on low ratings');
    }
    
    if (stats.byType.bug > stats.byType.feature) {
      recommendations.push('Focus on bug fixes before adding new features');
    }
    
    if (stats.byStatus.pending > stats.total * 0.5) {
      recommendations.push('Review and address pending feedback items');
    }
    
    if (stats.recentCount > stats.total * 0.3) {
      recommendations.push('High recent activity - engage with user community');
    }

    return {
      summary: stats,
      recentFeedback,
      topIssues,
      recommendations,
    };
  }
}

export default FeedbackService.getInstance();
