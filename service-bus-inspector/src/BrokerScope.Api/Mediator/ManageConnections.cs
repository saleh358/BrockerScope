using BrokerScope.Api.Abstractions;
using BrokerScope.Api.Models;
using BrokerScope.Api.Services.Connections;

namespace BrokerScope.Api.Mediator;

public static class ManageConnections
{
    public sealed class Endpoint : IEndpoint
    {
        public static void MapEndpoint(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/connections").WithTags("Connections");

            group.MapPost(
                    "/",
                    async (
                        ConnectionDto connection,
                        IConnectionStore connectionStore,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        if (
                            string.IsNullOrWhiteSpace(connection.Name)
                            || string.IsNullOrWhiteSpace(connection.ConnectionString)
                        )
                        {
                            return Results.BadRequest(
                                new { Error = "name and connectionString are required." }
                            );
                        }

                        var created = await connectionStore.CreateAsync(connection, cancellationToken);
                        return Results.Created($"/api/connections/{created.Id}", created);
                    }
                )
                .WithName("CreateConnection");

            group.MapGet(
                    "/",
                    async (IConnectionStore connectionStore, CancellationToken cancellationToken) =>
                    {
                        var connections = await connectionStore.GetAllAsync(cancellationToken);
                        return Results.Ok(connections);
                    }
                )
                .WithName("GetConnections");

            group.MapGet(
                    "/{id:int}",
                    async (
                        int id,
                        IConnectionStore connectionStore,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        var connection = await connectionStore.GetByIdAsync(id, cancellationToken);
                        return connection is null ? Results.NotFound() : Results.Ok(connection);
                    }
                )
                .WithName("GetConnectionById");

            group.MapPut(
                    "/{id:int}",
                    async (
                        int id,
                        ConnectionDto connection,
                        IConnectionStore connectionStore,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        if (
                            string.IsNullOrWhiteSpace(connection.Name)
                            || string.IsNullOrWhiteSpace(connection.ConnectionString)
                        )
                        {
                            return Results.BadRequest(
                                new { Error = "name and connectionString are required." }
                            );
                        }

                        var updated = await connectionStore.UpdateAsync(
                            id,
                            connection,
                            cancellationToken
                        );

                        return updated is null ? Results.NotFound() : Results.Ok(updated);
                    }
                )
                .WithName("UpdateConnection");

            group.MapDelete(
                    "/{id:int}",
                    async (
                        int id,
                        IConnectionStore connectionStore,
                        CancellationToken cancellationToken
                    ) =>
                    {
                        var deleted = await connectionStore.DeleteAsync(id, cancellationToken);
                        return deleted ? Results.NoContent() : Results.NotFound();
                    }
                )
                .WithName("DeleteConnection");
        }
    }
}
