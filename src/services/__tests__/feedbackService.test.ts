import feedbackService from '../../services/feedbackService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('FeedbackService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const submission = {
        type: 'bug' as const,
        title: 'Test Bug',
        description: 'This is a test bug report',
        email: 'test@example.com',
      };

      const feedback = await feedbackService.submitFeedback(submission);

      expect(feedback.id).toMatch(/^feedback_\d+_[a-z0-9]+$/);
      expect(feedback.type).toBe('bug');
      expect(feedback.title).toBe('Test Bug');
      expect(feedback.description).toBe('This is a test bug report');
      expect(feedback.email).toBe('test@example.com');
      expect(feedback.status).toBe('pending');
      expect(feedback.timestamp).toBeDefined();
    });

    it('should submit feedback without email', async () => {
      const submission = {
        type: 'feature' as const,
        title: 'Test Feature',
        description: 'This is a test feature request',
      };

      const feedback = await feedbackService.submitFeedback(submission);

      expect(feedback.email).toBeUndefined();
      expect(feedback.type).toBe('feature');
    });

    it('should submit feedback with rating', async () => {
      const submission = {
        type: 'improvement' as const,
        title: 'Test Improvement',
        description: 'This is a test improvement suggestion',
        rating: 4,
      };

      const feedback = await feedbackService.submitFeedback(submission);

      expect(feedback.rating).toBe(4);
    });

    it('should generate unique IDs for each submission', async () => {
      const submission1 = {
        type: 'general' as const,
        title: 'Test 1',
        description: 'Description 1',
      };

      const submission2 = {
        type: 'general' as const,
        title: 'Test 2',
        description: 'Description 2',
      };

      const feedback1 = await feedbackService.submitFeedback(submission1);
      const feedback2 = await feedbackService.submitFeedback(submission2);

      expect(feedback1.id).not.toBe(feedback2.id);
    });
  });

  describe('getAllFeedback', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Bug 1',
        description: 'First bug',
      });
      await feedbackService.submitFeedback({
        type: 'feature',
        title: 'Feature 1',
        description: 'First feature',
      });
    });

    it('should return all feedback sorted by timestamp', () => {
      const allFeedback = feedbackService.getAllFeedback();

      expect(allFeedback).toHaveLength(2);
      expect(allFeedback[0].timestamp).toBeGreaterThanOrEqual(allFeedback[1].timestamp);
      expect(allFeedback[0].type).toBe('feature'); // Most recent first
      expect(allFeedback[1].type).toBe('bug');
    });

    it('should return empty array when no feedback exists', () => {
      feedbackService.clearAllFeedback();
      const allFeedback = feedbackService.getAllFeedback();

      expect(allFeedback).toHaveLength(0);
    });
  });

  describe('getFeedbackById', () => {
    it('should return feedback by ID', async () => {
      const submission = {
        type: 'bug' as const,
        title: 'Test Bug',
        description: 'Test description',
      };

      const feedback = await feedbackService.submitFeedback(submission);
      const found = feedbackService.getFeedbackById(feedback.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(feedback.id);
      expect(found?.title).toBe('Test Bug');
    });

    it('should return undefined for non-existent ID', () => {
      const found = feedbackService.getFeedbackById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update feedback status', async () => {
      const submission = {
        type: 'bug' as const,
        title: 'Test Bug',
        description: 'Test description',
      };

      const feedback = await feedbackService.submitFeedback(submission);
      const updated = await feedbackService.updateFeedbackStatus(feedback.id, 'reviewed');

      expect(updated).toBe(true);
      
      const found = feedbackService.getFeedbackById(feedback.id);
      expect(found?.status).toBe('reviewed');
    });

    it('should return false for non-existent feedback', async () => {
      const updated = await feedbackService.updateFeedbackStatus('non-existent-id', 'reviewed');
      expect(updated).toBe(false);
    });
  });

  describe('filterFeedback', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Bug 1',
        description: 'First bug',
        userId: 'user1',
      });
      await feedbackService.submitFeedback({
        type: 'feature',
        title: 'Feature 1',
        description: 'First feature',
        userId: 'user2',
        rating: 5,
      });
      await feedbackService.submitFeedback({
        type: 'improvement',
        title: 'Improvement 1',
        description: 'First improvement',
        userId: 'user1',
        rating: 3,
      });
    });

    it('should filter by type', () => {
      const bugFeedback = feedbackService.filterFeedback({ type: 'bug' });
      expect(bugFeedback).toHaveLength(1);
      expect(bugFeedback[0].type).toBe('bug');
    });

    it('should filter by status', async () => {
      const allFeedback = feedbackService.getAllFeedback();
      await feedbackService.updateFeedbackStatus(allFeedback[0].id, 'reviewed');

      const reviewedFeedback = feedbackService.filterFeedback({ status: 'reviewed' });
      expect(reviewedFeedback).toHaveLength(1);
      expect(reviewedFeedback[0].status).toBe('reviewed');
    });

    it('should filter by user', () => {
      const user1Feedback = feedbackService.filterFeedback({ userId: 'user1' });
      expect(user1Feedback).toHaveLength(2);
      expect(user1Feedback.every(f => f.userId === 'user1')).toBe(true);
    });

    it('should filter by rating', () => {
      const highRatedFeedback = feedbackService.filterFeedback({ rating: 5 });
      expect(highRatedFeedback).toHaveLength(1);
      expect(highRatedFeedback[0].rating).toBe(5);
    });

    it('should filter by multiple criteria', () => {
      const filtered = feedbackService.filterFeedback({
        type: 'bug',
        userId: 'user1',
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('bug');
      expect(filtered[0].userId).toBe('user1');
    });
  });

  describe('getFeedbackStats', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Bug 1',
        description: 'First bug',
        rating: 2,
      });
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Bug 2',
        description: 'Second bug',
        rating: 3,
      });
      await feedbackService.submitFeedback({
        type: 'feature',
        title: 'Feature 1',
        description: 'First feature',
        rating: 5,
      });
    });

    it('should calculate statistics correctly', () => {
      const stats = feedbackService.getFeedbackStats();

      expect(stats.total).toBe(3);
      expect(stats.byType.bug).toBe(2);
      expect(stats.byType.feature).toBe(1);
      expect(stats.byType.improvement).toBe(0);
      expect(stats.byStatus.pending).toBe(3);
      expect(stats.averageRating).toBe((2 + 3 + 5) / 3);
      expect(stats.recentCount).toBe(3); // All are recent
    });

    it('should handle empty feedback list', () => {
      feedbackService.clearAllFeedback();
      const stats = feedbackService.getFeedbackStats();

      expect(stats.total).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.recentCount).toBe(0);
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback by ID', async () => {
      const submission = {
        type: 'bug' as const,
        title: 'Test Bug',
        description: 'Test description',
      };

      const feedback = await feedbackService.submitFeedback(submission);
      const deleted = await feedbackService.deleteFeedback(feedback.id);

      expect(deleted).toBe(true);
      expect(feedbackService.getFeedbackById(feedback.id)).toBeUndefined();
    });

    it('should return false for non-existent feedback', async () => {
      const deleted = await feedbackService.deleteFeedback('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('getUserFeedback', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'User 1 Bug',
        description: 'Bug from user 1',
        userId: 'user1',
      });
      await feedbackService.submitFeedback({
        type: 'feature',
        title: 'User 2 Feature',
        description: 'Feature from user 2',
        userId: 'user2',
      });
    });

    it('should get feedback for specific user', () => {
      const user1Feedback = feedbackService.getUserFeedback('user1');
      expect(user1Feedback).toHaveLength(1);
      expect(user1Feedback[0].userId).toBe('user1');
    });

    it('should return empty array for user with no feedback', () => {
      const user3Feedback = feedbackService.getUserFeedback('user3');
      expect(user3Feedback).toHaveLength(0);
    });
  });

  describe('searchFeedback', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Login Issue',
        description: 'Cannot login to the application',
      });
      await feedbackService.submitFeedback({
        type: 'feature',
        title: 'Dark Mode',
        description: 'Add dark mode support',
      });
      await feedbackService.submitFeedback({
        type: 'general',
        title: 'General Feedback',
        description: 'Great application!',
        email: 'user@example.com',
      });
    });

    it('should search by title', () => {
      const results = feedbackService.searchFeedback('login');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('login');
    });

    it('should search by description', () => {
      const results = feedbackService.searchFeedback('dark');
      expect(results).toHaveLength(1);
      expect(results[0].description).toContain('dark');
    });

    it('should search by email', () => {
      const results = feedbackService.searchFeedback('user@example.com');
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('user@example.com');
    });

    it('should be case insensitive', () => {
      const results = feedbackService.searchFeedback('LOGIN');
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      const results = feedbackService.searchFeedback('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('export/import functionality', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Test Bug',
        description: 'Test description',
      });
    });

    it('should export feedback data', () => {
      const exportedData = feedbackService.exportFeedback();
      const parsed = JSON.parse(exportedData);

      expect(parsed.feedback).toHaveLength(1);
      expect(parsed.total).toBe(1);
      expect(parsed.stats).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should import feedback data', async () => {
      const exportData = {
        feedback: [
          {
            id: 'imported-feedback-1',
            type: 'feature',
            title: 'Imported Feature',
            description: 'Imported description',
            timestamp: Date.now(),
            status: 'pending' as const,
          },
        ],
        total: 1,
        stats: { total: 1, byType: { feature: 1 }, byStatus: { pending: 1 }, averageRating: 0, recentCount: 1 },
      };

      const importedCount = await feedbackService.importFeedback(JSON.stringify(exportData));
      expect(importedCount).toBe(1);

      const allFeedback = feedbackService.getAllFeedback();
      expect(allFeedback).toHaveLength(2); // Original + imported
    });

    it('should not import duplicate feedback', async () => {
      const exportData = {
        feedback: [
          {
            id: 'imported-feedback-1',
            type: 'feature',
            title: 'Imported Feature',
            description: 'Imported description',
            timestamp: Date.now(),
            status: 'pending' as const,
          },
        ],
      };

      await feedbackService.importFeedback(JSON.stringify(exportData));
      const importedCount = await feedbackService.importFeedback(JSON.stringify(exportData));
      expect(importedCount).toBe(0); // No new imports
    });

    it('should handle invalid import data', async () => {
      await expect(feedbackService.importFeedback('invalid json')).rejects.toThrow('Invalid feedback data format');
    });
  });

  describe('generateReport', () => {
    beforeEach(async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Login Bug',
        description: 'Cannot login',
        rating: 2,
      });
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Login Bug',
        description: 'Another login issue',
        rating: 1,
      });
      await feedbackService.submitFeedback({
        type: 'feature',
        title: 'New Feature',
        description: 'Add new feature',
        rating: 5,
      });
    });

    it('should generate comprehensive report', () => {
      const report = feedbackService.generateReport();

      expect(report.summary).toBeDefined();
      expect(report.recentFeedback).toBeDefined();
      expect(report.topIssues).toBeDefined();
      expect(report.recommendations).toBeDefined();

      expect(report.summary.total).toBe(3);
      expect(report.topIssues).toHaveLength(1); // Login bug appears twice
      expect(report.topIssues[0].title).toBe('login bug');
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide relevant recommendations', () => {
      const report = feedbackService.generateReport();
      
      expect(report.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Focus on bug fixes')
        ])
      );
    });
  });

  describe('clearAllFeedback', () => {
    it('should clear all feedback', async () => {
      await feedbackService.submitFeedback({
        type: 'bug',
        title: 'Test Bug',
        description: 'Test description',
      });

      expect(feedbackService.getAllFeedback()).toHaveLength(1);
      
      feedbackService.clearAllFeedback();
      expect(feedbackService.getAllFeedback()).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => feedbackService.submitFeedback({
        type: 'bug',
        title: 'Test',
        description: 'Test',
      })).not.toThrow();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockImplementation(() => 'invalid json');
      
      expect(() => feedbackService.getAllFeedback()).not.toThrow();
    });
  });
});
