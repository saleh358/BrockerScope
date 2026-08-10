namespace BrokerScope.Api.Models;

public sealed record MessageDto(
    string? MessageId,
    string? CorrelationId,
    string? Subject,
    string? ContentType,
    long SequenceNumber,
    int DeliveryCount,
    DateTimeOffset EnqueuedTime,
    DateTimeOffset? ScheduledEnqueueTime,
    string Body,
    IReadOnlyDictionary<string, object?> ApplicationProperties
);
