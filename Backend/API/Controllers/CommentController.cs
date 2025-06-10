using System.Security.Claims;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static API.Controllers.AdminControllers.NewsController;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet("news/{newsId}")]
        public async Task<IActionResult> GetCommentsForNews(int newsId)
        {
            var userId = User.FindFirstValue("UserId");
            int.TryParse(userId, out int parsedUserId);

            var comments = await _context.Comment
        .Where(c => c.NewsID == newsId)
        .Include(c => c.User) 
        .Select(c => new CommentDTO
        {
            Id = c.ID,
            Comment = c.Content,
            DateTime = c.DateTime,
            Username = c.User.UserName,
            NewsID = c.NewsID,
            Like = c.Like,
            Dislike = c.Dislike,
            UserReaction = _context.CommentReaction
                .Where(r => r.CommentId == c.ID && r.UserId == parsedUserId)
                .Select(r => r.IsLike ? "like" : "dislike")
                .FirstOrDefault() 
        })
        .ToArrayAsync();

            return Ok(comments);
        }

        [Authorize(Roles = "User")]
        [HttpPost]
        public async Task<IActionResult> AddComment(int newsId, [FromBody] CommentCreateDTO commentDto)
        {
            var user = await _context.User.FindAsync(commentDto.UserID);
            var comment = new Comment
            {
                Content = commentDto.Comment,
                DateTime = DateTime.UtcNow,
                UserID = commentDto.UserID,
                NewsID = newsId
            };

            _context.Comment.Add(comment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCommentsForNews), new { newsId = comment.NewsID }, commentDto);
        }


        public class UpdateCommentDTO
        {
            public string NewComment { get; set; }
            public int UserId { get; set; }
        }
        [Authorize(Roles = "User")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDTO dto)
        {
            var comment = await _context.Comment.Include(x => x.User)
                .FirstOrDefaultAsync(x => x.ID == id);

            if (comment == null)
                return NotFound();

            var currentUserId = int.Parse(User.FindFirst("UserId")?.Value);
            

            if (comment.UserID != currentUserId)
            {
                return Unauthorized("You can only update your own comments");
            }

            comment.Content = dto.NewComment;
            await _context.SaveChangesAsync();

            return Ok(new CommentDTO
            {
                Id = comment.ID,
                Comment = comment.Content,
                DateTime = comment.DateTime,
                Username = comment.User.UserName,
                NewsID = comment.NewsID
            });
        }
 

        [Authorize(Roles = "User,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comment.FindAsync(id);
            if (comment == null)
                return NotFound();

            var currentUserId = int.Parse(User.FindFirst("UserId")?.Value);
            var isAdmin = User.IsInRole("Admin");


            if (!isAdmin && comment.UserID != currentUserId)
            {
                return Unauthorized("You can only delete your own comments");
            }

            _context.Comment.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [Authorize(Roles = "User")]
        [HttpPut("react")]
        public async Task<IActionResult> ReactToComment(int commentId, int userId, bool isLike)
        {

            var currentUserId = int.Parse(User.FindFirst("UserId")?.Value);
            

            if (currentUserId != userId)
            {
                return Unauthorized("You can only react with your own user ID");
            }


            var comment = await _context.Comment.FirstOrDefaultAsync(c => c.ID == commentId);
            if (comment == null)
            {
                return NotFound("Comment not found");
            }

            var user = await _context.User.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized("User not found or not logged in");
            }


            var existingReaction = await _context.CommentReaction
       .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

            if (existingReaction != null)
            {
                if (existingReaction.IsLike == isLike)
                {

                    _context.CommentReaction.Remove(existingReaction);
                }
                else
                {

                    existingReaction.IsLike = isLike;
                    _context.CommentReaction.Update(existingReaction);
                }
            }
            else
            {

                var newReaction = new CommentReaction
                {
                    CommentId = commentId,
                    UserId = userId,
                    IsLike = isLike
                };
                _context.CommentReaction.Add(newReaction);
            }


            await _context.SaveChangesAsync();


            int likeCount = await _context.CommentReaction.CountAsync(r => r.CommentId == commentId && r.IsLike == true);
            int dislikeCount = await _context.CommentReaction.CountAsync(r => r.CommentId == commentId && r.IsLike == false);


            comment.Like = likeCount;
            comment.Dislike = dislikeCount;
            _context.Comment.Update(comment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                like = comment.Like,
                dislike = comment.Dislike,
                userReaction = isLike ? "like" : "dislike"
            });
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("comments")]
        public async Task<ActionResult<PagedResult<AllCommentsDto>>> GetComments(int pageNumber = 1, int pageSize = 10)
        {

            if (pageNumber < 1 || pageSize < 1)
            {
                return BadRequest(new { message = "Invalid pagination parameters." });
            }


            var totalItems = await _context.Comment.CountAsync();


            var comments = await _context.Comment
                .OrderByDescending(c => c.DateTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new AllCommentsDto
                {
                    Id = c.ID,
                    Comment = c.Content,
                    DateTime = c.DateTime,
                    Username = c.User.UserName,
                    Like = c.Like,
                    Dislike = c.Dislike,
                })
                .ToArrayAsync();

            return Ok(new PagedResult<AllCommentsDto>
            {
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Items = comments
            });
        }
    }

    public class AllCommentsDto{
        public int Id { get; set; }
        public string Comment { get; set; }
        public DateTime DateTime { get; set; }
        public string Username { get; set; }
        public int Like { get; set; }
        public int Dislike { get; set; }
    }
}