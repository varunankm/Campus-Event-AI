using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CampusConnectAPI.Models;

public class Event
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("department")]
    public string Department { get; set; } = string.Empty;

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("venue")]
    public string Venue { get; set; } = string.Empty;

    [BsonElement("date")]
    public DateTime Date { get; set; }

    [BsonElement("time")]
    public string Time { get; set; } = string.Empty;

    [BsonElement("registrationDeadline")]
    public DateTime RegistrationDeadline { get; set; }

    [BsonElement("maxParticipants")]
    public int MaxParticipants { get; set; }

    [BsonElement("posterUrl")]
    public string PosterUrl { get; set; } = string.Empty;

    [BsonElement("qrCodeUrl")]
    public string QrCodeUrl { get; set; } = string.Empty;

    [BsonElement("budgetEstimate")]
    public decimal BudgetEstimate { get; set; } = 0;

    [BsonElement("actualExpense")]
    public decimal ActualExpense { get; set; } = 0;

    [BsonElement("facultyName")]
    public string FacultyName { get; set; } = string.Empty;

    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedBy { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
