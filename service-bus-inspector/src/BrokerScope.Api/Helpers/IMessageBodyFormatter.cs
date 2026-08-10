namespace BrokerScope.Api.Helpers;

public interface IMessageBodyFormatter
{
    string Format(BinaryData body, string? contentType);
}
