using System.Security.Claims;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // GET: api/Comment/news/{newsId}
        [HttpGet("news/{newsId}")]
        public async Task<IActionResult> GetCommentsForNews(int newsId)
        {
            var userId = User.FindFirstValue("UserId");
            int.TryParse(userId, out int parsedUserId);

            var comments = await _context.Comment
        .Where(c => c.NewsID == newsId)
        .Include(c => c.User) // Include user details
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
                .FirstOrDefault() // Fetch the current user's reaction
        })
        .ToArrayAsync();

            return Ok(comments);
        }

        // POST: api/Comment
        //[Authorize(Roles ="User")]
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

        // PUT: api/Comment/{id}
        public class UpdateCommentDTO
        {
            public string NewComment { get; set; }
            public int UserId { get; set; }
        }
        //[Authorize(Roles ="User")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDTO dto)
        {
            var comment = await _context.Comment.Include(x => x.User)
                .FirstOrDefaultAsync(x => x.ID == id);

            if (comment == null)
                return NotFound();

            // Update the comment
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
        // DELETE: api/Comment/{id}     

        //[Authorize(Roles ="User,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comment.FindAsync(id);

            if (comment == null)
                return NotFound();

            // Privremena logika bez autorizacije
            _context.Comment.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpPut("react")]
        public async Task<IActionResult> ReactToComment(int commentId, int userId, bool isLike)
        {
            // Check if the comment exists
            var comment = await _context.Comment.FirstOrDefaultAsync(c => c.ID == commentId);
            if (comment == null)
            {
                return NotFound("Comment not found");
            }

            // Check if the user exists
            var user = await _context.User.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized("User not found or not logged in");
            }

            // Check if the reaction exists
            var existingReaction = await _context.CommentReaction
       .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

            if (existingReaction != null)
            {
                if (existingReaction.IsLike == isLike)
                {
                    // Remove the reaction if toggling the same reaction
                    _context.CommentReaction.Remove(existingReaction);
                }
                else
                {
                    // Update the existing reaction
                    existingReaction.IsLike = isLike;
                    _context.CommentReaction.Update(existingReaction);
                }
            }
            else
            {
                // Add a new reaction
                var newReaction = new CommentReaction
                {
                    CommentId = commentId,
                    UserId = userId,
                    IsLike = isLike
                };
                _context.CommentReaction.Add(newReaction);
            }

            // Save changes to the CommentReaction table
            await _context.SaveChangesAsync();

            // Recalculate like and dislike counts
            int likeCount = await _context.CommentReaction.CountAsync(r => r.CommentId == commentId && r.IsLike == true);
            int dislikeCount = await _context.CommentReaction.CountAsync(r => r.CommentId == commentId && r.IsLike == false);

            // Update the Comment table with the new counts
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


    }
}