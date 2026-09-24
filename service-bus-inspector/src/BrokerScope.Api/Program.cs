using BrokerScope.Api;
using BrokerScope.Api.Data;
using BrokerScope.Api.Extensions;
using BrokerScope.Api.Services.Connections;
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
                    .AllowCredentials()
        )
    )
    .AddEndpointsApiExplorer()
    .ConfigureApplicationService(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
    var encryptionMigrator = scope.ServiceProvider.GetRequiredService<ConnectionStringEncryptionMigrator>();
    await encryptionMigrator.MigrateAsync();
}

app.UseCors("LocalDashboard");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/ping", () => Results.Ok(new { Now = DateTimeOffset.UtcNow })).WithTags("Health");
app.MapAuthEndpoints();

var authorizedApi = app.MapGroup(string.Empty).RequireAuthorization();

authorizedApi.MapPost("/api/session/heartbeat", () =>
{
    SessionActivity.Touch();
    return Results.Ok(new { Now = SessionActivity.LastHeartbeatUtc });
}).WithTags("Session");
authorizedApi.MapGet("/api/session/status", () => Results.Ok(new { LastHeartbeatUtc = SessionActivity.LastHeartbeatUtc }))
    .WithTags("Session");

authorizedApi.MapFeatureEndpoints();
app.MapFallbackToFile("index.html");

app.Run();
