using System.Text.Json.Serialization;

namespace CampusConnectAPI.Models;

// ── Auth ──────────────────────────────────────────────────────────────────
public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public double Cgpa { get; set; } = 0.0;
    public string Semester { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public List<string> Interests { get; set; } = new();
    public string Achievements { get; set; } = string.Empty;

    [JsonPropertyName("linkedIn")]
    public string LinkedIn { get; set; } = string.Empty;

    [JsonPropertyName("gitHub")]
    public string GitHub { get; set; } = string.Empty;
}
public record LoginRequest(string Email, string Password);

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public double Cgpa { get; set; }
    public string Semester { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public List<string> Interests { get; set; } = new();
    public string Achievements { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string GitHub { get; set; } = string.Empty;
}

// ── Events ────────────────────────────────────────────────────────────────
public record EventRequest(
    string Title,
    string Description,
    string Department,
    string Category,
    string Venue,
    DateTime Date,
    string Time,
    DateTime RegistrationDeadline,
    int MaxParticipants,
    string PosterUrl,
    string QrCodeUrl,
    decimal BudgetEstimate,
    decimal ActualExpense,
    string FacultyName
);

public record RegisterEventRequest(string EventId);

// ── AI ────────────────────────────────────────────────────────────────────
public class AiChatRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Department { get; set; }
    public double Cgpa { get; set; }
    public List<string>? Skills { get; set; }
    public List<string>? Interests { get; set; }
    public List<AiMessage>? History { get; set; }
}

public class AiMessage
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class AiChatResponse
{
    public string Message { get; set; } = string.Empty;
    public bool Registered { get; set; } = false;
    public string? RegisteredEventTitle { get; set; }
}

public class FacultyAnalyticsRequest
{
    public string? Question { get; set; }
}

public class FacultyChatRequest
{
    public string Message { get; set; } = string.Empty;
    public List<AiMessage>? History { get; set; }
}

// Internal stat helper — not serialized
public class EventStat
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public int Participants { get; set; }
    public int MaxParticipants { get; set; }
    public double FillRate { get; set; }
    public decimal BudgetEstimate { get; set; }
    public decimal ActualExpense { get; set; }
    public decimal Surplus { get; set; }
    public string Status { get; set; } = string.Empty;
}
