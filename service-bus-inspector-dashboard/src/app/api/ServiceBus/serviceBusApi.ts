import { fetchApiQuery } from '../common/fetchApiQuery';
import { ServiceBusEntity, ServiceBusMessage } from './models/serviceBusTypes';

export function getServiceBusEntities(connectionId?: number) {
  const params = connectionId ? `?connectionId=${connectionId}` : '';
  return fetchApiQuery<ServiceBusEntity[]>(`/api/service-bus/entities${params}`);
}

export function peekQueueMessages(
  queueName: string,
  count: number,
  deadLetter: boolean,
  connectionId?: number
) {
  const params = new URLSearchParams({
    queueName,
    count: String(count),
    deadLetter: String(deadLetter)
  });
  if (connectionId) params.set('connectionId', String(connectionId));

  return fetchApiQuery<ServiceBusMessage[]>(`/api/service-bus/messages/queue?${params}`);
}

export function peekSubscriptionMessages(
  topicName: string,
  subscriptionName: string,
  count: number,
  deadLetter: boolean,
  connectionId?: number
) {
  const params = new URLSearchParams({
    topicName,
    subscriptionName,
    count: String(count),
    deadLetter: String(deadLetter)
  });
  if (connectionId) params.set('connectionId', String(connectionId));

  return fetchApiQuery<ServiceBusMessage[]>(`/api/service-bus/messages/subscription?${params}`);
}
