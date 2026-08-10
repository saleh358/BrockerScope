namespace BrokerScope.Api.Models;

public sealed record ServiceBusEntityDto(
    string EntityType,
    string Name,
    string Path,
    string? TopicName,
    string? SubscriptionName,
    string Status,
    long ActiveMessageCount,
    long DeadLetterMessageCount,
    long ScheduledMessageCount,
    long TransferDeadLetterMessageCount,
    long SizeInBytes
);
