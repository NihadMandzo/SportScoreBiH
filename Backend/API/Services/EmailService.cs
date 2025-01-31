using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace API.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                // Kreiraj MailMessage objekat za slanje e-maila
                MailMessage mail = new MailMessage();

                // Postavljanje pošiljaoca e-maila
                mail.From = new MailAddress(_configuration["EmailSettings:SenderEmail"]);

                // Dodaj primaoca
                mail.To.Add(toEmail);

                // Postavi predmet e-maila
                mail.Subject = subject;

                // Postavi telo e-maila
                mail.Body = body;

                // SMTP postavke
                using (SmtpClient smtpServer = new SmtpClient(_configuration["EmailSettings:SmtpServer"]))
                {
                    smtpServer.Port = int.Parse(_configuration["EmailSettings:SmtpPort"]);
                    smtpServer.Credentials = new NetworkCredential(_configuration["EmailSettings:SenderEmail"], _configuration["EmailSettings:SenderPassword"]);
                    smtpServer.EnableSsl = true;

                    // Pošaljite e-mail
                    await smtpServer.SendMailAsync(mail);
                    Console.WriteLine($"E-mail poslan na: {toEmail}");
                }
            }
            catch (Exception ex)
            {
                // Obrada greške u slučaju problema sa slanjem e-maila
                Console.WriteLine($"Greška prilikom slanja e-maila: {ex.Message}");
            }
        }
    }
}
