import os
import logging
import aiohttp
import tempfile
from fastapi import HTTPException, status
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import smtplib
from typing import Optional
import urllib.parse
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@astrobalendar.com')
        self.allowed_domains = [
            'astrobalendar.com',
            'akuraastrology.com',
            'firebasestorage.googleapis.com'  # For Firebase Storage URLs
        ]

    def _is_valid_url(self, url: str) -> bool:
        """Validate that the URL is from an allowed domain."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            return any(domain.endswith(allowed) for allowed in self.allowed_domains)
        except Exception as e:
            logger.error(f"URL validation error: {e}")
            return False

    async def _download_file(self, url: str) -> Optional[bytes]:
        """Download file from URL with size limit (10MB)."""
        if not self._is_valid_url(url):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file URL"
            )

        max_size = 10 * 1024 * 1024  # 10MB
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Failed to download file"
                        )
                    
                    # Check content length
                    content_length = int(response.headers.get('content-length', 0))
                    if content_length > max_size:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"File too large. Maximum size is {max_size/1024/1024}MB"
                        )
                    
                    # Read in chunks to handle large files
                    content = b''
                    async for chunk in response.content.iter_chunked(8192):
                        content += chunk
                        if len(content) > max_size:
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"File too large. Maximum size is {max_size/1024/1024}MB"
                            )
                    return content
        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to download file"
            )

    async def send_email_with_attachment(
        self,
        to_email: str,
        subject: str,
        body: str,
        attachment_url: str,
        filename: str = "prediction.pdf"
    ) -> bool:
        """
        Send an email with an attachment from a URL.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body (HTML)
            attachment_url: URL of the file to attach
            filename: Name to give the attachment
            
        Returns:
            bool: True if email was sent successfully
        """
        try:
            # Download the file
            file_content = await self._download_file(attachment_url)
            if not file_content:
                return False

            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attach HTML body
            msg.attach(MIMEText(body, 'html'))
            
            # Attach the file
            part = MIMEApplication(file_content, Name=filename)
            part['Content-Disposition'] = f'attachment; filename="{filename}"'
            msg.attach(part)

            # Send the email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
                
            logger.info(f"Email sent to {to_email} with attachment from {attachment_url}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email"
            )

# Singleton instance
email_service = EmailService()
