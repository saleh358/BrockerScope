# BrokerScope

BrokerScope is a modern, self-hosted dashboard for exploring Azure Service Bus namespaces, monitoring queues and topics, and safely peeking active or dead-letter messages across multiple connections.

## Features

- Manage multiple Azure Service Bus connection strings from the Settings page.
- Switch between configured namespaces from the dashboard header.
- Browse queues, topics, and subscriptions in a collapsible entity tree.
- View active, scheduled, transferred, and dead-letter message counts.
- Peek active and dead-letter messages without consuming them.
- Search loaded messages by ID, correlation ID, subject, body, or application properties.
- Filter loaded messages by enqueue time.
- Inspect message bodies and metadata in a details drawer.
- Independent scrolling for entity and message lists.
- Persistent light and black themes.

## Technology

- ASP.NET Core 8 minimal APIs
- Entity Framework Core 8 and SQL Server
- Azure.Messaging.ServiceBus
- React 19, TypeScript, Vite, and Material UI

## Repository Structure

```text
service-bus-dashboard-local/
|-- service-bus-inspector/
|   `-- src/
|       |-- BrokerScope.Api/
|       |-- BrokerScope.Api.Tests/
|       `-- BrokerScope.sln
`-- service-bus-inspector-dashboard/
```

## Prerequisites

- .NET 8 SDK
- SQL Server
- Node.js 22.12 or later
- npm 10.9 or later
- An Azure Service Bus connection string with permission to list entities and peek messages

## Backend Setup

Configure the application database in `service-bus-inspector/src/BrokerScope.Api/local.settings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=BrokerScope;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "ServiceBus": {
    "DefaultPeekCount": 100,
    "MaxPeekCount": 500
  }
}
```

Start the API from the repository root:

```powershell
dotnet run --project service-bus-inspector/src/BrokerScope.Api
```

The API runs at `http://localhost:5056`. EF Core migrations are applied automatically during startup.

## Dashboard Setup

Install the frontend dependencies and start Vite:

```powershell
cd service-bus-inspector-dashboard
npm install
npm run dev
```

Open `http://localhost:5173`, navigate to **Settings**, and add one or more Azure Service Bus connections. Return to **Dashboard** and use the connection selector in the top-right corner to choose a namespace.

To use a different API address, create a frontend `.env.local` file:

```dotenv
VITE_API_BASE_URL=http://localhost:5056
```

## API Endpoints

### Connections

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/connections` | List configured connections |
| `GET` | `/api/connections/{id}` | Get one connection |
| `POST` | `/api/connections` | Create a connection |
| `PUT` | `/api/connections/{id}` | Update a connection |
| `DELETE` | `/api/connections/{id}` | Delete a connection |

### Service Bus

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/service-bus/entities?connectionId={id}` | List queues, topics, and subscriptions |
| `GET` | `/api/service-bus/messages/queue` | Peek queue messages |
| `GET` | `/api/service-bus/messages/subscription` | Peek subscription messages |

The message endpoints accept `connectionId`, `count`, and `deadLetter` query parameters in addition to their queue or subscription identifiers.

## Run Tests and Builds

```powershell
dotnet test service-bus-inspector/src/BrokerScope.sln -c Release
cd service-bus-inspector-dashboard
npm run build
```

## Safety and Security

BrokerScope only lists Service Bus entities and peeks messages. It does not expose operations to send, receive, complete, abandon, dead-letter, purge, delete, or resend messages.

Service Bus connection strings are sensitive credentials. The current local setup stores them in the application database and returns them through the connection-management API. Before exposing BrokerScope outside a trusted environment, add authentication and authorization, encrypt stored secrets, restrict CORS, and serve the application over HTTPS.
