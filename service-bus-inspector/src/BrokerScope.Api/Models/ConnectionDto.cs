using System.Text.Json.Serialization;

namespace BrokerScope.Api.Models;

public sealed record ConnectionDto(int Id, string Name, string ConnectionString)
{
    [JsonIgnore]
    public string? UserId { get; init; }
}
