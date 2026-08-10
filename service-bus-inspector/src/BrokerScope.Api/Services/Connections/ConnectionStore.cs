using BrokerScope.Api.Data;
using BrokerScope.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Services.Connections;

public sealed class ConnectionStore(AppDbContext dbContext) : IConnectionStore
{
    public async Task<ConnectionDto> CreateAsync(
        ConnectionDto connection,
        CancellationToken cancellationToken
    )
    {
        var created = new ConnectionDto(0, connection.Name, connection.ConnectionString);
        dbContext.Connections.Add(created);
        await dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<IReadOnlyList<ConnectionDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext
            .Connections.OrderBy(connection => connection.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<ConnectionDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await dbContext
            .Connections.AsNoTracking()
            .SingleOrDefaultAsync(connection => connection.Id == id, cancellationToken);
    }

    public async Task<ConnectionDto?> UpdateAsync(
        int id,
        ConnectionDto connection,
        CancellationToken cancellationToken
    )
    {
        var existing = await dbContext
            .Connections.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (existing is null)
        {
            return null;
        }

        var updated = existing with { Name = connection.Name, ConnectionString = connection.ConnectionString };
        dbContext.Entry(existing).CurrentValues.SetValues(updated);

        await dbContext.SaveChangesAsync(cancellationToken);
        return updated;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var existing = await dbContext
            .Connections.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

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
        return await dbContext
            .Connections.AsNoTracking()
            .OrderBy(connection => connection.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
