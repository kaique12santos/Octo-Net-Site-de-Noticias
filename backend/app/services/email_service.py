import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self) -> None:
        self.host = os.getenv("SMTP_HOST")
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.user = os.getenv("SMTP_USER")
        self.password = os.getenv("SMTP_PASSWORD")
        self.sender = os.getenv("SMTP_FROM", "nao-responda@octo-net.local")

    def send(self, to: str, subject: str, body: str) -> None:
        if not self.host:
            logger.warning("SMTP nao configurado - e-mail para %s NAO enviado:\n%s", to, body)
            return

        msg = EmailMessage()
        msg["From"] = self.sender
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)

        try:
            with smtplib.SMTP(self.host, self.port, timeout=10) as smtp:
                smtp.starttls()
                if self.user:
                    smtp.login(self.user, self.password)
                smtp.send_message(msg)
        except (smtplib.SMTPException, OSError) as erro:
            logger.error("Falha ao enviar e-mail via SMTP: %s", erro)
