# Email Prediction Feature

This feature allows users to send prediction PDFs via email directly from the Astrobalendar application.

## Backend Setup

### Environment Variables

Add these to your backend `.env` file:

```bash
# SMTP Configuration
SMTP_SERVER=smtp.gmail.com  # or your SMTP server
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password  # Use an app password for Gmail
FROM_EMAIL=noreply@astrobalendar.com

# API Security
API_KEYS=your-secure-api-key
```

### Required Dependencies

Ensure these are in your backend's `requirements.txt`:

```
fastapi>=0.68.0
python-multipart>=0.0.5
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-dotenv>=0.19.0
aiohttp>=3.8.0
```

## Frontend Setup

### Environment Variables

Add these to your frontend `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_EMAIL_API_KEY=your-secure-api-key  # Optional: Can use Firebase Auth token instead
```

### Using the Email Feature

1. **Using the EmailPredictionButton Component**

```tsx
import { EmailPredictionButton } from './components/EmailPredictionButton';

// In your component:
<EmailPredictionButton 
  prediction={predictionData}
  buttonText="Email My Prediction"
  variant="contained"
  size="medium"
/>
```

2. **Using the useEmailPrediction Hook**

```tsx
import { useEmailPrediction } from './hooks/useEmailPrediction';

// In your component:
const { sendEmail, isSending, error } = useEmailPrediction({
  onSuccess: () => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});

// Call sendEmail when needed
const handleSendEmail = () => {
  sendEmail(prediction, 'recipient@example.com');
};
```

## Security Considerations

1. **API Key Protection**
   - The backend requires a valid API key in the Authorization header
   - Never expose API keys in client-side code
   - Use environment variables for all sensitive data

2. **File Validation**
   - Only allows file downloads from whitelisted domains
   - Enforces 10MB file size limit
   - Validates email format and content

3. **Rate Limiting**
   - Consider implementing rate limiting in production
   - Monitor for abuse patterns

## Testing

1. **Unit Tests**
   - Test the email service with different input scenarios
   - Test error handling for invalid inputs

2. **Integration Tests**
   - Test the full flow from frontend to backend
   - Verify email delivery in different environments

## Troubleshooting

### Common Issues

1. **SMTP Connection Errors**
   - Verify SMTP server settings
   - Check firewall rules
   - Test with a simple SMTP client

2. **Email Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check server logs for errors

3. **File Download Failures**
   - Verify the file exists at the specified URL
   - Check CORS configuration
   - Verify file size is within limits

## Deployment

1. **Backend**
   - Deploy with environment variables set
   - Enable HTTPS
   - Set up monitoring and logging

2. **Frontend**
   - Build with production environment variables
   - Deploy to a CDN for better performance
   - Set up error tracking

## Maintenance

1. **Monitoring**
   - Monitor email delivery rates
   - Track failed delivery attempts
   - Set up alerts for critical failures

2. **Updates**
   - Keep dependencies up to date
   - Review and update security settings regularly
   - Monitor for deprecated APIs

## Support

For issues or questions, please contact support@astrobalendar.com.
