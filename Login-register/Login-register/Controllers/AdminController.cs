using Login_register.Dtos;
using Login_register.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Login_register.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController: ControllerBase
    {
        private readonly IUserService _userService;

        public AdminController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("get-users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllUsersForAdminAsync();
            return Ok(users);
        }

        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            var result = await _userService.AdminCreateUserAsync(dto);
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        [HttpPut("update-user/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDto dto)
        {
            var result = await _userService.AdminUpdateUserAsync(id, dto);
            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Message);
        }

        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

    }
}
