using Microsoft.AspNetCore.Routing;

namespace BrokerScope.Api.Abstractions;

public interface IEndpoint
{
    static abstract void MapEndpoint(IEndpointRouteBuilder app);
}
