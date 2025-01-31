using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
namespace API.Services
{
    public class SMS_Service
    {
        private readonly IConfiguration _configuration;

        public SMS_Service(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void SendSms(string toPhoneNumber, string message)
        {
            if (string.IsNullOrEmpty(toPhoneNumber))
            {
                // Log or ignore
                return;
            }
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var fromPhoneNumber = _configuration["Twilio:PhoneNumber"];

            TwilioClient.Init(accountSid, authToken);

            var messageOptions = new CreateMessageOptions(new Twilio.Types.PhoneNumber(toPhoneNumber))
            {
                From = new Twilio.Types.PhoneNumber(fromPhoneNumber),
                Body = message
            };

            MessageResource.Create(messageOptions);
        }
    }
}
