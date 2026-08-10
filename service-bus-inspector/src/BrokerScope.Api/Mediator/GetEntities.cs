using BrokerScope.Api.Abstractions;
using BrokerScope.Api.Services.ServiceBus;

namespace BrokerScope.Api.Mediator;

public static class GetEntities
{
    public sealed class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/api/service-bus/entities",
                    async (
                        int? connectionId,
                        IServiceBusExplorer explorer,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        var entities = await explorer.GetEntitiesAsync(
                            connectionId,
                            cancellationToken
                        );
                        return Results.Ok(entities);
                    }
                )
                .WithTags("Service Bus")
                .WithName("GetServiceBusEntities");
        }
    }
}
