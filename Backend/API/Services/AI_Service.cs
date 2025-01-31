using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
namespace API.Services
{
    public class AI_Service
    {
        public readonly HttpClient _httpClient;
        public readonly string _apiKey;
        public readonly string _apiUrl;
        public static readonly Dictionary<string, string> _cache = new();

        public AI_Service(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["AISettings:ApiKey"];
            _apiUrl = configuration["AISettings:ApiUrl"];
        }

        public async Task<string> GetAIResponse(string prompt)
        {
            if (_cache.ContainsKey(prompt))
            {
                return _cache[prompt];
            }
            // Kreiranje request body-ja za OpenAI
            var requestBody = new
            {
                model = "o1-mini",
                messages = new[]
                {
                    //new { role = "system", content = "Odgovaraj samo na pitanja o Wwin Premier ligi." },
                    new { role = "user", content = prompt }
                }
            };

            var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");

            // Postavljanje API ključa u header
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var response = await _httpClient.PostAsync(_apiUrl, content);
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                // Ako je API prebukiran, dodaj kašnjenje od 1-2 sekunde
                await Task.Delay(2000);
                return await GetAIResponse(prompt); // Pokušaj ponovo
            }


            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Greška prilikom poziva OpenAI API-ja: {response.ReasonPhrase}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            // Parsiranje odgovora
            dynamic result = JsonConvert.DeserializeObject(responseContent);
            return result.choices[0].message.content.ToString();
        }
    }
}
