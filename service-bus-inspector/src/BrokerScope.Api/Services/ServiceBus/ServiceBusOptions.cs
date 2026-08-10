namespace BrokerScope.Api.Services.ServiceBus;

public sealed class ServiceBusOptions
{
    public const string SectionName = "ServiceBus";

    public int DefaultPeekCount { get; init; } = 100;

    public int MaxPeekCount { get; init; } = 500;
}
