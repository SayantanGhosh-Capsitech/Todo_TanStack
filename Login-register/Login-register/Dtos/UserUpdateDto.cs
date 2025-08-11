namespace Login_register.Dtos
{
    public class UserUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }
}
