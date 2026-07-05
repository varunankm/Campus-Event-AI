using CampusConnectAPI.Models;
using MongoDB.Driver;

namespace CampusConnectAPI.Services;

public class EventService
{
    private readonly IMongoCollection<Event> _events;

    public EventService(MongoDbService db)
    {
        _events = db.Events;
    }

    public async Task<List<Event>> GetAllAsync() =>
        await _events.Find(_ => true).SortByDescending(e => e.CreatedAt).ToListAsync();

    public async Task<Event?> GetByIdAsync(string id) =>
        await _events.Find(e => e.Id == id).FirstOrDefaultAsync();

    public async Task<List<Event>> GetByFacultyAsync(string facultyId) =>
        await _events.Find(e => e.CreatedBy == facultyId).SortByDescending(e => e.CreatedAt).ToListAsync();

    public async Task<Event> CreateAsync(Event ev)
    {
        await _events.InsertOneAsync(ev);
        return ev;
    }

    public async Task<bool> UpdateAsync(string id, Event ev)
    {
        var result = await _events.ReplaceOneAsync(e => e.Id == id, ev);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _events.DeleteOneAsync(e => e.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<long> CountAsync() =>
        await _events.CountDocumentsAsync(_ => true);
}
