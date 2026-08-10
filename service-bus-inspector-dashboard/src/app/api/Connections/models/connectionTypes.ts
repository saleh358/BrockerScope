export type ServiceBusConnection = {
  id: number;
  name: string;
  connectionString: string;
};

export type SaveServiceBusConnection = Pick<ServiceBusConnection, 'name' | 'connectionString'>;
