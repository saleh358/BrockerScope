using BrokerScope.Api;
using BrokerScope.Api.Data;
using BrokerScope.Api.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var localConfig = new ConfigurationBuilder()
    .AddJsonFile("local.settings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();

builder.Configuration.AddConfiguration(localConfig);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder
    .Services.AddCors(options =>
        options.AddPolicy(
            "LocalDashboard",
            policy =>
                policy
                    .SetIsOriginAllowed(origin =>
                    {
                        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                        {
                            return false;
                        }

                        return uri.Scheme == Uri.UriSchemeHttp
                            && (uri.Host == "localhost" || uri.Host == "127.0.0.1");
                    })
                    .AllowAnyHeader()
                    .AllowAnyMethod()
        )
    )
    .AddEndpointsApiExplorer()
    .ConfigureApplicationService(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.UseCors("LocalDashboard");

app.MapGet("/", () => Results.Ok(new { Now = DateTimeOffset.UtcNow })).WithTags("Health");
app.MapGet("/api/ping", () => Results.Ok(new { Now = DateTimeOffset.UtcNow })).WithTags("Health");

app.MapFeatureEndpoints();

app.Run();
