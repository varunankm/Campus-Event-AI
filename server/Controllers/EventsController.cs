using CampusConnectAPI.Models;
using CampusConnectAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CampusConnectAPI.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly EventService _events;
    private readonly RegistrationService _registrations;

    public EventsController(EventService events, RegistrationService registrations)
    {
        _events = events;
        _registrations = registrations;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var events = await _events.GetAllAsync();
        return Ok(events);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var ev = await _events.GetByIdAsync(id);
        if (ev == null) return NotFound(new { message = "Event not found." });
        var count = await _registrations.CountByEventAsync(id);
        return Ok(new { ev, participantCount = count });
    }

    [HttpGet("faculty/mine")]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> GetMyEvents()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var events = await _events.GetByFacultyAsync(userId);
        return Ok(events);
    }

    [HttpGet("{id}/participants")]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> GetParticipants(string id)
    {
        var regs = await _registrations.GetByEventAsync(id);
        return Ok(regs);
    }

    [HttpPost]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> Create([FromBody] EventRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var ev = new Event
        {
            Title = req.Title,
            Description = req.Description,
            Department = req.Department,
            Category = req.Category,
            Venue = req.Venue,
            Date = req.Date,
            Time = req.Time,
            RegistrationDeadline = req.RegistrationDeadline,
            MaxParticipants = req.MaxParticipants,
            PosterUrl = req.PosterUrl,
            QrCodeUrl = req.QrCodeUrl,
            BudgetEstimate = req.BudgetEstimate,
            ActualExpense = req.ActualExpense,
            FacultyName = req.FacultyName,
            CreatedBy = userId
        };
        var created = await _events.CreateAsync(ev);
        return Ok(created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> Update(string id, [FromBody] EventRequest req)
    {
        var existing = await _events.GetByIdAsync(id);
        if (existing == null) return NotFound(new { message = "Event not found." });

        existing.Title = req.Title;
        existing.Description = req.Description;
        existing.Department = req.Department;
        existing.Category = req.Category;
        existing.Venue = req.Venue;
        existing.Date = req.Date;
        existing.Time = req.Time;
        existing.RegistrationDeadline = req.RegistrationDeadline;
        existing.MaxParticipants = req.MaxParticipants;
        existing.PosterUrl = req.PosterUrl;
        existing.QrCodeUrl = req.QrCodeUrl;
        existing.BudgetEstimate = req.BudgetEstimate;
        existing.ActualExpense = req.ActualExpense;
        existing.FacultyName = req.FacultyName;

        var updated = await _events.UpdateAsync(id, existing);
        if (!updated) return StatusCode(500, new { message = "Update failed." });
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _events.DeleteAsync(id);
        if (!deleted) return NotFound(new { message = "Event not found." });
        return Ok(new { message = "Event deleted." });
    }
}
