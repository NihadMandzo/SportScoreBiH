using System;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers.AdminControllers;

[ApiController]
[Route("api/[controller]")]
public class NewsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly BlobService _blobService;

    public NewsController(AppDbContext context, BlobService blobService)
    {
        _context = context;
        _blobService = blobService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NewsDTO>>> GetNews()
    {
        var newsList = await _context.News
        .Include(n => n.NewsClubs)
            .ThenInclude(nc => nc.Club)
        .Include(n => n.Admin)
        .Include(n => n.NewsPictures)
            .ThenInclude(np => np.Picture)
        .OrderByDescending(n => n.DateTime)
        .Select(n => new NewsDTO
        {
            ID = n.ID,
            Title = n.Title,
            Content = n.Content,
            DateTime = n.DateTime,
            Admin = new AdminDTO
            {
                ID = n.Admin.ID,
                FirstName = n.Admin.FirstName,
                LastName = n.Admin.LastName,
            },
            Clubs = n.NewsClubs.Select(nc => new ClubDTO
            {
                ID = nc.Club.ID,
                Name = nc.Club.Name,
                Info = nc.Club.Info
            }).ToList(),
            Pictures = n.NewsPictures.Select(np => np.Picture.BlobUrl)     
            }).OrderByDescending(n => n.DateTime)
        .ToArrayAsync();

        return Ok(newsList);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<News>> GetNews(int id)
    {
        var news = await _context.News
            .Include(n => n.Admin)
            .Include(n => n.NewsClubs)
                .ThenInclude(nc => nc.Club).Include(n => n.NewsPictures).ThenInclude(n => n.Picture)
            .FirstOrDefaultAsync(n => n.ID == id);

        if (news == null)
        {
            return NotFound();
        }

        var newsDto = new NewsDTO
        {
            ID = news.ID,
            Title = news.Title,
            Content = news.Content,
            DateTime = news.DateTime,
            Admin = new AdminDTO
            {
                ID = news.Admin.ID,
                FirstName = news.Admin.FirstName,
                LastName = news.Admin.LastName,
            },
            Clubs = news.NewsClubs.Select(nc => new ClubDTO
            {
                ID = nc.Club.ID,
                Name = nc.Club.Name,
                Info = nc.Club.Info
            }).ToList(),
            Pictures = news.NewsPictures.Select(np => np.Picture.BlobUrl).ToArray() 
        };

        return Ok(newsDto);

    }

    [HttpGet("by-club/{clubId}")]

    public async Task<ActionResult<PagedResult<NewsDTO>>> GetNewsByClubId(int clubId, int pageNumber =1,int pageSize=10)
    {
        var query = _context.News
            .Include(n => n.NewsClubs)
            .ThenInclude(nc => nc.Club)
            .Include(n => n.NewsPictures)
            .Where(n => n.NewsClubs.Any(nc => nc.ClubID == clubId));

        var totalItems = await query.CountAsync();

        var newsList = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NewsDTO
            {
                ID = n.ID,
                Title = n.Title,
                Content = n.Content,
                DateTime = n.DateTime,
                Admin = new AdminDTO
                {
                    ID = n.Admin.ID,
                    FirstName = n.Admin.FirstName,
                    LastName = n.Admin.LastName,
                },
                Clubs = n.NewsClubs.Select(nc => new ClubDTO
                {
                    ID = nc.Club.ID,
                    Name = nc.Club.Name,
                    Info = nc.Club.Info,
                }).ToList(),
                Pictures = n.NewsPictures.Select(np => np.Picture.BlobUrl).ToList(),
            })
            .ToArrayAsync();

        return Ok(new PagedResult<NewsDTO>
        {
            TotalItems = totalItems,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Items = newsList,
        });
    }


    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<NewsDTO>> CreateNews([FromForm] NewsCreateDTO newsCreateDTO)
    {

        var adminIdClaim = User.FindFirst("UserId");
        Console.WriteLine($"Admin ID Claim Value: {adminIdClaim.Value}");
        if (adminIdClaim == null)
        {
            return Unauthorized("User not authenticated");
        }

        Console.WriteLine($"Admin ID Claim Value: {adminIdClaim.Value}");
        Console.WriteLine($"Admin ID Claim Type: {adminIdClaim.Type}");

        if (!int.TryParse(adminIdClaim.Value, out int adminId))
        {
            return BadRequest($"Invalid admin ID. Claim value: {adminIdClaim.Value}");
        }

        Console.WriteLine($"Parsed Admin ID: {adminId}");

        // Check if the admin exists in the database
        var adminExists = await _context.Admin.AnyAsync(a => a.ID == adminId);
        if (!adminExists)
        {
            return BadRequest($"Admin with ID {adminId} does not exist in the database");
        }

        // Validate input
        if (newsCreateDTO == null)
        {
            return BadRequest("Invalid input data.");
        }
        if (string.IsNullOrWhiteSpace(newsCreateDTO.Title) || newsCreateDTO.Title.Length < 10)
        {
            return BadRequest("Title must be at least 10 characters long.");
        }
        if (string.IsNullOrWhiteSpace(newsCreateDTO.Content) || newsCreateDTO.Content.Length < 35)
        {
            return BadRequest("Content must be at least 35 characters long.");
        }
        if (newsCreateDTO.Pictures == null || !newsCreateDTO.Pictures.Any())
        {
            return BadRequest("At least one photo is required.");
        }


        var news = new News
        {
            Title = newsCreateDTO.Title,
            Content = newsCreateDTO.Content,
            DateTime = DateTime.UtcNow,
            AdminID = adminId,
        };



        if (newsCreateDTO.ClubIds != null && newsCreateDTO.ClubIds.Any())
        {

            var validClubs = await _context.Club
                .Where(c => newsCreateDTO.ClubIds.Contains(c.ID))
                .ToListAsync();

            if (validClubs.Count != newsCreateDTO.ClubIds.Count)
            {
                return BadRequest("One or more Club IDs are invalid.");
            }

            news.NewsClubs = validClubs.Select(c => new NewsClub
            {
                ClubID = c.ID
            }).ToList();
        }

        _context.News.Add(news);
        await _context.SaveChangesAsync();


        if (newsCreateDTO.Pictures != null && newsCreateDTO.Pictures.Any())
        {
            foreach (var file in newsCreateDTO.Pictures)
            {

                if (file == null) continue;


                string fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                string blobUrl;
                await using (var fileStream = file.OpenReadStream())
                {
                    blobUrl = await _blobService.UploadPhotoAsync(fileStream, fileName);
                }


                var picture = new Picture { BlobUrl = blobUrl };
                _context.Picture.Add(picture);
                await _context.SaveChangesAsync();

                news.NewsPictures.Add(new NewsPictures { NewsID = news.ID, PictureID = picture.ID });
            }
        }


        await _context.SaveChangesAsync();


        return Ok(news);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PagedResult<NewsDTO>>> GetPaginatedNews(int pageNumber = 1, int pageSize = 10)
    {

        if (pageNumber < 1 || pageSize < 1)
        {
            return BadRequest(new { message = "Invalid pagination parameters." });
        }


        var totalItems = await _context.News.CountAsync();


        var newsList = await _context.News
            .Include(n => n.NewsClubs).ThenInclude(nc => nc.Club)
            .Include(n => n.Admin)
            .OrderByDescending(n => n.DateTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NewsDTO
            {
                ID = n.ID,
                Title = n.Title,
                Content = n.Content,
                DateTime = n.DateTime,
                Admin = new AdminDTO
                {
                    ID = n.Admin.ID,
                    FirstName = n.Admin.FirstName,
                    LastName = n.Admin.LastName
                },
                Clubs = n.NewsClubs.Select(nc => new ClubDTO
                {
                    ID = nc.Club.ID,
                    Name = nc.Club.Name,
                    Info = nc.Club.Info
                }).ToList(),
                Pictures = n.NewsPictures.Select(np => np.Picture.BlobUrl).ToList()
            })
            .ToArrayAsync();



        return Ok(new PagedResult<NewsDTO>
        {
            TotalItems = totalItems,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Items = newsList
        });
    }
    
    [Authorize(Roles = "Admin")]
    [HttpDelete("{Id}")]
    public async Task<IActionResult> DeleteNews(int Id)
    {
        var news = await _context.News
        .Include(n => n.NewsClubs)  
        .Include(n => n.NewsPictures)
            .ThenInclude(np => np.Picture)
        .FirstOrDefaultAsync(n => n.ID == Id);

        if (news == null)
        {
            return NotFound(new { message = "News not found" });
        }


        _context.NewsClubs.RemoveRange(news.NewsClubs);


        foreach (var newsPicture in news.NewsPictures)
        {
            var blobUrl = newsPicture.Picture.BlobUrl;
            var fileName = Path.GetFileName(blobUrl);
            await _blobService.DeletePhotoAsync(fileName);
        }


        _context.NewsPictures.RemoveRange(news.NewsPictures);


        _context.News.Remove(news);


        await _context.SaveChangesAsync();

        return NoContent();  
        }
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNews(int id, [FromForm] NewsUpdateDto newsUpdateDTO)
    {
        var news = await _context.News
       .Include(n => n.NewsClubs)
       .Include(n => n.NewsPictures).ThenInclude(np => np.Picture)
       .FirstOrDefaultAsync(n => n.ID == id);

        if (news == null)
        {
            return NotFound(new { message = "News not found" });
        }
        Console.WriteLine("Received ClubIds: " + (newsUpdateDTO.ClubIds != null ? string.Join(",", newsUpdateDTO.ClubIds) : "null"));

        if (!string.IsNullOrWhiteSpace(newsUpdateDTO.Title))
        {
            news.Title = newsUpdateDTO.Title;
        }
        if (!string.IsNullOrWhiteSpace(newsUpdateDTO.Content))
        {
            news.Content = newsUpdateDTO.Content;
        }



        if (newsUpdateDTO.ClubIds != null)
        {

            var clubsToUnlink = news.NewsClubs
                .Where(nc => !newsUpdateDTO.ClubIds.Contains(nc.ClubID))
                .ToList();

            _context.NewsClubs.RemoveRange(clubsToUnlink);


            var existingClubIds = news.NewsClubs.Select(nc => nc.ClubID).ToList();
            var newClubsToAdd = newsUpdateDTO.ClubIds
                .Where(clubId => !existingClubIds.Contains(clubId))
                .Select(clubId => new NewsClub { NewsID = id, ClubID = clubId });

            _context.NewsClubs.AddRange(newClubsToAdd);
        }
        else
        {

            _context.NewsClubs.RemoveRange(news.NewsClubs);
        }

        if (newsUpdateDTO.DeleteAllPictures)
        {

            foreach (var newsPicture in news.NewsPictures)
            {
                var blobUrl = newsPicture.Picture.BlobUrl;
                var fileName = Path.GetFileName(blobUrl);
                await _blobService.DeletePhotoAsync(fileName);
            }
            _context.NewsPictures.RemoveRange(news.NewsPictures);
        }
        else
        {

            if (newsUpdateDTO.PicturesToDelete != null && newsUpdateDTO.PicturesToDelete.Any())
            {
                foreach (var pictureUrl in newsUpdateDTO.PicturesToDelete)
                {
                    var newsPicture = news.NewsPictures.FirstOrDefault(np => np.Picture.BlobUrl == pictureUrl);
                    if (newsPicture != null)
                    {
                        var fileName = Path.GetFileName(newsPicture.Picture.BlobUrl);
                        await _blobService.DeletePhotoAsync(fileName);

                        _context.NewsPictures.Remove(newsPicture);
                    }
                }
            }
        }


        if (newsUpdateDTO.NewPictures != null)
        {
            foreach (var file in newsUpdateDTO.NewPictures)
            {
                if (file == null) continue;

                string fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                string blobUrl;
                await using (var fileStream = file.OpenReadStream())
                {
                    blobUrl = await _blobService.UploadPhotoAsync(fileStream, fileName);
                }

                var picture = new Picture { BlobUrl = blobUrl };
                _context.Picture.Add(picture);
                await _context.SaveChangesAsync(); 

                news.NewsPictures.Add(new NewsPictures { NewsID = news.ID, PictureID = picture.ID });
            }
        }

        await _context.SaveChangesAsync();

        return Ok(news);
    }

    [HttpGet("search/predictions")]
    public async Task<ActionResult<IEnumerable<News>>> GetSearchPredictions(string query)
    {
        if (string.IsNullOrEmpty(query) || string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<object>()); 

        }
        var predictions = await _context.News
            .Where(n => n.Title.Contains(query) || n.Content.Contains(query))
            .Take(5)
            .ToListAsync();
        return Ok(predictions);
    }


    public class PagedResult<T>
    {
        public int TotalItems { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public IEnumerable<T> Items { get; set; }
    }
}
