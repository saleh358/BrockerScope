using Azure.Messaging.ServiceBus;
using Azure.Messaging.ServiceBus.Administration;

namespace BrokerScope.Api.Services.ServiceBus;

public interface IServiceBusConnectionProvider
{
    ServiceBusClient CreateClient(int? connectionId = null);

    ServiceBusAdministrationClient CreateAdministrationClient(int? connectionId = null);
}
