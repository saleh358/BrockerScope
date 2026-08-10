using Azure.Messaging.ServiceBus;
using Azure.Messaging.ServiceBus.Administration;
using BrokerScope.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Services.ServiceBus;

public sealed class ServiceBusConnectionProvider(AppDbContext dbContext) : IServiceBusConnectionProvider
{
    public ServiceBusClient CreateClient(int? connectionId = null)
    {
        var connectionString = GetConnectionString(connectionId);
        return new ServiceBusClient(connectionString);
    }

    public ServiceBusAdministrationClient CreateAdministrationClient(int? connectionId = null)
    {
        var connectionString = GetConnectionString(connectionId);
        return new ServiceBusAdministrationClient(connectionString);
    }

    private string GetConnectionString(int? connectionId)
    {
        var connections = dbContext.Connections.AsNoTracking();
        var connection = connectionId.HasValue
            ? connections.SingleOrDefault(item => item.Id == connectionId.Value)
            : connections.OrderBy(item => item.Id).FirstOrDefault();

        if (connection is null || string.IsNullOrWhiteSpace(connection.ConnectionString))
        {
            throw new InvalidOperationException(
                connectionId.HasValue
                    ? $"Service Bus connection {connectionId.Value} was not found."
                    : "No Service Bus connection found. Create one using POST /api/connections."
            );
        }

        return connection.ConnectionString;
    }
}
