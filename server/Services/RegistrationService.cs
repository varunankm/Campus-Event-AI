using CampusConnectAPI.Models;
using MongoDB.Driver;

namespace CampusConnectAPI.Services;

public class RegistrationService
{
    private readonly IMongoCollection<Registration> _registrations;

    public RegistrationService(MongoDbService db)
    {
        _registrations = db.Registrations;
    }

    public async Task<bool> IsRegisteredAsync(string studentId, string eventId) =>
        await _registrations.Find(r => r.StudentId == studentId && r.EventId == eventId).AnyAsync();

    public async Task<Registration> RegisterAsync(string studentId, string eventId)
    {
        var reg = new Registration { StudentId = studentId, EventId = eventId };
        await _registrations.InsertOneAsync(reg);
        return reg;
    }

    public async Task<List<Registration>> GetByStudentAsync(string studentId) =>
        await _registrations.Find(r => r.StudentId == studentId).ToListAsync();

    public async Task<List<Registration>> GetByEventAsync(string eventId) =>
        await _registrations.Find(r => r.EventId == eventId).ToListAsync();

    public async Task<long> CountByEventAsync(string eventId) =>
        await _registrations.CountDocumentsAsync(r => r.EventId == eventId);

    public async Task<long> CountByStudentAsync(string studentId) =>
        await _registrations.CountDocumentsAsync(r => r.StudentId == studentId);
}
