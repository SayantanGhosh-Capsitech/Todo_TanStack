using Login_register.Dtos;
using Login_register.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
namespace Login_register.Controllers
{
    [Authorize]
    [Route("api/todo")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly IMongoCollection<Todo> _todos;
        private readonly IConfiguration _config;
        public TodoController(IConfiguration config)
        {
            _config = config;
            var client = new MongoClient(_config["MongoDB:ConnectionString"]);
            var db = client.GetDatabase(_config["MongoDB:Database"]);
            _todos = db.GetCollection<Todo>("Todos");
        }

        [HttpGet("get-todo")]
        public async Task<IActionResult> GetTodos()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var todos = await _todos.Find(todo => todo.UserId == userId).ToListAsync();
            return Ok(todos);
        }

        [HttpPost("create")]
        public async Task<IActionResult>CreateTodo([FromBody] TodoDto todoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var todo = new Todo
            { 
                Todotext = todoDto.Todotext,
                UserId = userId
            };
            await _todos.InsertOneAsync(todo);
            return CreatedAtAction(nameof(GetTodos), new { id = todo.ID }, todo);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateTodo([FromBody] TodoDto todoDto, string id)
        {
            var update = Builders<Todo>.Update
                .Set(t => t.Todotext, todoDto.Todotext);
            await _todos.UpdateOneAsync(t => t.ID == id, update);
            return Ok(new { message = "Updated" });

        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTodo(string id)
        {
            await _todos.DeleteOneAsync(t => t.ID == id);
            return Ok(new { massage = "Deleted" });
        }
    }
}
