using System;
using API.Data.Entities;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // Ovde dodaj svoj connection string ili drugu konfiguraciju ako već nije konfigurisano
            optionsBuilder.UseSqlServer("DataBaseSQL");

            // Omogući logging osetljivih podataka
            optionsBuilder.EnableSensitiveDataLogging(true);
        }
    }

    public DbSet<Admin> Admin { get; set; }
    public DbSet<Club> Club { get; set; }
    public DbSet<Comment> Comment {  get; set; }
    public DbSet<CommentReaction> CommentReaction { get; set; }
    //public DbSet<League> League {  get; set; }    
    //public DbSet<LeagueStandings> LeagueStandings {  get; set; }    
    //public DbSet<Match> Match {  get; set; }    
    //public DbSet<MatchReferee> MatchReferee {  get; set; }    
    public DbSet<News> News { get; set; }
    public DbSet<NewsPictures> NewsPictures { get; set; }
    public DbSet<Picture> Picture { get; set; }
    public DbSet<Player> Player { get; set; }
    //public DbSet<Position> Position {  get; set; }  
    //public DbSet<Referee> Referee {  get; set; }  
    public DbSet<Stadium> Stadium {  get; set; }  
    public DbSet<StadiumPictures> StadiumPictures {  get; set; }  
    //public DbSet<Statistics> Statistics {  get; set; }  
    public DbSet<NewsClub> NewsClubs { get; set; }
    public DbSet<User> User { get; set; }
    //public DbSet<NewsPlayer> NewsPlayers {  get; set; }    
    //public DbSet<PositionPlayer> PositionPlayers { get; set; }
    //public DbSet<MatchDay> Matchday { get; set; }

    public DbSet<RefreshToken> RefreshToken { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<NewsClub>()
            .HasKey(nc => new { nc.NewsID, nc.ClubID });

        modelBuilder.Entity<NewsClub>()
            .HasOne(nc => nc.News)
            .WithMany(n => n.NewsClubs)
            .HasForeignKey(nc => nc.NewsID);

        modelBuilder.Entity<NewsClub>()
            .HasOne(nc => nc.Club)
            .WithMany(c => c.NewsClubs)
            .HasForeignKey(nc => nc.ClubID);



        modelBuilder.Entity<NewsPictures>()
                .HasKey(np => new { np.NewsID, np.PictureID });

        modelBuilder.Entity<NewsPictures>()
            .HasOne(np => np.News)
            .WithMany(n => n.NewsPictures)
            .HasForeignKey(np => np.NewsID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NewsPictures>()
            .HasOne(np => np.Picture)
            .WithMany(p => p.NewsPictures)
            .HasForeignKey(np => np.PictureID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Player>()
            .HasOne(p => p.Picture)
            .WithMany()
            .HasForeignKey(p => p.PictureID)
            .OnDelete(DeleteBehavior.Cascade);

        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.NoAction;
        }


    
}
}
