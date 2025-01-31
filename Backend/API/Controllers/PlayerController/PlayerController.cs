
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Data.Entities;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;

namespace API.Controllers.AdminControllers
{
    [ApiController]
    [Route("api")] 
    public class PlayerController : ControllerBase
    {
        public readonly AppDbContext _context;
        public readonly ILogger<PlayerController> _logger;
        public  BlobService _blobService { get; set; }


        public PlayerController(AppDbContext context,ILogger<PlayerController> logger,BlobService blobService)
        {
            _context = context;
            _logger = logger;
            _blobService = blobService;
        }

        // GET: api/player
        [HttpGet("players")]
        public async Task<ActionResult<IEnumerable<Player>>> GetPlayers()
        {
            

            //var players = await _context.Player.Include(x=>x.PictureID).Include(x=>x.Picture).Include(x=>x.Club).ToListAsync(ct);
            var players = await _context.Player.Include(x => x.Club).
                Include(x => x.Picture)
                //.Select(p => new PlayerDto
                //{
                //    ID = p.ID,
                //    FirstName = p.FirstName,
                //    LastName = p.LastName,
                //    BirthDate = p.BirthDate,
                //    Position = p.Position,
                //    ClubId = p.ClubID,
                //    ImageUrl = p.Picture != null ? p.Picture.BlobUrl : null // Provjera da li slika postoji
                //}).
                .ToListAsync();
            return Ok(players); 
        }

        // GET: api/player/{id}
        [HttpGet("players/{id}")]
        public async Task<ActionResult<PlayerDto>> GetPlayer(int id)
        {
            var player=await _context.Player.Where(p=>p.ID == id).Select(
                        p=>new PlayerDto
                        {
                            ID = p.ID,
                            FirstName = p.FirstName,
                            LastName = p.LastName,
                            BirthDate = p.BirthDate,
                            Position = p.Position,
                            ClubId=p.ClubID,
                            Picture=p.Picture,
                            PictureID=p.PictureID
                        }).FirstOrDefaultAsync(p => p.ID == id); ;

            if (player == null)
            {
                return NotFound();
            }

            return Ok(player);
        }

        // POST: api/player
        [HttpPost("players")]
        public async Task<ActionResult<Player>> CreatePlayer([FromForm] PlayerCreateDto playerDto)
        {
            if (playerDto == null)
                return BadRequest("Podaci o igraču nisu ispravni.");

            // URL slike (ako postoji)
            string imageUrl = null;

            // Upload slike u Blob Storage, ako je poslana
            if (playerDto.Image != null)
            {
                try
                {
                    using (var stream = playerDto.Image.OpenReadStream())
                    {
                        string fileName = $"{Guid.NewGuid()}_{playerDto.Image.FileName}";
                        imageUrl = await _blobService.UploadPhotoAsync(stream, fileName);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Greška pri uploadu slike.");
                    return StatusCode(500, "Došlo je do greške prilikom uploadovanja slike.");
                }
            }

            // Kreiranje entiteta slike (ako postoji)
            Picture? picture = null;
            if (!string.IsNullOrEmpty(imageUrl))
            {
                picture = new Picture
                {
                    BlobUrl = imageUrl
                };

                _context.Picture.Add(picture);
                await _context.SaveChangesAsync(); // Čuvanje slike u bazi i dobijanje PictureID
            }

            // Kreiranje entiteta igrača
            var player = new Player
            {
                FirstName = playerDto.FirstName,
                LastName = playerDto.LastName,
                BirthDate = playerDto.BirthDate,
                ClubID = playerDto.ClubId,
                Position = playerDto.Position,
                PictureID =picture?.ID // Povezivanje slike sa igračem (ako postoji)
            };

            try
            {
                _context.Player.Add(player);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Greška pri čuvanju igrača.");
                return StatusCode(500, "Došlo je do greške prilikom čuvanja igrača.");
            }

            // Vraćanje rezultata
            return CreatedAtAction(nameof(GetPlayer), new { id = player.ID }, player);
        }

        [HttpGet("players/paginated")]
        public async Task<IActionResult> GetPlayers(int page = 1, int pageSize = 2, int? clubId = null)
        {
            var query = _context.Player.Include(x=>x.Club).Include(x=>x.Picture).AsQueryable();
            if(clubId!=null)
            { 
                query = query.Where(p => p.ClubID == clubId);
            }

            var players = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalPlayers = await query.CountAsync();

            var totalPages = (int)Math.Ceiling((double)totalPlayers / pageSize);

            var response = new
            {
                Players = players,
                TotalPlayers = totalPlayers,
                TotalPages = totalPages,
                CurrentPage = page
            };

            return Ok(response);
        }

        // PUT: api/player/{id}
        
        [HttpPut("players/{id}")]
        public async Task<IActionResult> UpdatePlayer(int id, [FromForm] PlayerCreateDto playerDto)
        {
            var player = await _context.Player.Include(p => p.Picture).FirstOrDefaultAsync(p => p.ID == id);
            if (player == null)
            {
                return NotFound("Igrač nije pronađen.");
            }

            // Ažuriranje osnovnih podataka o igraču
            player.FirstName = playerDto.FirstName;
            player.LastName = playerDto.LastName;
            player.BirthDate = playerDto.BirthDate;
            player.ClubID = playerDto.ClubId;
            player.Position = playerDto.Position;

            // Ažuriranje slike ako je nova slika poslana
            if (playerDto.Image != null)
            {
                try
                {
                    // Brisanje postojeće slike iz Blob Storage (ako postoji)
                    if (player.Picture != null && !string.IsNullOrEmpty(player.Picture.BlobUrl))
                    {
                        await _blobService.DeletePhotoAsync(player.Picture.BlobUrl);
                    }

                    // Upload nove slike u Blob Storage
                    using (var stream = playerDto.Image.OpenReadStream())
                    {
                        string fileName = $"{Guid.NewGuid()}_{playerDto.Image.FileName}";
                        var imageUrl = await _blobService.UploadPhotoAsync(stream, fileName);

                        // Kreiranje ili ažuriranje entiteta slike
                        if (player.Picture == null)
                        {
                            player.Picture = new Picture { BlobUrl = imageUrl };
                            _context.Picture.Add(player.Picture);
                        }
                        else
                        {
                            player.Picture.BlobUrl = imageUrl;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Greška pri uploadovanju nove slike.");
                    
                    return StatusCode(500, "Došlo je do greške prilikom uploadovanja nove slike.");
                }
            }

            // Spremanje izmjena u bazu
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Greška prilikom ažuriranja igrača.");
                return StatusCode(500, "Došlo je do greške prilikom ažuriranja podataka igrača.");
            }

            return NoContent();
        }

        // DELETE: api/player/{id}
        [HttpDelete("players/{id}")]
        public async Task<IActionResult> DeletePlayer(int id)
        {
            var player = await _context.Player.FindAsync(id);
            if (player == null)
            {
                throw new KeyNotFoundException("Player not found!!!");
            }

            _context.Player.Remove(player);
            await _context.SaveChangesAsync();

            return NoContent();
        }





        private bool PlayerExists(int id)
        {
            return _context.Player.Any(e => e.ID == id);
        }
    }
}






