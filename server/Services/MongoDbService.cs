using CampusConnectAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Net.Security;
using System.Security.Authentication;
using System.Security.Cryptography.X509Certificates;

namespace CampusConnectAPI.Services;

public class MongoDbService
{
    private readonly IMongoDatabase _database;

    public MongoDbService(IOptions<MongoDbSettings> settings)
    {
        var connectionString = settings.Value.ConnectionString;
        var dbName = settings.Value.DatabaseName;

        var clientSettings = MongoClientSettings.FromConnectionString(connectionString);

        // Allow TLS on all platforms including Linux (Render runs Linux)
        clientSettings.SslSettings = new SslSettings
        {
            EnabledSslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13,
            ServerCertificateValidationCallback =
                (object sender, X509Certificate? cert, X509Chain? chain, SslPolicyErrors errors) => true
        };

        clientSettings.ConnectTimeout = TimeSpan.FromSeconds(30);
        clientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(30);

        var client = new MongoClient(clientSettings);
        _database = client.GetDatabase(dbName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Event> Events => _database.GetCollection<Event>("events");
    public IMongoCollection<Registration> Registrations => _database.GetCollection<Registration>("registrations");
}
