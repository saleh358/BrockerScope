using System.Text.Json;

namespace BrokerScope.Api.Helpers;

public sealed class MessageBodyFormatter : IMessageBodyFormatter
{
    public string Format(BinaryData body, string? contentType)
    {
        var raw = body.ToString();

        if (
            !string.IsNullOrWhiteSpace(contentType)
            && contentType.Contains("json", StringComparison.OrdinalIgnoreCase)
            && TryFormatJson(raw, out var formattedJson)
        )
        {
            return formattedJson;
        }

        return raw;
    }

    private static bool TryFormatJson(string raw, out string formattedJson)
    {
        try
        {
            var parsed = JsonSerializer.Deserialize<JsonElement>(raw);
            formattedJson = JsonSerializer.Serialize(
                parsed,
                new JsonSerializerOptions { WriteIndented = true }
            );
            return true;
        }
        catch (JsonException)
        {
            formattedJson = raw;
            return false;
        }
    }
}
