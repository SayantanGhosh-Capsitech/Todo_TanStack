using Login_register.Models;
using Login_register.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT key from configuration
var jwtKey = builder.Configuration["Jwt:Secret"];

// Register services
builder.Services.AddScoped<IUserService, UserService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") 
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // Allow cookies
        });
});

// Add controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Read JWT from cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Look for JWT in a cookie named "jwt"
                var accessToken = context.Request.Cookies["jwt"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };

        options.TokenValidationParameters = new TokenValidationParameters 
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role,
        };
    });
//Swagger
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen(options =>
//{
//    options.SwaggerDoc("v1", new() { Title = "BackendDotNet API", Version = "v1" });

//    // JWT Bearer Authorization Setup
//    options.AddSecurityDefinition("Bearer", new()
//    {
//        Name = "Authorization",
//        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
//        Scheme = "Bearer",
//        BearerFormat = "JWT",
//        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
//        Description = "Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \"Bearer eyJhbGci...\"",
//    });

//    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
//    {
//        {
//            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
//            {
//                Reference = new Microsoft.OpenApi.Models.OpenApiReference
//                {
//                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            new string[] {}
//        }
//    });
//});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

    var existingAdmin = await userService.GetUserByEmailAsync("admin@example.com");
    if (existingAdmin == null)
    {
        var adminUser = new User
        {
            Name = "SuperAdmin",
            Email = "admin@example.com",
            Password = BCrypt.Net.BCrypt.HashPassword("admin123456"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await userService.CreateUserAsync(adminUser);
    }
}

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


//app.UseHttpsRedirection();


// Enable CORS
app.UseCors("AllowSpecificOrigin");

// Enable authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

// Map endpoints
app.MapControllers();

// Run the app
app.Run();
  