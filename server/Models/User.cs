using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CampusConnectAPI.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = "student";

    [BsonElement("department")]
    public string Department { get; set; } = string.Empty;

    // Academic profile fields
    [BsonElement("cgpa")]
    public double Cgpa { get; set; } = 0.0;

    [BsonElement("semester")]
    public string Semester { get; set; } = string.Empty;

    [BsonElement("rollNumber")]
    public string RollNumber { get; set; } = string.Empty;

    [BsonElement("skills")]
    public List<string> Skills { get; set; } = new();

    [BsonElement("interests")]
    public List<string> Interests { get; set; } = new();

    [BsonElement("achievements")]
    public string Achievements { get; set; } = string.Empty;

    [BsonElement("linkedIn")]
    public string LinkedIn { get; set; } = string.Empty;

    [BsonElement("github")]
    public string GitHub { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
