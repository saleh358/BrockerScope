using BrokerScope.Api.Abstractions;
using BrokerScope.Api.Services.ServiceBus;

namespace BrokerScope.Api.Mediator;

public static class PeekQueueMessages
{
    public sealed class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/service-bus/messages/queue",
                    async (
                        string queueName,
                        int? count,
                        bool? deadLetter,
                        int? connectionId,
                        IServiceBusExplorer explorer,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        if (string.IsNullOrWhiteSpace(queueName))
                        {
                            return Results.BadRequest(new { Error = "queueName is required." });
                        }

                        var messages = await explorer.PeekQueueMessagesAsync(
                            queueName,
                            count ?? 100,
                            deadLetter ?? false,
                            connectionId,
                            cancellationToken
                        );

                        return Results.Ok(messages);
                    }
                )
                .WithTags("Service Bus")
                .WithName("PeekQueueMessages");
        }
    }
}
