//using System.Net.Http;
//using System.Text.Json;
//using System.Threading.Tasks;

//namespace API.Services
//{
//    public class CaptchaService
//    {
//        public readonly HttpClient _httpClient;
//        public readonly string _secretKey;  // Zameni sa tvojim Google reCAPTCHA secret ključem

//        public CaptchaService(HttpClient httpClient,IConfiguration configuration)
//        {
//            _httpClient = httpClient;
//            _secretKey = configuration["CaptchaSettings:SecretKey"];
//        }

//        public async Task<bool> VerifyCaptchaAsync(string captchaResponse)
//        {
//            if (string.IsNullOrWhiteSpace(captchaResponse))
//            {
//                return false;
//            }
//            try
//            {
//                var url = "https://www.google.com/recaptcha/api/siteverify";
//                var response = await _httpClient.PostAsync(url, new FormUrlEncodedContent(new[]
//                {
//            new KeyValuePair<string, string>("secret", _secretKey),
//            new KeyValuePair<string, string>("response", captchaResponse)
//            }));

//                if (!response.IsSuccessStatusCode)
//                {
//                    return false; // Ako odgovor nije uspešan, CAPTCHA nije validna
//                }

//                var jsonResponse = await response.Content.ReadAsStringAsync();
//                var captchaVerificationResult = JsonSerializer.Deserialize<CaptchaVerificationResult>(jsonResponse);

//                return captchaVerificationResult?.Success ?? false;
//            }
//            catch (Exception ex)
//            {
//                // Loguj grešku ovde
//                Console.WriteLine($"Captcha verification failed: {ex.Message}");
//                return false;
//            }
//        }

//        private class CaptchaVerificationResult
//        {
//            public bool Success { get; set; }
//            public string ChallengeTs { get; set; }
//            public string Hostname { get; set; }
//            public string[] ErrorCodes { get; set; }
//        }
//    }
//}
