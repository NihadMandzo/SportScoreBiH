using System;
using API.Data;
using API.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.AdminControllers;

[ApiController]
[Route("api/[controller]")]
public class PictureController : ControllerBase
{
     private readonly AppDbContext _context;

    public PictureController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Picture>>> GetPictures (){
        var pictures = _context.Picture
                        .ToListAsync();
        return Ok(pictures);
    }

}
