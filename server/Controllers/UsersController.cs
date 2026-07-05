using CampusConnectAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CampusConnectAPI.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "admin")]
public class UsersController : ControllerBase
{
    private readonly UserService _users;

    public UsersController(UserService users)
    {
        _users = users;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetStudents()
    {
        var students = await _users.GetStudentsAsync();
        var result = students.Select(s => new
        {
            s.Id, s.Name, s.Email, s.Department, s.CreatedAt
        });
        return Ok(result);
    }

    [HttpGet("faculty")]
    public async Task<IActionResult> GetFaculty()
    {
        var faculty = await _users.GetFacultyAsync();
        var result = faculty.Select(f => new
        {
            f.Id, f.Name, f.Email, f.Department, f.CreatedAt
        });
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _users.GetAllAsync();
        var result = users.Select(u => new
        {
            u.Id, u.Name, u.Email, u.Role, u.Department, u.CreatedAt
        });
        return Ok(result);
    }
}
