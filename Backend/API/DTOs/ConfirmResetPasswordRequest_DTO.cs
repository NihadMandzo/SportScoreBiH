namespace API.DTOs
{
    public class ConfirmResetPasswordRequest_DTO
    {
        public  string Token{ get; set; }
        public  string NewPassword{ get; set; }
    }
}
