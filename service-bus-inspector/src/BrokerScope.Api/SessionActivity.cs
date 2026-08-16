namespace BrokerScope.Api;

public static class SessionActivity
{
    private static long _lastHeartbeatUtcTicks;

    public static DateTimeOffset? LastHeartbeatUtc
    {
        get
        {
            var ticks = Interlocked.Read(ref _lastHeartbeatUtcTicks);
            return ticks == 0 ? null : new DateTimeOffset(ticks, TimeSpan.Zero);
        }
    }

    public static void Touch()
    {
        Interlocked.Exchange(ref _lastHeartbeatUtcTicks, DateTimeOffset.UtcNow.Ticks);
    }
}
