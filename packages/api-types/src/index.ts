export type { Polygon, Job, DetectionStatus } from '../../apps/web/src/lib/types';

export interface StorageService {
  upload(key: string, data: Buffer): Promise<string>;
  download(key: string): Promise<Buffer>;
  presignUrl(key: string, expiresIn?: number): Promise<string>;
}
export interface JobQueue {
  enqueue(queue: string, payload: Record<string, unknown>): Promise<string>;
}
export interface OcrProvider {
  extract(imageUrl: string): Promise<{ text: string; bboxes: unknown[] }>;
}
export interface BillingService {
  getSubscription(orgId: string): Promise<{ plan: string; active: boolean }>;
}
export interface LLMProvider {
  chat(messages: { role: string; content: string }[]): Promise<string>;
}
