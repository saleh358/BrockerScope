using BrokerScope.Api.Models;

namespace BrokerScope.Api.Services.Connections;

public interface IConnectionStore
{
    Task<ConnectionDto> CreateAsync(ConnectionDto connection, CancellationToken cancellationToken);

    Task<IReadOnlyList<ConnectionDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<ConnectionDto?> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<ConnectionDto?> UpdateAsync(int id, ConnectionDto connection, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);

    Task<ConnectionDto?> GetDefaultAsync(CancellationToken cancellationToken);
}
