using CampusConnectAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;
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

        try
        {
            var clientSettings = MongoClientSettings.FromConnectionString(connectionString);

            // Windows TLS fix: override SSL validation and force TLS 1.2
            clientSettings.SslSettings = new SslSettings
            {
                EnabledSslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13,
                ServerCertificateValidationCallback = AcceptAllCertificates
            };

            // Use short timeouts so failures are fast
            clientSettings.ConnectTimeout = TimeSpan.FromSeconds(20);
            clientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(20);

            // Disable TLS on the URL level if present, let SslSettings handle it
            clientSettings.UseTls = true;
            clientSettings.AllowInsecureTls = true; // bypass Windows SCHANNEL LSA issue

            var client = new MongoClient(clientSettings);
            _database = client.GetDatabase(dbName);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[MongoDB] Setup error: {ex.Message}");
            // Still create a client so the app starts — requests will fail gracefully
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(dbName);
        }
    }

    private static bool AcceptAllCertificates(
        object sender,
        X509Certificate? certificate,
        X509Chain? chain,
        SslPolicyErrors errors) => true;

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Event> Events => _database.GetCollection<Event>("events");
    public IMongoCollection<Registration> Registrations => _database.GetCollection<Registration>("registrations");
}
