using BrokerScope.Api.Data;
using BrokerScope.Api.Helpers;
using BrokerScope.Api.Services.Connections;
using BrokerScope.Api.Services.Identity;
using BrokerScope.Api.Services.ServiceBus;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
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

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(databaseConnectionString)
        );

        services
            .AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddIdentityCookies();
        services.AddAuthorization();
        services.AddHttpContextAccessor();
        services.AddExceptionHandler<ServiceBusExceptionHandler>();
        services.AddProblemDetails();
        services
            .AddIdentityCore<IdentityUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 10;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.Name = "BrokerScope.Auth";
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.ExpireTimeSpan = TimeSpan.FromHours(8);
            options.SlidingExpiration = true;
            options.Events = new CookieAuthenticationEvents
            {
                OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                },
                OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                },
            };
        });

        services
            .Configure<ServiceBusOptions>(config.GetSection(ServiceBusOptions.SectionName))
            .AddScoped<ICurrentUser, CurrentUser>()
            .AddScoped<IConnectionStore, ConnectionStore>()
            .AddScoped<IServiceBusConnectionProvider, ServiceBusConnectionProvider>()
            .AddSingleton<IMessageBodyFormatter, MessageBodyFormatter>()
            .AddScoped<IServiceBusExplorer, ServiceBusExplorer>();

        return services;
    }
}
