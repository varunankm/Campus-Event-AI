using CampusConnectAPI.Models;
using MongoDB.Driver;

namespace CampusConnectAPI.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(MongoDbService db)
    {
        _users = db.Users;
    }

    public async Task<List<User>> GetAllAsync() =>
        await _users.Find(_ => true).ToListAsync();

    public async Task<User?> GetByIdAsync(string id) =>
        await _users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByEmailAsync(string email) =>
        await _users.Find(u => u.Email == email.ToLower()).FirstOrDefaultAsync();

    public async Task<User> CreateAsync(User user)
    {
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task SeedDefaultUsersAsync()
    {
        try
        {
            var adminExists = await _users.Find(u => u.Role == "admin").AnyAsync();
            if (!adminExists)
            {
                await _users.InsertOneAsync(new User
                {
                    Name = "Admin User",
                    Email = "admin@campusconnect.edu",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "admin",
                    Department = "Administration"
                });
            }

            var facultyExists = await _users.Find(u => u.Role == "faculty").AnyAsync();
            if (!facultyExists)
            {
                await _users.InsertOneAsync(new User
                {
                    Name = "Dr. Sarah Mitchell",
                    Email = "faculty@campusconnect.edu",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Faculty@123"),
                    Role = "faculty",
                    Department = "Computer Science"
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("⚠️  Seed skipped (MongoDB unreachable): " + ex.Message);
        }
    }

    public async Task<List<User>> GetStudentsAsync() =>
        await _users.Find(u => u.Role == "student").ToListAsync();

    public async Task<List<User>> GetFacultyAsync() =>
        await _users.Find(u => u.Role == "faculty").ToListAsync();
}
