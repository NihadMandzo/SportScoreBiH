using API.Data;
using API.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.StadiumController
{
    [Route("api/[controller]")]
    [ApiController]
    public class StadiumController : ControllerBase
    {
        public AppDbContext _context;
        public StadiumController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StadiumDTO>> GetStadiumCoordinates(int id)
        {
            var stadium = await _context.Stadium
                .Where(s => s.ID == id)
                .Select(s => new StadiumDTO
                {
                    ID = s.ID,
                    Name = s.Name,
                    Capacity = s.Capacity,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude
                })
                .ToListAsync();

            if (stadium == null)
            {
                return NotFound();
            }

            return Ok(stadium);
        }
    }
}
