using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Services;
using System.Threading.Tasks;
using Azure;
using API.DTOs;
using Microsoft.Extensions.Logging;

namespace API.Controllers.AIController
{
    [ApiController]
    [Route("api")]
    public class AIController : ControllerBase
    {
        private readonly AI_Service _aiService;

        public AIController(AI_Service aiService)
        {
            _aiService = aiService;
        }

        // POST: api/AI/ask
        [HttpPost("ask")]
        public async Task<IActionResult> AskAI([FromBody] AI_Request_DTO request_DTO)
        {
            if (string.IsNullOrWhiteSpace(request_DTO.Prompt))
            {
                return BadRequest("Pitanje ne može biti prazno.");
            }

            try
            {
                var response = await _aiService.GetAIResponse(request_DTO.Prompt);
                return Ok(new { Answer = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška: {ex.Message}");
            }
        }
    }
}
