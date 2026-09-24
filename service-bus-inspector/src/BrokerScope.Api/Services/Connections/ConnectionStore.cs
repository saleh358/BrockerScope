using BrokerScope.Api.Data;
using BrokerScope.Api.Models;
using BrokerScope.Api.Services.Identity;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Services.Connections;

public sealed class ConnectionStore(
    AppDbContext dbContext,
    ICurrentUser currentUser,
    IConnectionStringProtector connectionStringProtector
)
    : IConnectionStore
{
    public async Task<ConnectionDto> CreateAsync(
        ConnectionDto connection,
        CancellationToken cancellationToken
    )
    {
        var created = new ConnectionDto(
            0,
            connection.Name,
            connectionStringProtector.Protect(connection.ConnectionString)
        )
        {
            UserId = currentUser.UserId,
        };
        dbContext.Connections.Add(created);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Decrypt(created);
    }

    public async Task<IReadOnlyList<ConnectionDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var connections = await dbContext
            .Connections.AsNoTracking()
            .Where(connection => connection.UserId == currentUser.UserId)
            .OrderBy(connection => connection.Id)
            .ToListAsync(cancellationToken);

        return connections.Select(Decrypt).ToList();
    }

    public async Task<ConnectionDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var connection = await dbContext
            .Connections.AsNoTracking()
            .SingleOrDefaultAsync(
                connection => connection.Id == id && connection.UserId == currentUser.UserId,
                cancellationToken
            );

        return connection is null ? null : Decrypt(connection);
    }

    public async Task<ConnectionDto?> UpdateAsync(
        int id,
        ConnectionDto connection,
        CancellationToken cancellationToken
    )
    {
        var existing = await dbContext.Connections.SingleOrDefaultAsync(
            item => item.Id == id && item.UserId == currentUser.UserId,
            cancellationToken
        );

        if (existing is null)
        {
            return null;
        }

        var updated = existing with
        {
            Name = connection.Name,
            ConnectionString = connectionStringProtector.Protect(connection.ConnectionString),
        };
        dbContext.Entry(existing).CurrentValues.SetValues(updated);

        await dbContext.SaveChangesAsync(cancellationToken);
        return Decrypt(updated);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var existing = await dbContext.Connections.SingleOrDefaultAsync(
            item => item.Id == id && item.UserId == currentUser.UserId,
            cancellationToken
        );

        if (existing is null)
        {
            return false;
        }

        dbContext.Connections.Remove(existing);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ConnectionDto?> GetDefaultAsync(CancellationToken cancellationToken)
    {
        var connection = await dbContext
            .Connections.AsNoTracking()
            .Where(connection => connection.UserId == currentUser.UserId)
            .OrderBy(connection => connection.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return connection is null ? null : Decrypt(connection);
    }

    private ConnectionDto Decrypt(ConnectionDto connection) =>
        connection with
        {
            ConnectionString = connectionStringProtector.Unprotect(connection.ConnectionString),
        };
}
