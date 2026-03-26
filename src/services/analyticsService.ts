/**
 * Analytics Service
 * Track user interactions, events, and metrics
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  preferences?: Record<string, any>;
  firstVisit?: Date;
  lastVisit?: Date;
  totalSessions?: number;
  totalEvents?: number;
}

export interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  properties?: Record<string, any>;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timestamp: number;
  page: string;
}

export interface UserFeedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating?: number;
  title: string;
  description: string;
  email?: string;
  userId?: string;
  timestamp: number;
  status: 'pending' | 'reviewed' | 'implemented' | 'declined';
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId: string | null = null;
  private userProperties: UserProperties = {};
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('engagement', 'page_hidden', 'user_left_page');
      } else {
        this.trackEvent('engagement', 'page_visible', 'user_returned_page');
      }
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.trackEvent('system', 'connection_restored', 'user_online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.trackEvent('system', 'connection_lost', 'user_offline');
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('engagement', 'session_end', 'user_leaving');
      this.flushEvents();
    });

    // Track errors globally
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript_error', 'uncaught_error', undefined, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'promise_rejection', 'unhandled_promise', undefined, {
        reason: event.reason,
      });
    });
  }

  /**
   * Initialize analytics with user information
   */
  async initialize(userProperties?: Partial<UserProperties>): Promise<void> {
    if (this.isInitialized) return;

    // Load existing user data from localStorage
    const storedUserId = localStorage.getItem('analytics_user_id');
    const storedUserProps = localStorage.getItem('analytics_user_properties');

    if (storedUserId) {
      this.userId = storedUserId;
    } else if (userProperties?.userId) {
      this.userId = userProperties.userId;
      localStorage.setItem('analytics_user_id', this.userId);
    } else {
      this.userId = this.generateUserId();
      localStorage.setItem('analytics_user_id', this.userId);
    }

    if (storedUserProps) {
      try {
        this.userProperties = JSON.parse(storedUserProps);
      } catch (error) {
        console.warn('Failed to parse stored user properties:', error);
      }
    }

    // Update user properties with new data
    if (userProperties) {
      this.userProperties = { ...this.userProperties, ...userProperties };
      this.userProperties.lastVisit = new Date();
      this.userProperties.totalSessions = (this.userProperties.totalSessions || 0) + 1;
      
      if (!this.userProperties.firstVisit) {
        this.userProperties.firstVisit = new Date();
      }
    }

    // Save updated properties
    localStorage.setItem('analytics_user_properties', JSON.stringify(this.userProperties));

    // Start periodic event flushing
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds

    // Track session start
    this.trackEvent('session', 'start', 'new_session', undefined, {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      onlineStatus: this.isOnline,
    });

    this.isInitialized = true;
  }

  /**
   * Track a custom event
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Event queued:', { category, action, label });
      // Queue event for later processing
      this.eventQueue.push({
        event: 'custom',
        category,
        action,
        label,
        value,
        properties,
        timestamp: Date.now(),
        userId: this.userId || undefined,
        sessionId: this.sessionId,
      });
      return;
    }

    const event: AnalyticsEvent = {
      event: 'custom',
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);
    console.log('Analytics event tracked:', event);
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string, properties?: Record<string, any>): void {
    const pageView: PageView = {
      path,
      title,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
      properties,
    };

    this.eventQueue.push({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: path,
      properties: pageView,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    });

    console.log('Page view tracked:', pageView);
  }

  /**
   * Track user interaction with AI features
   */
  trackAIInteraction(
    feature: string,
    action: string,
    success: boolean,
    duration?: number,
    properties?: Record<string, any>
  ): void {
    this.trackEvent('ai_features', feature, action, success ? 1 : 0, {
      success,
      duration,
      feature,
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    const performanceMetrics: PerformanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timestamp: Date.now(),
      page: window.location.pathname,
      ...metrics,
    };

    this.eventQueue.push({
      event: 'performance',
      category: 'performance',
      action: 'metrics',
      properties: performanceMetrics,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    });

    console.log('Performance metrics tracked:', performanceMetrics);
  }

  /**
   * Track user engagement
   */
  trackEngagement(
    type: 'click' | 'scroll' | 'hover' | 'focus' | 'input',
    element: string,
    properties?: Record<string, any>
  ): void {
    this.trackEvent('engagement', type, element, undefined, {
      elementType: element,
      ...properties,
    });
  }

  /**
   * Track errors
   */
  trackError(
    error: Error | string,
    context?: string,
    properties?: Record<string, any>
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.trackEvent('error', 'application_error', context || 'unknown', undefined, {
      message: errorMessage,
      stack: errorStack,
      context,
      ...properties,
    });
  }

  /**
   * Update user properties
   */
  updateUserProperties(properties: Partial<UserProperties>): void {
    this.userProperties = { ...this.userProperties, ...properties };
    localStorage.setItem('analytics_user_properties', JSON.stringify(this.userProperties));

    this.trackEvent('user', 'properties_updated', 'user_profile', undefined, properties);
  }

  /**
   * Get current user properties
   */
  getUserProperties(): UserProperties {
    return { ...this.userProperties };
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Flush events to storage/API
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would send to your analytics backend
      // For now, we'll store in localStorage for demo purposes
      const existingEvents = localStorage.getItem('analytics_events');
      const allEvents = existingEvents ? JSON.parse(existingEvents) : [];
      allEvents.push(...events);
      
      // Keep only last 1000 events to prevent storage overflow
      if (allEvents.length > 1000) {
        allEvents.splice(0, allEvents.length - 1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(allEvents));
      
      console.log(`Flushed ${events.length} analytics events`);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events if flush failed
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Get stored events for analysis
   */
  getStoredEvents(): AnalyticsEvent[] {
    try {
      const events = localStorage.getItem('analytics_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to retrieve stored events:', error);
      return [];
    }
  }

  /**
   * Clear all stored analytics data
   */
  clearStoredData(): void {
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('analytics_user_id');
    localStorage.removeItem('analytics_user_properties');
    this.eventQueue = [];
    this.userId = null;
    this.userProperties = {};
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalEvents: number;
    totalSessions: number;
    averageEventsPerSession: number;
    topCategories: Array<{ category: string; count: number }>;
    recentEvents: AnalyticsEvent[];
  } {
    const events = this.getStoredEvents();
    const categories = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      totalSessions: this.userProperties.totalSessions || 1,
      averageEventsPerSession: events.length / (this.userProperties.totalSessions || 1),
      topCategories,
      recentEvents: events.slice(-10).reverse(),
    };
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}

export default AnalyticsService.getInstance();
