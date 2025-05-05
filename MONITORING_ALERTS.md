# AstroBalendar Monitoring & Alerting Setup

## Netlify Alerts
- Enable build failure notifications in Netlify dashboard.
- Configure email or Slack alerts for build status.

## Render Alerts
- Enable error rate and crash alerts in Render dashboard.
- Set up email or webhook notifications for API failures.

## Uptime Monitoring
- Use UptimeRobot or Better Uptime to monitor:
  - Frontend: https://akuraastrology.netlify.app
  - Backend Health: https://api.astrobalendar.onrender.com/api/health
- Configure alerting for downtime or slow response times.

## Security & Logs
- Regularly review logs for unusual activity.
- Rotate secrets and environment variables periodically.
- Ensure HTTPS and security headers are enforced.

## Summary
Setting up these monitoring and alerting tools will help maintain uptime, performance, and security post-deployment.
