using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using ParkingLot.Data;
using Serilog;
using ParkingAPI.Interfaces;
using ParkingAPI.Repositories;
using ParkingAPI.Services;
using ParkingAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Host.UseSerilog((context, configuration) =>
    configuration
        .MinimumLevel.Information()
        .WriteTo.Console()
        .WriteTo.File("logs/parking-api-.txt", rollingInterval: RollingInterval.Day));

builder.Services.AddControllers();

builder.Services.AddDbContext<ParkingLotDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    context.Database.Migrate();
}

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("AllowFrontend");
app.MapOpenApi();
app.MapScalarApiReference();
app.MapControllers();
app.Run();
