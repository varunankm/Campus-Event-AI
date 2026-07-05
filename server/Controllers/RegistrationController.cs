using CampusConnectAPI.Models;
using CampusConnectAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CampusConnectAPI.Controllers;

[ApiController]
[Route("api/register")]
[Authorize]
public class RegistrationController : ControllerBase
{
    private readonly RegistrationService _registrations;
    private readonly EventService _events;

    public RegistrationController(RegistrationService registrations, EventService events)
    {
        _registrations = registrations;
        _events = events;
    }

    [HttpPost]
    [Authorize(Roles = "student")]
    public async Task<IActionResult> Register([FromBody] RegisterEventRequest req)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var ev = await _events.GetByIdAsync(req.EventId);
        if (ev == null) return NotFound(new { message = "Event not found." });

        if (DateTime.UtcNow > ev.RegistrationDeadline)
            return BadRequest(new { message = "Registration deadline has passed." });

        var count = await _registrations.CountByEventAsync(req.EventId);
        if (count >= ev.MaxParticipants)
            return BadRequest(new { message = "Event is fully booked." });

        var alreadyRegistered = await _registrations.IsRegisteredAsync(studentId, req.EventId);
        if (alreadyRegistered)
            return Conflict(new { message = "Already registered for this event." });

        var reg = await _registrations.RegisterAsync(studentId, req.EventId);
        return Ok(reg);
    }

    [HttpGet("studentDashboard")]
    [Authorize(Roles = "student")]
    public async Task<IActionResult> StudentDashboard()
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var myRegs = await _registrations.GetByStudentAsync(studentId);
        var allEvents = await _events.GetAllAsync();

        var registeredEventIds = myRegs.Select(r => r.EventId).ToHashSet();
        var registeredEvents = allEvents.Where(e => registeredEventIds.Contains(e.Id!)).ToList();
        var upcomingEvents = registeredEvents.Where(e => e.Date > DateTime.UtcNow).ToList();
        var totalStudentCount = await _events.CountAsync();

        return Ok(new
        {
            totalEvents = allEvents.Count,
            registeredEvents = myRegs.Count,
            upcomingEvents = upcomingEvents.Count,
            registeredEventDetails = registeredEvents
        });
    }
}
