import analyticsService from '../../services/analyticsService';

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

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    userAgent: 'Test User Agent',
    language: 'en-US',
  },
});

// Mock screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
});

// Mock document
Object.defineProperty(document, 'referrer', {
  value: 'http://localhost:3000',
});

describe('AnalyticsService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with user properties', async () => {
      const userProps = {
        userId: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
      };

      await analyticsService.initialize(userProps);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'analytics_user_id',
        'test-user'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'analytics_user_properties',
        expect.stringContaining('test-user')
      );
    });

    it('should generate user ID if not provided', async () => {
      await analyticsService.initialize();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'analytics_user_id',
        expect.stringMatching(/^user_\d+_[a-z0-9]+$/)
      );
    });

    it('should load existing user properties', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'analytics_user_id') return 'existing-user';
        if (key === 'analytics_user_properties') return JSON.stringify({
          userId: 'existing-user',
          name: 'Existing User',
        });
        return null;
      });

      await analyticsService.initialize();

      const props = analyticsService.getUserProperties();
      expect(props.userId).toBe('existing-user');
      expect(props.name).toBe('Existing User');
    });
  });

  describe('event tracking', () => {
    beforeEach(async () => {
      await analyticsService.initialize();
    });

    it('should track custom events', () => {
      analyticsService.trackEvent('test_category', 'test_action', 'test_label', 42, {
        customProperty: 'test_value',
      });

      const events = analyticsService.getStoredEvents();
      expect(events).toHaveLength(2); // Session start + custom event
      
      const customEvent = events.find(e => e.action === 'test_action');
      expect(customEvent).toBeDefined();
      expect(customEvent?.category).toBe('test_category');
      expect(customEvent?.label).toBe('test_label');
      expect(customEvent?.value).toBe(42);
      expect(customEvent?.properties?.customProperty).toBe('test_value');
    });

    it('should track page views', () => {
      analyticsService.trackPageView('/test-path', 'Test Page');

      const events = analyticsService.getStoredEvents();
      const pageViewEvent = events.find(e => e.event === 'page_view');
      
      expect(pageViewEvent).toBeDefined();
      expect(pageViewEvent?.label).toBe('/test-path');
      expect(pageViewEvent?.properties?.path).toBe('/test-path');
      expect(pageViewEvent?.properties?.title).toBe('Test Page');
    });

    it('should track AI interactions', () => {
      analyticsService.trackAIInteraction('chatbot', 'send_message', true, 1500);

      const events = analyticsService.getStoredEvents();
      const aiEvent = events.find(e => e.category === 'ai_features');
      
      expect(aiEvent).toBeDefined();
      expect(aiEvent?.action).toBe('chatbot');
      expect(aiEvent?.properties?.success).toBe(true);
      expect(aiEvent?.properties?.duration).toBe(1500);
    });

    it('should track performance metrics', () => {
      analyticsService.trackPerformanceMetrics({
        pageLoadTime: 2000,
        firstContentfulPaint: 800,
        largestContentfulPaint: 1200,
      });

      const events = analyticsService.getStoredEvents();
      const perfEvent = events.find(e => e.event === 'performance');
      
      expect(perfEvent).toBeDefined();
      expect(perfEvent?.properties?.pageLoadTime).toBe(2000);
      expect(perfEvent?.properties?.firstContentfulPaint).toBe(800);
    });

    it('should track engagement events', () => {
      analyticsService.trackEngagement('click', 'button', {
        buttonId: 'test-button',
      });

      const events = analyticsService.getStoredEvents();
      const engagementEvent = events.find(e => e.category === 'engagement');
      
      expect(engagementEvent).toBeDefined();
      expect(engagementEvent?.action).toBe('click');
      expect(engagementEvent?.label).toBe('button');
      expect(engagementEvent?.properties?.elementType).toBe('button');
    });

    it('should track errors', () => {
      const error = new Error('Test error');
      analyticsService.trackError(error, 'test_context', {
        additionalInfo: 'test',
      });

      const events = analyticsService.getStoredEvents();
      const errorEvent = events.find(e => e.category === 'error');
      
      expect(errorEvent).toBeDefined();
      expect(errorEvent?.action).toBe('application_error');
      expect(errorEvent?.label).toBe('test_context');
      expect(errorEvent?.properties?.message).toBe('Test error');
      expect(errorEvent?.properties?.context).toBe('test_context');
    });
  });

  describe('user properties', () => {
    beforeEach(async () => {
      await analyticsService.initialize({ userId: 'test-user' });
    });

    it('should update user properties', () => {
      analyticsService.updateUserProperties({
        email: 'updated@example.com',
        role: 'admin',
      });

      const props = analyticsService.getUserProperties();
      expect(props.email).toBe('updated@example.com');
      expect(props.role).toBe('admin');
    });

    it('should get user properties', () => {
      const props = analyticsService.getUserProperties();
      expect(props).toHaveProperty('userId');
      expect(props).toHaveProperty('totalSessions');
      expect(props).toHaveProperty('lastVisit');
    });
  });

  describe('analytics summary', () => {
    beforeEach(async () => {
      await analyticsService.initialize();
      
      // Add some test events
      analyticsService.trackEvent('category1', 'action1');
      analyticsService.trackEvent('category1', 'action2');
      analyticsService.trackEvent('category2', 'action1');
      analyticsService.trackEvent('category3', 'action1');
    });

    it('should generate analytics summary', () => {
      const summary = analyticsService.getAnalyticsSummary();
      
      expect(summary.totalEvents).toBeGreaterThan(0);
      expect(summary.totalSessions).toBeGreaterThan(0);
      expect(summary.averageEventsPerSession).toBeGreaterThan(0);
      expect(summary.topCategories).toHaveLength(3);
      expect(summary.recentEvents).toHaveLength(4);
    });

    it('should calculate top categories correctly', () => {
      const summary = analyticsService.getAnalyticsSummary();
      
      const category1Count = summary.topCategories.find(c => c.category === 'category1')?.count || 0;
      const category2Count = summary.topCategories.find(c => c.category === 'category2')?.count || 0;
      
      expect(category1Count).toBe(2);
      expect(category2Count).toBe(1);
    });
  });

  describe('data management', () => {
    beforeEach(async () => {
      await analyticsService.initialize();
      analyticsService.trackEvent('test', 'event');
    });

    it('should clear stored data', () => {
      analyticsService.clearStoredData();
      
      const events = analyticsService.getStoredEvents();
      expect(events).toHaveLength(0);
      
      const props = analyticsService.getUserProperties();
      expect(props.userId).toBeUndefined();
    });

    it('should get session ID', () => {
      const sessionId = analyticsService.getSessionId();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('event queueing', () => {
    it('should queue events before initialization', () => {
      analyticsService.trackEvent('test', 'event', 'label');
      
      // Should not throw error
      expect(() => analyticsService.trackEvent('test', 'event')).not.toThrow();
    });

    it('should process queued events after initialization', async () => {
      analyticsService.trackEvent('test', 'event', 'label');
      
      await analyticsService.initialize();
      
      const events = analyticsService.getStoredEvents();
      expect(events.length).toBeGreaterThan(1); // Session start + queued event
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw error
      await expect(analyticsService.initialize()).resolves.toBeUndefined();
    });

    it('should handle invalid JSON in localStorage', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'analytics_user_properties') return 'invalid json';
        return null;
      });

      // Should not throw error
      await expect(analyticsService.initialize()).resolves.toBeUndefined();
    });
  });
});
