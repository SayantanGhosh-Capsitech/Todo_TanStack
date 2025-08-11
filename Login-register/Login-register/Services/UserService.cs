using Login_register.Dtos;
using Login_register.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System;
using System.Buffers.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Login_register.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoCollection<User> _users; //Represents a MongoDB collection (like a SQL table) where documents of type User are stored.
        private readonly IConfiguration _config; //It allows you to read values from appsettings.json, environment variables, Connection strings, JWT secret keys etc.
        public UserService(IConfiguration config) // Injects the IConfiguration dependency into your service.IConfiguration allows you to read values from appsettings.json or environment variables.
        {
            _config = config; // Injects the IConfiguration dependency into your service. IConfiguration allows you to read values from appsettings.json or environment variables.
            var client = new MongoClient(_config["MongoDB:ConnectionString"]); // Creates a new MongoDB client. It gets the MongoDB connection string from appsettings.json using the key "MongoDb"
            var database = client.GetDatabase(_config["MongoDB:Database"]); // Gets the MongoDB database. It uses the database name from appsettings.json using the key "MongoDb:Database".
            _users = database.GetCollection<User>("Users"); // Gets the "Users" collection from the MongoDB database. This is where user documents will be stored.
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return (false, "User already exists.");
            }
            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);       
            var newUser = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = hashed, // Hash the password before storing it
                Role = "User",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            await _users.InsertOneAsync(newUser);
            return (true, "User registered successfully.");
        }

        public async Task<(bool Success, string Message, string Token, string RefreshToken, User? user)> LoginAsync(LoginDto dto)
        {
            var user = await _users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();
            
                if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password,   user.Password))
                {
                    return (false, "Invalid credentials.", string.Empty, string.Empty, null);
                }
           
            var token = CreateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken; // Assigns the newly generated refresh token to the user's refreshToken property
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1); // valid for 7 days

            await _users.ReplaceOneAsync(u => u.Id == user.Id, user); // It replaces the entire user record where the user's ID matches. This saves the new refresh token and its expiry time to the database.

            return (true, "Login successful.", token, refreshToken, user);
        }
        private string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)); // Generates 64 random bytes using a cryptographically secure RNG. Converts those random bytes into a Base64 - encoded string, which is URL - safe and easy to store / transmit.
        }

        private string CreateJwtToken(User user)
        {
            var claims = new[] // Claims are key-value pairs that represent user information and are used to create the JWT token.These values can be extracted from the token later for authorization or personalization.
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
            };

            //Retrieves the secret from appsettings.json via _config["Jwt:Secret"].Converts the secret into a SymmetricSecurityKey. Uses HmacSha256 to sign the token, making it tamper-proof.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Creates a new JWT token with the specified claims, expiration time, and signing credentials.
            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: creds);

            // Serializes the JWT token to a string format that can be sent to the client.
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<(bool Success, string Message, string Token, string NewRefreshToken)> RefreshTokenAsync(string refreshToken)
        {
            var user = await _users.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync();

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return (false, "Invalid or expired refresh token.", string.Empty, string.Empty);
            }

            var newAccessToken = CreateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _users.ReplaceOneAsync(u => u.Id == user.Id, user);

            return (true, "New token generated.", newAccessToken, newRefreshToken);
        }
        public async Task<User?> FindByRefreshTokenAsync(string refreshToken)
        {
            return await _users.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync();
        }

        public async Task UpdateUserAsync(User user)
        { 
            await _users.ReplaceOneAsync(u => u.Id == user.Id, user);
        }
 
        public async Task<List<UserAdminDto>> GetAllUsersForAdminAsync()
        {
            var users = await _users.Find(_ => true).ToListAsync();

            return users.Select(u => new UserAdminDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            }).ToList();
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var result = await _users.DeleteOneAsync(u => u.Id == id);
            return result.DeletedCount > 0;
        }



        // this below 2 function for creating admin in program.cs
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task CreateUserAsync(User user)
        {
            await _users.InsertOneAsync(user);
        }

        public async Task<(bool Success, string Message)> AdminCreateUserAsync(UserCreateDto dto)
        {
            var existingUser = await _users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();
            if (existingUser != null)
                return (false, "User with this email already exists.");

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var newUser = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = hashed,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _users.InsertOneAsync(newUser);
            return (true, "User created successfully.");
        }
        public async Task<(bool Success, string Message)> AdminUpdateUserAsync(string id, UserUpdateDto dto)
        {
            var user = await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null)
                return (false, "User not found.");

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await _users.ReplaceOneAsync(u => u.Id == id, user);
            return (true, "User updated successfully.");
        }


    }
}
