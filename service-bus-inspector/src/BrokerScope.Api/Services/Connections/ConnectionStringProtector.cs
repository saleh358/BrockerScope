using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;

namespace BrokerScope.Api.Services.Connections;

public sealed class ConnectionStringProtector(IDataProtectionProvider dataProtectionProvider)
    : IConnectionStringProtector
{
    private const string Prefix = "dp:v1:";
    private const string Purpose = "BrokerScope.ServiceBusConnectionString.v1";

    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector(Purpose);

    public bool IsProtected(string value) => value.StartsWith(Prefix, StringComparison.Ordinal);

    public string Protect(string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        return IsProtected(connectionString)
            ? connectionString
            : Prefix + _protector.Protect(connectionString);
    }

    public string Unprotect(string protectedConnectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(protectedConnectionString);

        // Plaintext values are accepted temporarily so databases created by older
        // versions can be upgraded during application startup.
        if (!IsProtected(protectedConnectionString))
        {
            return protectedConnectionString;
        }

        try
        {
            return _protector.Unprotect(protectedConnectionString[Prefix.Length..]);
        }
        catch (CryptographicException exception)
        {
            throw new InvalidOperationException(
                "A stored Service Bus connection string could not be decrypted. "
                    + "Verify that the application's Data Protection keys are available.",
                exception
            );
        }
    }
}
