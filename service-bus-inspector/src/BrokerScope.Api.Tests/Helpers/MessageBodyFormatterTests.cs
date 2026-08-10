using BrokerScope.Api.Helpers;

namespace BrokerScope.Api.Tests.Helpers;

public sealed class MessageBodyFormatterTests
{
    [Fact]
    public void Format_PrettyPrintsJsonBodies()
    {
        var formatter = new MessageBodyFormatter();

        var result = formatter.Format(BinaryData.FromString("""{"orderId":"ORD-1"}"""), "application/json");

        Assert.Contains(Environment.NewLine, result);
        Assert.Contains("\"orderId\": \"ORD-1\"", result);
    }

    [Fact]
    public void Format_ReturnsRawBodyWhenContentTypeIsNotJson()
    {
        var formatter = new MessageBodyFormatter();

        var result = formatter.Format(BinaryData.FromString("plain text"), "text/plain");

        Assert.Equal("plain text", result);
    }

    [Fact]
    public void Format_ReturnsRawBodyWhenJsonIsInvalid()
    {
        var formatter = new MessageBodyFormatter();

        var result = formatter.Format(BinaryData.FromString("{invalid"), "application/json");

        Assert.Equal("{invalid", result);
    }
}
