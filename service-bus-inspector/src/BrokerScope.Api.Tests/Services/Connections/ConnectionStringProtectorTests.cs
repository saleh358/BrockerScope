using BrokerScope.Api.Services.Connections;
using Microsoft.AspNetCore.DataProtection;

namespace BrokerScope.Api.Tests.Services.Connections;

public sealed class ConnectionStringProtectorTests
{
    private const string ConnectionString =
        "Endpoint=sb://example.servicebus.windows.net/;SharedAccessKeyName=Reader;SharedAccessKey=secret";

    [Fact]
    public void Protect_EncryptsAndUnprotectRestoresValue()
    {
        var sut = CreateProtector();

        var encrypted = sut.Protect(ConnectionString);

        Assert.True(sut.IsProtected(encrypted));
        Assert.DoesNotContain(ConnectionString, encrypted, StringComparison.Ordinal);
        Assert.Equal(ConnectionString, sut.Unprotect(encrypted));
    }

    [Fact]
    public void Protect_DoesNotDoubleEncryptProtectedValue()
    {
        var sut = CreateProtector();
        var encrypted = sut.Protect(ConnectionString);

        Assert.Equal(encrypted, sut.Protect(encrypted));
    }

    [Fact]
    public void Unprotect_AcceptsLegacyPlaintextValue()
    {
        var sut = CreateProtector();

        Assert.Equal(ConnectionString, sut.Unprotect(ConnectionString));
    }

    private static ConnectionStringProtector CreateProtector() =>
        new(DataProtectionProvider.Create(new DirectoryInfo(Path.GetTempPath())));
}
