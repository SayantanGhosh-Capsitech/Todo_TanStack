using System.ComponentModel.DataAnnotations;
namespace Login_register.Dtos
{
    public class TodoDto
    {
        //[Required(ErrorMessage = "Title is required.")]
        //[MinLength(2)]
        //[MaxLength(20)]
        //public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Task is required.")]
        [MinLength(5)]
        [MaxLength(100)]
        public string Todotext { get; set; } = string.Empty;

    }
}
