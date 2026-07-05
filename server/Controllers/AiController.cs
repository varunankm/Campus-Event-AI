using CampusConnectAPI.Models;
using CampusConnectAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace CampusConnectAPI.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly EventService _events;
    private readonly RegistrationService _registrations;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _http;

    public AiController(EventService events, RegistrationService registrations,
        IConfiguration config, IHttpClientFactory http)
    {
        _events = events;
        _registrations = registrations;
        _config = config;
        _http = http;
    }

    // ── Student Chat ──────────────────────────────────────────────────────
    [HttpPost("chat")]
    [Authorize(Roles = "student")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequest req)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var studentName = User.FindFirstValue(ClaimTypes.Name)!;
        var dept = req.Department ?? "General";
        var skills = req.Skills != null && req.Skills.Count > 0
            ? string.Join(", ", req.Skills) : "Not specified";
        var interests = req.Interests != null && req.Interests.Count > 0
            ? string.Join(", ", req.Interests) : "Not specified";

        var allEvents = await _events.GetAllAsync();
        var myRegs = await _registrations.GetByStudentAsync(studentId);
        var registeredIds = myRegs.Select(r => r.EventId).ToHashSet();

        var available = allEvents
            .Where(e => !registeredIds.Contains(e.Id!) &&
                        e.RegistrationDeadline.ToUniversalTime() > DateTime.UtcNow)
            .ToList();

        var eventsSummary = available.Count == 0
            ? "No events currently open for registration."
            : string.Join("\n", available.Select((e, i) =>
                "[" + (i + 1) + "] ID:" + e.Id + " | " + e.Title +
                " | Dept:" + e.Department + " | Cat:" + e.Category +
                " | Date:" + e.Date.ToString("MMM dd yyyy") +
                " | Venue:" + e.Venue + " | By:" + e.FacultyName));

        var regSummary = string.Join(", ", allEvents
            .Where(e => registeredIds.Contains(e.Id!)).Select(e => e.Title));

        var systemPrompt = "You are CampusConnect AI, a friendly college event assistant for students.\n\n"
            + "STUDENT PROFILE:\n"
            + "- Name: " + studentName + "\n"
            + "- Department: " + dept + "\n"
            + "- CGPA: " + (req.Cgpa > 0 ? req.Cgpa.ToString("F1") : "Not provided") + "\n"
            + "- Skills: " + skills + "\n"
            + "- Interests: " + interests + "\n"
            + "- Already Registered: " + (string.IsNullOrEmpty(regSummary) ? "None" : regSummary) + "\n\n"
            + "AVAILABLE EVENTS:\n" + eventsSummary + "\n\n"
            + "RULES:\n"
            + "1. Recommend events that match the student's department, skills, and interests.\n"
            + "2. Use CGPA to suggest competitive events (e.g. CGPA > 8 → academic/technical events).\n"
            + "3. When student confirms registration, output EXACTLY on its own line:\n"
            + "   <<ACTION:REGISTER:{\"eventId\":\"REPLACE_WITH_ID\",\"eventTitle\":\"REPLACE_WITH_TITLE\"}>>\n"
            + "4. Be friendly, concise, use emojis.\n"
            + "5. Only suggest from the AVAILABLE EVENTS list above.\n"
            + "6. Never auto-register without explicit student confirmation.";

        var apiKey = _config["Gemini:ApiKey"] ?? "";
        if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_GEMINI_API_KEY")
            return Ok(await FallbackChat(req.Message, dept, req.Cgpa, req.Skills ?? new(), req.Interests ?? new(), available, studentId));

        try
        {
            var msgs = BuildGeminiMessages(req.History, req.Message);
            var body = JsonSerializer.Serialize(new
            {
                system_instruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = msgs,
                generationConfig = new { temperature = 0.7, maxOutputTokens = 500 }
            });

            var aiText = await CallGemini(body);
            if (aiText == null)
                return Ok(await FallbackChat(req.Message, dept, req.Cgpa, req.Skills ?? new(), req.Interests ?? new(), available, studentId));

            return Ok(await ParseAndRegister(aiText, studentId, registeredIds));
        }
        catch (Exception ex)
        {
            Console.WriteLine("Student chat error: " + ex.Message);
            return Ok(await FallbackChat(req.Message, dept, req.Cgpa, req.Skills ?? new(), req.Interests ?? new(), available, studentId));
        }
    }

    // ── Faculty Chat ──────────────────────────────────────────────────────
    [HttpPost("faculty-chat")]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> FacultyChat([FromBody] FacultyChatRequest req)
    {
        var facultyId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var facultyName = User.FindFirstValue(ClaimTypes.Name)!;

        var myEvents = await _events.GetByFacultyAsync(facultyId);
        var stats = await BuildEventStats(myEvents);

        decimal totalBudget = stats.Sum(s => s.BudgetEstimate);
        decimal totalExpense = stats.Sum(s => s.ActualExpense);
        int totalParticipants = stats.Sum(s => s.Participants);

        var eventsSummary = stats.Count == 0
            ? "No events created yet."
            : string.Join("\n", stats.Select(s =>
                "- " + s.Title + " (" + s.Category + ", " + s.Status + "): "
                + s.Participants + "/" + s.MaxParticipants + " participants, "
                + "Fill:" + s.FillRate + "%, "
                + "Budget:₹" + s.BudgetEstimate + ", Expense:₹" + s.ActualExpense
                + ", Surplus:₹" + s.Surplus));

        var systemPrompt = "You are CampusConnect AI — an analytics and event management assistant for faculty.\n\n"
            + "FACULTY PROFILE:\n"
            + "- Name: " + facultyName + "\n"
            + "- Total Events Created: " + myEvents.Count + "\n"
            + "- Total Participants: " + totalParticipants + "\n"
            + "- Total Budget: ₹" + totalBudget + "\n"
            + "- Total Expense: ₹" + totalExpense + "\n"
            + "- Net Surplus/Deficit: ₹" + (totalBudget - totalExpense) + "\n\n"
            + "EVENT BREAKDOWN:\n" + eventsSummary + "\n\n"
            + "CAPABILITIES:\n"
            + "1. Answer questions about event performance, participation, budget, ROI.\n"
            + "2. Suggest improvements for future events.\n"
            + "3. Identify best/worst performing events.\n"
            + "4. Give budget optimization tips.\n"
            + "5. Be professional, data-driven, use numbers from the breakdown above.\n"
            + "6. Use markdown bold (**text**) for key figures. Keep responses concise.";

        var apiKey = _config["Gemini:ApiKey"] ?? "";
        if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_GEMINI_API_KEY")
        {
            return Ok(new AiChatResponse
            {
                Message = FacultyFallbackChat(req.Message, stats, totalBudget, totalExpense, totalParticipants)
            });
        }

        try
        {
            var msgs = BuildGeminiMessages(req.History, req.Message);
            var body = JsonSerializer.Serialize(new
            {
                system_instruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = msgs,
                generationConfig = new { temperature = 0.6, maxOutputTokens = 600 }
            });

            var aiText = await CallGemini(body);
            return Ok(new AiChatResponse
            {
                Message = aiText ?? FacultyFallbackChat(req.Message, stats, totalBudget, totalExpense, totalParticipants)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Faculty chat error: " + ex.Message);
            return Ok(new AiChatResponse
            {
                Message = FacultyFallbackChat(req.Message, stats, totalBudget, totalExpense, totalParticipants)
            });
        }
    }

    // ── Faculty Analytics Report ──────────────────────────────────────────
    [HttpPost("faculty-analytics")]
    [Authorize(Roles = "faculty,admin")]
    public async Task<IActionResult> FacultyAnalytics([FromBody] FacultyAnalyticsRequest req)
    {
        var facultyId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var facultyName = User.FindFirstValue(ClaimTypes.Name)!;

        var myEvents = await _events.GetByFacultyAsync(facultyId);
        var stats = await BuildEventStats(myEvents);

        decimal totalBudget = stats.Sum(s => s.BudgetEstimate);
        decimal totalExpense = stats.Sum(s => s.ActualExpense);
        int totalParticipants = stats.Sum(s => s.Participants);
        double avgFill = stats.Count > 0
            ? Math.Round(stats.Average(s => s.FillRate), 1) : 0;

        var breakdown = stats.Count == 0
            ? "No events yet."
            : string.Join("\n", stats.Select(s =>
                "- " + s.Title + " (" + s.Category + "): "
                + s.Participants + "/" + s.MaxParticipants + " fill:" + s.FillRate
                + "% budget:₹" + s.BudgetEstimate + " expense:₹" + s.ActualExpense));

        var question = string.IsNullOrEmpty(req.Question)
            ? "Provide a concise analytics summary covering: top performing events, budget efficiency, participation trends, and 2-3 specific actionable recommendations."
            : req.Question;

        var prompt = "You are a faculty event analytics AI.\n\n"
            + "Faculty: " + facultyName + "\n"
            + "Events: " + myEvents.Count + " | Participants: " + totalParticipants
            + " | Budget: ₹" + totalBudget + " | Expense: ₹" + totalExpense
            + " | Surplus: ₹" + (totalBudget - totalExpense) + "\n\n"
            + "Event Breakdown:\n" + breakdown + "\n\n"
            + "Question: " + question;

        string aiInsight;
        var apiKey = _config["Gemini:ApiKey"] ?? "";

        if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_GEMINI_API_KEY")
        {
            aiInsight = BuildFallbackInsight(stats.Count, totalParticipants, totalBudget, totalExpense);
        }
        else
        {
            try
            {
                var body = JsonSerializer.Serialize(new
                {
                    contents = new[] { new { role = "user", parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.5, maxOutputTokens = 700 }
                });
                aiInsight = await CallGemini(body)
                    ?? BuildFallbackInsight(stats.Count, totalParticipants, totalBudget, totalExpense);
            }
            catch
            {
                aiInsight = BuildFallbackInsight(stats.Count, totalParticipants, totalBudget, totalExpense);
            }
        }

        return Ok(new
        {
            summary = new
            {
                totalEvents = myEvents.Count,
                totalParticipants,
                totalBudget,
                totalExpense,
                netSurplus = totalBudget - totalExpense,
                upcomingEvents = myEvents.Count(e => e.Date > DateTime.UtcNow),
                completedEvents = myEvents.Count(e => e.Date <= DateTime.UtcNow),
                avgFillRate = avgFill
            },
            events = stats,
            aiInsight
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private async Task<List<EventStat>> BuildEventStats(List<Event> events)
    {
        var result = new List<EventStat>();
        foreach (var ev in events)
        {
            var count = (int)await _registrations.CountByEventAsync(ev.Id!);
            result.Add(new EventStat
            {
                Title = ev.Title,
                Category = ev.Category,
                Date = ev.Date.ToString("MMM dd yyyy"),
                Participants = count,
                MaxParticipants = ev.MaxParticipants,
                FillRate = ev.MaxParticipants > 0
                    ? Math.Round((double)count / ev.MaxParticipants * 100, 1) : 0,
                BudgetEstimate = ev.BudgetEstimate,
                ActualExpense = ev.ActualExpense,
                Surplus = ev.BudgetEstimate - ev.ActualExpense,
                Status = ev.Date > DateTime.UtcNow ? "upcoming" : "completed"
            });
        }
        return result;
    }

    private List<object> BuildGeminiMessages(List<AiMessage>? history, string currentMessage)
    {
        var msgs = new List<object>();
        if (history != null)
            foreach (var h in history)
                msgs.Add(new
                {
                    role = h.Role == "assistant" ? "model" : "user",
                    parts = new[] { new { text = h.Content } }
                });
        msgs.Add(new { role = "user", parts = new[] { new { text = currentMessage } } });
        return msgs;
    }

    private async Task<string?> CallGemini(string requestBody)
    {
        var apiKey = _config["Gemini:ApiKey"] ?? "";
        var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
        var client = _http.CreateClient();
        var res = await client.PostAsync(url, new StringContent(requestBody, Encoding.UTF8, "application/json"));
        if (!res.IsSuccessStatusCode)
        {
            Console.WriteLine("Gemini HTTP error: " + res.StatusCode + " — " + await res.Content.ReadAsStringAsync());
            return null;
        }
        var json = await res.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();
    }

    private async Task<AiChatResponse> ParseAndRegister(string aiText, string studentId, HashSet<string> registeredIds)
    {
        var response = new AiChatResponse { Message = aiText };
        var start = aiText.IndexOf("<<ACTION:REGISTER:");
        if (start < 0) return response;
        var end = aiText.IndexOf(">>", start);
        if (end < 0) return response;

        var jsonStr = aiText.Substring(start + 18, end - start - 18).Trim();
        try
        {
            using var doc = JsonDocument.Parse(jsonStr);
            var eventId = doc.RootElement.GetProperty("eventId").GetString();
            var eventTitle = doc.RootElement.GetProperty("eventTitle").GetString();

            if (!string.IsNullOrEmpty(eventId) && !registeredIds.Contains(eventId))
            {
                var ev = await _events.GetByIdAsync(eventId);
                if (ev != null && DateTime.UtcNow <= ev.RegistrationDeadline.ToUniversalTime())
                {
                    var count = await _registrations.CountByEventAsync(eventId);
                    if (count < ev.MaxParticipants)
                    {
                        await _registrations.RegisterAsync(studentId, eventId);
                        response.Registered = true;
                        response.RegisteredEventTitle = eventTitle;
                    }
                }
            }
            var tag = aiText.Substring(start, end - start + 2);
            response.Message = aiText.Replace(tag, "").Trim();
        }
        catch (Exception ex) { Console.WriteLine("Register parse error: " + ex.Message); }
        return response;
    }

    private async Task<AiChatResponse> FallbackChat(string message, string dept, double cgpa,
        List<string> skills, List<string> interests, List<Event> available, string studentId)
    {
        var msg = message.ToLower().Trim();
        var res = new AiChatResponse();

        // Smart match: dept + skills + interests + cgpa
        var matched = available.Where(e =>
            e.Department.Contains(dept, StringComparison.OrdinalIgnoreCase) ||
            e.Department == "All Departments" ||
            skills.Any(s => e.Title.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                            e.Category.Contains(s, StringComparison.OrdinalIgnoreCase)) ||
            interests.Any(i => e.Title.Contains(i, StringComparison.OrdinalIgnoreCase) ||
                               e.Category.Contains(i, StringComparison.OrdinalIgnoreCase)) ||
            e.Category.ToLower().Split(' ').Any(w => msg.Contains(w)) ||
            e.Title.ToLower().Split(' ').Any(w => w.Length > 3 && msg.Contains(w))
        ).Take(3).ToList();

        bool isConfirm = msg.Contains("yes") || msg.Contains("sure") || msg.Contains("ok") ||
                         msg.Contains("register") || msg.Contains("sign me") ||
                         msg.Contains("go ahead") || msg.Contains("do it") || msg.Contains("enroll");

        int idx = -1;
        if (msg.Contains("#1") || msg.Contains("first") || msg.Contains("1st")) idx = 0;
        else if (msg.Contains("#2") || msg.Contains("second") || msg.Contains("2nd")) idx = 1;
        else if (msg.Contains("#3") || msg.Contains("third") || msg.Contains("3rd")) idx = 2;

        Event? target = null;
        foreach (var ev in available)
            if (ev.Title.ToLower().Split(' ').Any(w => w.Length > 3 && msg.Contains(w))) { target = ev; break; }
        if (idx >= 0 && idx < matched.Count) target = matched[idx];
        if (idx >= 0 && idx < available.Count && target == null) target = available[idx];

        if ((isConfirm || target != null) && target != null)
        {
            var regs = await _registrations.GetByStudentAsync(studentId);
            if (!regs.Any(r => r.EventId == target.Id))
            {
                var count = await _registrations.CountByEventAsync(target.Id!);
                if (count < target.MaxParticipants)
                {
                    await _registrations.RegisterAsync(studentId, target.Id!);
                    res.Registered = true;
                    res.RegisteredEventTitle = target.Title;
                    res.Message = "✅ Done! Registered you for **" + target.Title + "**\n\n"
                        + "📅 " + target.Date.ToString("MMM dd, yyyy") + " · 📍 " + target.Venue
                        + "\n\nGood luck! 🎉";
                }
                else res.Message = "❌ **" + target.Title + "** is fully booked. Want another option?";
            }
            else res.Message = "ℹ️ You're already registered for **" + target.Title + "**!";
            return res;
        }

        if (msg.Length < 5 || msg.Contains("hi") || msg.Contains("hello") || msg.Contains("hey"))
        {
            var cgpaNote = cgpa > 0 ? " Your CGPA " + cgpa.ToString("F1") + " qualifies you for competitive events." : "";
            res.Message = "👋 Hi! I'm your CampusConnect AI.\n\nI'll find events matching your **"
                + dept + "** profile." + cgpaNote + "\n\nTry: **\"Show recommended events\"**";
            return res;
        }

        if (msg.Contains("recommend") || msg.Contains("suggest") || msg.Contains("find") ||
            msg.Contains("show") || msg.Contains("events") || msg.Contains("match") || msg.Contains("for me"))
        {
            var list = matched.Count > 0 ? matched : available.Take(3).ToList();
            if (list.Count > 0)
            {
                var items = string.Join("", list.Select((e, i) =>
                    "\n\n**" + (i + 1) + ". " + e.Title + "**\n"
                    + "   📅 " + e.Date.ToString("MMM dd, yyyy") + " · 📍 " + e.Venue + "\n"
                    + "   🏷 " + e.Category + " · 👨‍🏫 " + e.FacultyName));
                res.Message = "🎯 Events matched to your **" + dept + "** profile:" + items
                    + "\n\nSay **\"Register me for #1\"** to auto-register!";
            }
            else
                res.Message = "😕 No open events right now. Check back soon!";
            return res;
        }

        res.Message = "🤖 I match events to your **" + dept + "** profile, skills & CGPA!\n\n"
            + "Try:\n- **\"Show recommended events\"**\n- **\"Find workshop events\"**\n- **\"Register me for #1\"**";
        return res;
    }

    private string FacultyFallbackChat(string message, List<EventStat> stats,
        decimal totalBudget, decimal totalExpense, int totalParticipants)
    {
        var msg = message.ToLower().Trim();
        var surplus = totalBudget - totalExpense;

        if (msg.Contains("budget") || msg.Contains("cost") || msg.Contains("expense") || msg.Contains("money"))
            return "💰 **Budget Summary**\n\n"
                + "- Total Budget: ₹" + totalBudget.ToString("N0") + "\n"
                + "- Total Expense: ₹" + totalExpense.ToString("N0") + "\n"
                + "- Net " + (surplus >= 0 ? "Surplus" : "Deficit") + ": ₹" + Math.Abs(surplus).ToString("N0") + "\n\n"
                + (surplus >= 0 ? "✅ You are within budget overall." : "⚠️ You exceeded budget. Review high-expense events.")
                + "\n\n**Tip:** Negotiate vendor costs and opt for digital materials to reduce expenses.";

        if (msg.Contains("participant") || msg.Contains("attendance") || msg.Contains("fill") || msg.Contains("popular"))
        {
            var best = stats.OrderByDescending(s => s.FillRate).FirstOrDefault();
            return "👥 **Participation Report**\n\n"
                + "- Total Participants: **" + totalParticipants + "**\n"
                + "- Avg Fill Rate: **" + (stats.Count > 0 ? Math.Round(stats.Average(s => s.FillRate), 1) : 0) + "%**\n"
                + (best != null ? "- Best Event: **" + best.Title + "** (" + best.FillRate + "% filled)\n" : "")
                + "\n**Tip:** Promote events on department notice boards 2 weeks in advance for better turnout.";
        }

        if (msg.Contains("best") || msg.Contains("top") || msg.Contains("performance"))
        {
            var top = stats.OrderByDescending(s => s.FillRate).Take(3).ToList();
            if (top.Count == 0) return "📋 No events data yet. Create your first event to see performance insights!";
            var list = string.Join("\n", top.Select((s, i) =>
                (i + 1) + ". **" + s.Title + "** — " + s.FillRate + "% fill · ₹" + s.Surplus + " surplus"));
            return "🏆 **Top Performing Events**\n\n" + list;
        }

        if (msg.Contains("recommend") || msg.Contains("improve") || msg.Contains("suggest") || msg.Contains("advice"))
            return "💡 **AI Recommendations**\n\n"
                + "1. **Timing:** Schedule events on Wednesdays or Fridays for higher attendance.\n"
                + "2. **Budget:** Keep contingency of 10-15% above estimated cost.\n"
                + "3. **Promotion:** Use department WhatsApp groups for last-minute registrations.\n"
                + "4. **Engagement:** Add QR-based attendance and certificate distribution.\n"
                + "5. **Targeting:** Events matching student CGPA/skills get 40% higher fill rates.";

        if (msg.Contains("hi") || msg.Contains("hello") || msg.Contains("hey") || msg.Length < 5)
            return "👋 Hi! I'm your Faculty AI Analytics assistant.\n\n"
                + "I can help you with:\n"
                + "- **Budget & expense** analysis\n"
                + "- **Participation** trends\n"
                + "- **Best performing** events\n"
                + "- **Improvement** recommendations\n\n"
                + "You have **" + stats.Count + " events** with **" + totalParticipants + " total participants**. What would you like to know?";

        return "📊 I'm your event analytics AI! Ask me about:\n"
            + "- **\"Budget report\"** — costs & surplus\n"
            + "- **\"Participation stats\"** — fill rates\n"
            + "- **\"Best events\"** — top performers\n"
            + "- **\"Give me recommendations\"** — improvement tips";
    }

    private string BuildFallbackInsight(int total, int participants, decimal budget, decimal expense)
    {
        var surplus = budget - expense;
        var eff = budget > 0 ? Math.Round((double)(budget - expense) / (double)budget * 100, 1) : 0.0;
        return "📊 **Analytics Summary**\n\n"
            + "You organized **" + total + " events** with **" + participants + " total participants**.\n\n"
            + "💰 **Budget Overview:**\n"
            + "- Total Budget: ₹" + budget.ToString("N0") + "\n"
            + "- Total Expense: ₹" + expense.ToString("N0") + "\n"
            + "- Net " + (surplus >= 0 ? "Surplus" : "Deficit") + ": ₹" + Math.Abs(surplus).ToString("N0") + "\n"
            + "- Budget Efficiency: " + eff + "%\n\n"
            + (surplus >= 0 ? "✅ Events are within budget overall." : "⚠️ Expenses exceeded budget. Review cost allocations.")
            + "\n\n**Recommendations:**\n"
            + "1. Focus on department-specific events to boost fill rates.\n"
            + "2. Send registration reminders 3 days before deadlines.\n"
            + "3. Collect post-event feedback to improve future planning.";
    }
}
