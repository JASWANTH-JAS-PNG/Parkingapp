using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using ParkingLot.Data;
using Serilog;
using ParkingAPI.Interfaces;
using ParkingAPI.Repositories;
using ParkingAPI.Services;
using ParkingAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Allow any origin so the hosted frontend (Vercel/Netlify) can reach us
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Host.UseSerilog((context, configuration) =>
    configuration
        .MinimumLevel.Information()
        .WriteTo.Console()
        .WriteTo.File("logs/parking-api-.txt", rollingInterval: RollingInterval.Day));

builder.Services.AddControllers();

// Use PostgreSQL when Railway env vars are present, otherwise SQL Server locally
var pgHost = Environment.GetEnvironmentVariable("PGHOST");
if (pgHost is not null)
{
    var npgsqlConn =
        $"Host={pgHost};" +
        $"Port={Environment.GetEnvironmentVariable("PGPORT") ?? "5432"};" +
        $"Database={Environment.GetEnvironmentVariable("PGDATABASE")};" +
        $"Username={Environment.GetEnvironmentVariable("PGUSER")};" +
        $"Password={Environment.GetEnvironmentVariable("PGPASSWORD")};" +
        "SSL Mode=Require;Trust Server Certificate=true";

    builder.Services.AddDbContext<ParkingLotDbContext>(opts =>
        opts.UseNpgsql(npgsqlConn));
}
else
{
    builder.Services.AddDbContext<ParkingLotDbContext>(opts =>
        opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

builder.Services.AddScoped<IParkingLotRepository, ParkingLotRepository>();
builder.Services.AddScoped<IParkingSlotsRepository, ParkingSlotsRepository>();
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IBookingsRepository, BookingsRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ParkingLotDbContext>();
    if (pgHost is not null)
        context.Database.EnsureCreated();   // PostgreSQL: create schema from model
    else
        context.Database.Migrate();          // SQL Server: run EF migrations
}

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("AllowFrontend");
app.MapOpenApi();
app.MapScalarApiReference();
app.MapControllers();

// Railway injects PORT; fall back to 5186 for local dev
var port = Environment.GetEnvironmentVariable("PORT") ?? "5186";
app.Run($"http://0.0.0.0:{port}");
