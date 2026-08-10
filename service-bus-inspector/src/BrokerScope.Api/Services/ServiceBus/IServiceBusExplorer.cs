using BrokerScope.Api.Models;

namespace BrokerScope.Api.Services.ServiceBus;

public interface IServiceBusExplorer
{
    Task<IReadOnlyList<ServiceBusEntityDto>> GetEntitiesAsync(
        int? connectionId,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyList<MessageDto>> PeekQueueMessagesAsync(
        string queueName,
        int count,
        bool deadLetter,
        int? connectionId,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyList<MessageDto>> PeekSubscriptionMessagesAsync(
        string topicName,
        string subscriptionName,
        int count,
        bool deadLetter,
        int? connectionId,
        CancellationToken cancellationToken
    );
}
