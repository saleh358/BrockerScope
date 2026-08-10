using BrokerScope.Api.Data;
using BrokerScope.Api.Helpers;
using BrokerScope.Api.Services.Connections;
using BrokerScope.Api.Services.ServiceBus;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api;

public static class ServiceConfiguration
{
    public static IServiceCollection ConfigureApplicationService(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        var databaseConnectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is not configured."
            );

        services
            .AddDbContext<AppDbContext>(options => options.UseSqlServer(databaseConnectionString))
            .Configure<ServiceBusOptions>(config.GetSection(ServiceBusOptions.SectionName))
            .AddScoped<IConnectionStore, ConnectionStore>()
            .AddScoped<IServiceBusConnectionProvider, ServiceBusConnectionProvider>()
            .AddSingleton<IMessageBodyFormatter, MessageBodyFormatter>()
            .AddScoped<IServiceBusExplorer, ServiceBusExplorer>();

        return services;
    }
}
