export type NotificationType =
  | 'approval'
  | 'rejection'
  | 'announcement'
  | 'system';
export type NotificationStatus = 'read' | 'unread';

export interface NotificationModel {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly status: NotificationStatus;
  readonly createdAt: Date;
  readonly publicationId?: number;
  readonly animalName?: string;
}

export interface NotificationResponse {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly status: NotificationStatus;
  readonly createdAt: string;
  readonly publicationId?: number;
  readonly animalName?: string;
}
