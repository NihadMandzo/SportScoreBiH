using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Picture",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BlobUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Picture", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Stadium",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Latitude = table.Column<float>(type: "real", nullable: false),
                    Longitude = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stadium", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Club",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Info = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Facebook = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Instagram = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PictureID = table.Column<int>(type: "int", nullable: true),
                    StadiumID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Club", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Club_Picture_PictureID",
                        column: x => x.PictureID,
                        principalTable: "Picture",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Club_Stadium_StadiumID",
                        column: x => x.StadiumID,
                        principalTable: "Stadium",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "StadiumPictures",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StadiumID = table.Column<int>(type: "int", nullable: false),
                    PictureID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StadiumPictures", x => x.ID);
                    table.ForeignKey(
                        name: "FK_StadiumPictures_Picture_PictureID",
                        column: x => x.PictureID,
                        principalTable: "Picture",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StadiumPictures_Stadium_StadiumID",
                        column: x => x.StadiumID,
                        principalTable: "Stadium",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Player",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClubID = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PictureID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Player", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Player_Club_ClubID",
                        column: x => x.ClubID,
                        principalTable: "Club",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Player_Picture_PictureID",
                        column: x => x.PictureID,
                        principalTable: "Picture",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    eMail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClubID = table.Column<int>(type: "int", nullable: true),
                    IsEmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    EmailConfirmationToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.ID);
                    table.ForeignKey(
                        name: "FK_User_Club_ClubID",
                        column: x => x.ClubID,
                        principalTable: "Club",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Admin",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admin", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Admin_User_ID",
                        column: x => x.ID,
                        principalTable: "User",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "News",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AdminID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_News", x => x.ID);
                    table.ForeignKey(
                        name: "FK_News_Admin_AdminID",
                        column: x => x.AdminID,
                        principalTable: "Admin",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    NewsID = table.Column<int>(type: "int", nullable: false),
                    Like = table.Column<int>(type: "int", nullable: false),
                    Dislike = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Comment_News_NewsID",
                        column: x => x.NewsID,
                        principalTable: "News",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Comment_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "NewsClub",
                columns: table => new
                {
                    NewsID = table.Column<int>(type: "int", nullable: false),
                    ClubID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsClub", x => new { x.NewsID, x.ClubID });
                    table.ForeignKey(
                        name: "FK_NewsClub_Club_ClubID",
                        column: x => x.ClubID,
                        principalTable: "Club",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_NewsClub_News_NewsID",
                        column: x => x.NewsID,
                        principalTable: "News",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "NewsPictures",
                columns: table => new
                {
                    NewsID = table.Column<int>(type: "int", nullable: false),
                    PictureID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsPictures", x => new { x.NewsID, x.PictureID });
                    table.ForeignKey(
                        name: "FK_NewsPictures_News_NewsID",
                        column: x => x.NewsID,
                        principalTable: "News",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_NewsPictures_Picture_PictureID",
                        column: x => x.PictureID,
                        principalTable: "Picture",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "CommentReaction",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IsLike = table.Column<bool>(type: "bit", nullable: false),
                    CommentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentReaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommentReaction_Comment_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comment",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CommentReaction_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Club_PictureID",
                table: "Club",
                column: "PictureID");

            migrationBuilder.CreateIndex(
                name: "IX_Club_StadiumID",
                table: "Club",
                column: "StadiumID");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_NewsID",
                table: "Comment",
                column: "NewsID");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_UserID",
                table: "Comment",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReaction_CommentId",
                table: "CommentReaction",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReaction_UserId",
                table: "CommentReaction",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_News_AdminID",
                table: "News",
                column: "AdminID");

            migrationBuilder.CreateIndex(
                name: "IX_NewsClub_ClubID",
                table: "NewsClub",
                column: "ClubID");

            migrationBuilder.CreateIndex(
                name: "IX_NewsPictures_PictureID",
                table: "NewsPictures",
                column: "PictureID");

            migrationBuilder.CreateIndex(
                name: "IX_Player_ClubID",
                table: "Player",
                column: "ClubID");

            migrationBuilder.CreateIndex(
                name: "IX_Player_PictureID",
                table: "Player",
                column: "PictureID");

            migrationBuilder.CreateIndex(
                name: "IX_StadiumPictures_PictureID",
                table: "StadiumPictures",
                column: "PictureID");

            migrationBuilder.CreateIndex(
                name: "IX_StadiumPictures_StadiumID",
                table: "StadiumPictures",
                column: "StadiumID");

            migrationBuilder.CreateIndex(
                name: "IX_User_ClubID",
                table: "User",
                column: "ClubID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommentReaction");

            migrationBuilder.DropTable(
                name: "NewsClub");

            migrationBuilder.DropTable(
                name: "NewsPictures");

            migrationBuilder.DropTable(
                name: "Player");

            migrationBuilder.DropTable(
                name: "RefreshToken");

            migrationBuilder.DropTable(
                name: "StadiumPictures");

            migrationBuilder.DropTable(
                name: "Comment");

            migrationBuilder.DropTable(
                name: "News");

            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Club");

            migrationBuilder.DropTable(
                name: "Picture");

            migrationBuilder.DropTable(
                name: "Stadium");
        }
    }
}
