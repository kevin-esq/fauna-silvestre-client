export interface ErrorContext {
  operation: string;
  params?: Record<string, unknown>;
  userId?: string;
  timestamp?: number;
}
