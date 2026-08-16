using System.Security.Claims;
using BrokerScope.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Extensions;

public static class AuthEndpointExtensions
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapGet(
            "/status",
            async (ClaimsPrincipal principal, UserManager<IdentityUser> userManager) =>
            {
                var authenticated = principal.Identity?.IsAuthenticated == true;
                var setupRequired = !authenticated && !await userManager.Users.AnyAsync();

                return Results.Ok(
                    new AuthStatus(authenticated, principal.Identity?.Name, setupRequired)
                );
            }
        );

        group.MapPost(
            "/register",
            async (
                RegisterRequest request,
                UserManager<IdentityUser> userManager,
                SignInManager<IdentityUser> signInManager,
                AppDbContext dbContext,
                CancellationToken cancellationToken
            ) =>
            {
                if (
                    string.IsNullOrWhiteSpace(request.Email)
                    || string.IsNullOrWhiteSpace(request.Password)
                )
                {
                    return Results.BadRequest(new { Error = "Email and password are required." });
                }

                var isFirstUser = !await userManager.Users.AnyAsync(cancellationToken);
                var email = request.Email.Trim();
                var user = new IdentityUser { Email = email, UserName = email };
                var result = await userManager.CreateAsync(user, request.Password);

                if (!result.Succeeded)
                {
                    return Results.ValidationProblem(
                        result.Errors.ToDictionary(
                            error => error.Code,
                            error => new[] { error.Description }
                        )
                    );
                }

                if (isFirstUser)
                {
                    await dbContext
                        .Connections.Where(connection => connection.UserId == null)
                        .ExecuteUpdateAsync(
                            setters => setters.SetProperty(connection => connection.UserId, user.Id),
                            cancellationToken
                        );
                }

                await signInManager.SignInAsync(user, isPersistent: true);
                return Results.Ok(new AuthStatus(true, user.Email, false));
            }
        );

        group.MapPost(
            "/login",
            async (LoginRequest request, SignInManager<IdentityUser> signInManager) =>
            {
                if (
                    string.IsNullOrWhiteSpace(request.Email)
                    || string.IsNullOrWhiteSpace(request.Password)
                )
                {
                    return Results.BadRequest(new { Error = "Email and password are required." });
                }

                var result = await signInManager.PasswordSignInAsync(
                    request.Email.Trim(),
                    request.Password,
                    request.RememberMe,
                    lockoutOnFailure: true
                );

                if (result.IsLockedOut)
                {
                    return Results.Json(
                        new { Error = "Too many failed attempts. Try again in 15 minutes." },
                        statusCode: StatusCodes.Status423Locked
                    );
                }

                if (!result.Succeeded)
                {
                    return Results.Json(
                        new { Error = "The email or password is incorrect." },
                        statusCode: StatusCodes.Status401Unauthorized
                    );
                }

                return Results.Ok(new AuthStatus(true, request.Email.Trim(), false));
            }
        );

        group.MapPost(
                "/logout",
                async (SignInManager<IdentityUser> signInManager) =>
                {
                    await signInManager.SignOutAsync();
                    return Results.NoContent();
                }
            )
            .RequireAuthorization();

        return app;
    }

    private sealed record RegisterRequest(string Email, string Password);

    private sealed record LoginRequest(string Email, string Password, bool RememberMe);

    private sealed record AuthStatus(bool Authenticated, string? Email, bool SetupRequired);
}
