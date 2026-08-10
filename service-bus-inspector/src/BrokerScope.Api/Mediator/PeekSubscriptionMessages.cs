using BrokerScope.Api.Abstractions;
using BrokerScope.Api.Services.ServiceBus;

namespace BrokerScope.Api.Mediator;

public static class PeekSubscriptionMessages
{
    public sealed class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/service-bus/messages/subscription",
                    async (
                        string topicName,
                        string subscriptionName,
                        int? count,
                        bool? deadLetter,
                        int? connectionId,
                        IServiceBusExplorer explorer,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        if (
                            string.IsNullOrWhiteSpace(topicName)
                            || string.IsNullOrWhiteSpace(subscriptionName)
                        )
                        {
                            return Results.BadRequest(
                                new { Error = "topicName and subscriptionName are required." }
                            );
                        }

                        var messages = await explorer.PeekSubscriptionMessagesAsync(
                            topicName,
                            subscriptionName,
                            count ?? 100,
                            deadLetter ?? false,
                            connectionId,
                            cancellationToken
                        );

                        return Results.Ok(messages);
                    }
                )
                .WithTags("Service Bus")
                .WithName("PeekSubscriptionMessages");
        }
    }
}
