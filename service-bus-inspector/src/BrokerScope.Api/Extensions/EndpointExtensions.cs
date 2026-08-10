using System.Reflection;
using BrokerScope.Api.Abstractions;

namespace BrokerScope.Api.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var endpointTypes = Assembly
            .GetExecutingAssembly()
            .GetTypes()
            .Where(type =>
                !type.IsAbstract
                && !type.IsInterface
                && type.GetInterfaces().Contains(typeof(IEndpoint))
            );

        foreach (var endpointType in endpointTypes)
        {
            endpointType.GetMethod(
                nameof(IEndpoint.MapEndpoint),
                BindingFlags.Public | BindingFlags.Static
            )?.Invoke(null, [app]);
        }

        return app;
    }
}
