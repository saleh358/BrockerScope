using Azure.Messaging.ServiceBus;
using Azure.Messaging.ServiceBus.Administration;
using BrokerScope.Api.Helpers;
using BrokerScope.Api.Models;
using Microsoft.Extensions.Options;

namespace BrokerScope.Api.Services.ServiceBus;

public sealed class ServiceBusExplorer(
    IServiceBusConnectionProvider connectionProvider,
    IMessageBodyFormatter bodyFormatter,
    IOptions<ServiceBusOptions> options
) : IServiceBusExplorer
{
    private readonly ServiceBusOptions _options = options.Value;

    public async Task<IReadOnlyList<ServiceBusEntityDto>> GetEntitiesAsync(
        int? connectionId,
        CancellationToken cancellationToken
    )
    {
        var admin = connectionProvider.CreateAdministrationClient(connectionId);
        var entities = new List<ServiceBusEntityDto>();

        await foreach (var queue in admin.GetQueuesAsync(cancellationToken))
        {
            var runtime = await admin.GetQueueRuntimePropertiesAsync(queue.Name, cancellationToken);
            entities.Add(
                new ServiceBusEntityDto(
                    "queue",
                    queue.Name,
                    queue.Name,
                    null,
                    null,
                    queue.Status.ToString(),
                    runtime.Value.ActiveMessageCount,
                    runtime.Value.DeadLetterMessageCount,
                    runtime.Value.ScheduledMessageCount,
                    runtime.Value.TransferDeadLetterMessageCount,
                    runtime.Value.SizeInBytes
                )
            );
        }

        await foreach (var topic in admin.GetTopicsAsync(cancellationToken))
        {
            await foreach (
                var subscription in admin.GetSubscriptionsAsync(topic.Name, cancellationToken)
            )
            {
                var runtime = await admin.GetSubscriptionRuntimePropertiesAsync(
                    topic.Name,
                    subscription.SubscriptionName,
                    cancellationToken
                );

                entities.Add(
                    new ServiceBusEntityDto(
                        "subscription",
                        subscription.SubscriptionName,
                        $"{topic.Name}/Subscriptions/{subscription.SubscriptionName}",
                        topic.Name,
                        subscription.SubscriptionName,
                        subscription.Status.ToString(),
                        runtime.Value.ActiveMessageCount,
                        runtime.Value.DeadLetterMessageCount,
                        0,
                        runtime.Value.TransferDeadLetterMessageCount,
                        0
                    )
                );
            }
        }

        return entities.OrderBy(entity => entity.EntityType).ThenBy(entity => entity.Path).ToList();
    }

    public async Task<IReadOnlyList<MessageDto>> PeekQueueMessagesAsync(
        string queueName,
        int count,
        bool deadLetter,
        int? connectionId,
        CancellationToken cancellationToken
    )
    {
        await using var client = connectionProvider.CreateClient(connectionId);
        await using var receiver = client.CreateReceiver(
            queueName,
            new ServiceBusReceiverOptions
            {
                SubQueue = deadLetter ? SubQueue.DeadLetter : SubQueue.None,
            }
        );

        return await PeekMessagesAsync(receiver, count, cancellationToken);
    }

    public async Task<IReadOnlyList<MessageDto>> PeekSubscriptionMessagesAsync(
        string topicName,
        string subscriptionName,
        int count,
        bool deadLetter,
        int? connectionId,
        CancellationToken cancellationToken
    )
    {
        await using var client = connectionProvider.CreateClient(connectionId);
        await using var receiver = client.CreateReceiver(
            topicName,
            subscriptionName,
            new ServiceBusReceiverOptions
            {
                SubQueue = deadLetter ? SubQueue.DeadLetter : SubQueue.None,
            }
        );

        return await PeekMessagesAsync(receiver, count, cancellationToken);
    }

    private async Task<IReadOnlyList<MessageDto>> PeekMessagesAsync(
        ServiceBusReceiver receiver,
        int requestedCount,
        CancellationToken cancellationToken
    )
    {
        var count = Math.Clamp(requestedCount, 1, Math.Max(1, _options.MaxPeekCount));
        var messages = new List<ServiceBusReceivedMessage>();
        long? nextSequenceNumber = null;

        while (messages.Count < count)
        {
            var remainingCount = count - messages.Count;
            var batch = await receiver.PeekMessagesAsync(
                remainingCount,
                nextSequenceNumber,
                cancellationToken
            );

            if (batch.Count == 0)
            {
                break;
            }

            messages.AddRange(batch);

            var next = batch[^1].SequenceNumber + 1;
            if (nextSequenceNumber == next)
            {
                break;
            }

            nextSequenceNumber = next;
        }

        return messages.Select(MapMessage).ToList();
    }

    private MessageDto MapMessage(ServiceBusReceivedMessage message)
    {
        return new MessageDto(
            message.MessageId,
            message.CorrelationId,
            message.Subject,
            message.ContentType,
            message.SequenceNumber,
            message.DeliveryCount,
            message.EnqueuedTime,
            message.ScheduledEnqueueTime == DateTimeOffset.MinValue
                ? null
                : message.ScheduledEnqueueTime,
            bodyFormatter.Format(message.Body, message.ContentType),
            message.ApplicationProperties.ToDictionary(pair => pair.Key, pair => (object?)pair.Value)
        );
    }
}
