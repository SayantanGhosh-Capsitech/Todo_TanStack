using Login_register.Models;
using Login_register.Dtos;

namespace Login_register.Services
{
    public interface IUserService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto);

        Task<(bool Success, string Message, string Token, string RefreshToken, User? user)> LoginAsync(LoginDto dto);

        Task<(bool Success, string Message, string Token, string NewRefreshToken)> RefreshTokenAsync(string refreshToken);

        Task<User?> FindByRefreshTokenAsync(string refreshToken);
        Task UpdateUserAsync(User user);
        
        Task<bool> DeleteUserAsync(string id);
        Task<List<UserAdminDto>> GetAllUsersForAdminAsync();

        Task<User?> GetUserByEmailAsync(string email);
        Task CreateUserAsync(User user);

        Task<(bool Success, string Message)> AdminCreateUserAsync(UserCreateDto dto);
        Task<(bool Success, string Message)> AdminUpdateUserAsync(string id, UserUpdateDto dto);


    }
}
