using CampusConnectAPI.Models;
using CampusConnectAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CampusConnectAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserService _users;
    private readonly JwtService _jwt;

    public AuthController(UserService users, IConfiguration config)
    {
        _users = users;
        _jwt = new JwtService(config);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (req == null)
            return BadRequest(new { message = "Request body is missing." });

        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Name is required." });

        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email is required." });

        if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        if (string.IsNullOrWhiteSpace(req.Department))
            return BadRequest(new { message = "Department is required." });

        try
        {
            var existing = await _users.GetByEmailAsync(req.Email);
            if (existing != null)
                return Conflict(new { message = "An account with this email already exists." });

            var user = new User
            {
                Name = req.Name.Trim(),
                Email = req.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "student",
                Department = req.Department,
                Cgpa = req.Cgpa,
                Semester = req.Semester ?? string.Empty,
                RollNumber = req.RollNumber ?? string.Empty,
                Skills = req.Skills ?? new List<string>(),
                Interests = req.Interests ?? new List<string>(),
                Achievements = req.Achievements ?? string.Empty,
                LinkedIn = req.LinkedIn ?? string.Empty,
                GitHub = req.GitHub ?? string.Empty,
            };

            await _users.CreateAsync(user);
            var token = _jwt.GenerateToken(user);
            return Ok(BuildAuthResponse(user, token));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Register Error] {ex.GetType().Name}: {ex.Message}");
            if (ex.Message.Contains("timed out") || ex.Message.Contains("timeout") || ex.Message.Contains("Unable to connect"))
                return StatusCode(503, new { message = "Database is temporarily unavailable. Please check your MongoDB Atlas connection and IP whitelist, then try again." });
            return StatusCode(500, new { message = "Registration failed due to a server error. Please try again." });
        }
    }

    [HttpPost("register-faculty")]
    public async Task<IActionResult> RegisterFaculty([FromBody] RegisterRequest req)
    {
        if (req == null)
            return BadRequest(new { message = "Request body is missing." });

        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Name is required." });

        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email is required." });

        if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        if (string.IsNullOrWhiteSpace(req.Department))
            return BadRequest(new { message = "Department is required." });

        try
        {
            var existing = await _users.GetByEmailAsync(req.Email);
            if (existing != null)
                return Conflict(new { message = "An account with this email already exists." });

            var user = new User
            {
                Name = req.Name.Trim(),
                Email = req.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "faculty",
                Department = req.Department,
                Cgpa = req.Cgpa,
                Semester = req.Semester ?? string.Empty,
                RollNumber = req.RollNumber ?? string.Empty,
                Skills = req.Skills ?? new List<string>(),
                Interests = req.Interests ?? new List<string>(),
                Achievements = req.Achievements ?? string.Empty,
                LinkedIn = req.LinkedIn ?? string.Empty,
                GitHub = req.GitHub ?? string.Empty,
            };

            await _users.CreateAsync(user);
            var token = _jwt.GenerateToken(user);
            return Ok(BuildAuthResponse(user, token));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RegisterFaculty Error] {ex.GetType().Name}: {ex.Message}");
            if (ex.Message.Contains("timed out") || ex.Message.Contains("timeout"))
                return StatusCode(503, new { message = "Database unavailable. Check MongoDB Atlas IP whitelist." });
            return StatusCode(500, new { message = "Registration failed. Please try again." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email and password are required." });

        try
        {
            var user = await _users.GetByEmailAsync(req.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = _jwt.GenerateToken(user);
            return Ok(BuildAuthResponse(user, token));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Login Error] {ex.GetType().Name}: {ex.Message}");
            if (ex.Message.Contains("timed out") || ex.Message.Contains("timeout") || ex.Message.Contains("Unable to connect"))
                return StatusCode(503, new { message = "Database is temporarily unavailable. Please check your MongoDB Atlas IP whitelist." });
            return StatusCode(500, new { message = "Login failed. Please try again." });
        }
    }

    private static AuthResponse BuildAuthResponse(User user, string token) => new()
    {
        Token = token,
        Id = user.Id!,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        Department = user.Department,
        Cgpa = user.Cgpa,
        Semester = user.Semester,
        RollNumber = user.RollNumber,
        Skills = user.Skills,
        Interests = user.Interests,
        Achievements = user.Achievements,
        LinkedIn = user.LinkedIn,
        GitHub = user.GitHub,
    };
}
