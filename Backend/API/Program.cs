using System.Text;
using System.Text.Json.Serialization;
using API.Data;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sentry;


var builder = WebApplication.CreateBuilder(args);

// Load configuration
var config = builder.Configuration;

// Add services to the container

// 1. Scoped Services (Dependency Injection)
builder.Services.AddScoped<TokenService>();

// 2. JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = config["Jwt:Issuer"],
        ValidAudience = config["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:SecretKey"]))
    };
}).AddCookie()
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    //googleOptions.CallbackPath = "/signin-google";
});

// 3. Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(config.GetConnectionString("DataBaseSQL")));

// 4. Controllers and JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

// 5. CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 6. Swagger for API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



// 7. Optional: Azure Blob Storage Configuration
builder.Services.AddSingleton(sp =>
    new BlobService(
        config["AzureBlobStorage:ConnectionString"],
        config["AzureBlobStorage:ContainerName"]
    ));

builder.WebHost.UseSentry(options =>
{
    options.Dsn = "https://3942f354620eb897c3c924483f05e83e@o4508512212811776.ingest.de.sentry.io/4508512532168784"; 
    options.Debug = true; 
    options.TracesSampleRate = 1.0; 
    options.SendDefaultPii = true; 
    options.AutoSessionTracking = true; 
    options.DiagnosticLevel = SentryLevel.Debug;
});
builder.WebHost.UseSentry();



builder.Services.AddSingleton<EmailService>();
builder.Services.AddTransient<SMS_Service>();


// 8. Optional: HTTP Client Configuration for External APIs
builder.Services.AddHttpClient<AI_Service>(client =>
{
    client.BaseAddress = new Uri(config["AISettings:ApiUrl"]);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {config["AISettings:ApiKey"]}");
});

//Sentry



// Build the app
var app = builder.Build();



// Middleware Configuration

// 1. Swagger for Development Environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. Middleware for Logging Incoming Requests (Optional for Debugging)
app.Use(async (context, next) =>
{
    Console.WriteLine($"Incoming Request: {context.Request.Method} {context.Request.Path}");
    await next();
});

// 3. HTTPS Redirection
app.UseHttpsRedirection();

// 4. Authentication Middleware
app.UseAuthentication();

// 5. CORS Middleware
app.UseCors("AllowAll");

// 6. Authorization Middleware
app.UseAuthorization();

// 7. Map Controllers
app.MapControllers();

app.UseSentryTracing();


// Run the application
app.Run();
