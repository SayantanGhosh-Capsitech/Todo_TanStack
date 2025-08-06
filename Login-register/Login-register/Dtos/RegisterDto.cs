using System.ComponentModel.DataAnnotations;

namespace Login_register.Dtos
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [MinLength(5)]
        [MaxLength(20)]
        public string Password { get; set; } = string.Empty;
    }
}
