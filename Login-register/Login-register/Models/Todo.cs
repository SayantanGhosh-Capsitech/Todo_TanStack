using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace Login_register.Models
{
    public class Todo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ID { get; set; } = string.Empty;

        //[BsonElement("title")]
        //public string Title { get; set; } = string.Empty;

        [BsonElement("todotext")]
        public string Todotext { get; set; } = string.Empty;

        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
    }
} 
