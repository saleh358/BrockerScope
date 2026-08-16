using Azure.Messaging.ServiceBus;
using Microsoft.AspNetCore.Diagnostics;

namespace BrokerScope.Api.Services.ServiceBus;

public sealed class ServiceBusExceptionHandler(
    ILogger<ServiceBusExceptionHandler> logger
) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        if (exception is not ServiceBusException serviceBusException)
        {
            return false;
        }

        logger.LogError(
            serviceBusException,
            "Azure Service Bus request failed with reason {Reason}",
            serviceBusException.Reason
        );

        httpContext.Response.StatusCode = StatusCodes.Status502BadGateway;
        await Results.Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Azure Service Bus request failed",
                detail: $"{serviceBusException.Reason}: {serviceBusException.Message}"
            )
            .ExecuteAsync(httpContext);

        return true;
    }
}
