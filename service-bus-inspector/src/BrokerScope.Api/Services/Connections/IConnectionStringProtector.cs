namespace BrokerScope.Api.Services.Connections;

public interface IConnectionStringProtector
{
    bool IsProtected(string value);

    string Protect(string connectionString);

    string Unprotect(string protectedConnectionString);
}
