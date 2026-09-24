using BrokerScope.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Services.Connections;

public sealed class ConnectionStringEncryptionMigrator(
    AppDbContext dbContext,
    IConnectionStringProtector connectionStringProtector
)
{
    public async Task MigrateAsync(CancellationToken cancellationToken = default)
    {
        var connections = await dbContext.Connections.ToListAsync(cancellationToken);
        var changed = false;

        foreach (var connection in connections)
        {
            if (connectionStringProtector.IsProtected(connection.ConnectionString))
            {
                continue;
            }

            dbContext.Entry(connection).Property(item => item.ConnectionString).CurrentValue =
                connectionStringProtector.Protect(connection.ConnectionString);
            changed = true;
        }

        if (changed)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
