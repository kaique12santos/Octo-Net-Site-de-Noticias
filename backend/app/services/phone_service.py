import logging
import os

import httpx

logger = logging.getLogger(__name__)

TWILIO_MESSAGES_URL = "https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"

class PhoneService:
    def __init__(self) -> None:
        self.sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.user = os.getenv("TWILIO_API_KEY_SID") or self.sid
        self.secret = os.getenv("TWILIO_API_KEY_SECRET") or os.getenv("TWILIO_AUTH_TOKEN")
        self.sender = os.getenv("TWILIO_FROM_NUMBER")

    def send_sms(self, to: str, body: str) -> None:
        if not (self.sid and self.secret and self.sender):
            logger.warning("Twilio nao configurado - SMS para %s NAO enviado: %s", to, body)
            return

        try:
            resposta = httpx.post(
                TWILIO_MESSAGES_URL.format(sid=self.sid),
                auth=(self.user, self.secret),
                data={"To": to, "From": self.sender, "Body": body},
                timeout=10.0,
            )
        except httpx.RequestError as erro:
            logger.error("Falha de rede ao falar com a Twilio: %s", erro)
            return

        if resposta.is_error:
            logger.error(
                "Twilio recusou o envio (HTTP %s): %s",
                resposta.status_code,
                resposta.text,
            )
