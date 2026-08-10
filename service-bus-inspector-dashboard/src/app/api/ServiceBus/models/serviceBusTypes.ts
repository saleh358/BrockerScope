export type ServiceBusEntityType = 'queue' | 'subscription';

export type ServiceBusEntity = {
  entityType: ServiceBusEntityType;
  name: string;
  path: string;
  topicName: string | null;
  subscriptionName: string | null;
  status: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferDeadLetterMessageCount: number;
  sizeInBytes: number;
};

export type ServiceBusMessage = {
  messageId: string | null;
  correlationId: string | null;
  subject: string | null;
  contentType: string | null;
  sequenceNumber: number;
  deliveryCount: number;
  enqueuedTime: string;
  scheduledEnqueueTime: string | null;
  body: string;
  applicationProperties: Record<string, unknown>;
};

export type MessageScope = 'active' | 'deadletter';
