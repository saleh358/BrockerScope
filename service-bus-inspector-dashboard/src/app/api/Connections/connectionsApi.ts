import { fetchApiQuery } from '../common/fetchApiQuery';
import { SaveServiceBusConnection, ServiceBusConnection } from './models/connectionTypes';

const connectionsPath = '/api/connections';

export function getConnections() {
  return fetchApiQuery<ServiceBusConnection[]>(connectionsPath);
}

export function getConnection(id: number) {
  return fetchApiQuery<ServiceBusConnection>(`${connectionsPath}/${id}`);
}

export function createConnection(connection: SaveServiceBusConnection) {
  return fetchApiQuery<ServiceBusConnection>(connectionsPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 0, ...connection })
  });
}

export function updateConnection(id: number, connection: SaveServiceBusConnection) {
  return fetchApiQuery<ServiceBusConnection>(`${connectionsPath}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...connection })
  });
}

export function deleteConnection(id: number) {
  return fetchApiQuery<void>(`${connectionsPath}/${id}`, { method: 'DELETE' });
}
