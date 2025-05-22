/// <reference lib="dom" />
/// <reference types="node" />
/* eslint-env browser */
import { PredictionResult } from '@shared/types/prediction';

/**
 * Test utility for the email _prediction feature
 * This provides a simple UI in the browser console to test email sending
 * without needing to navigate through the app UI
 */

export function setupEmailTestUI(prediction: PredictionResult) {
  if (typeof window === 'undefined') return;

  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Email test UI is only available in development mode');
    return;
  }

  // Add styles for console output
  const style = document.createElement('style');
  style.textContent = `
    .email-test-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a1a1a;
      color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 350px;
    }
    .email-test-panel h3 {
      margin: 0 0 10px 0;
      color: #61dafb;
    }
    .email-test-panel input {
      width: 100%;
      padding: 8px;
      margin: 5px 0 15px 0;
      border: 1px solid #444;
      background: #2a2a2a;
      color: #fff;
      border-radius: 4px;
    }
    .email-test-panel button {
      background: #61dafb;
      color: #000;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    .email-test-panel button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Create the test panel
  const panel = document.createElement('div');
  panel.className = 'email-test-panel';
  panel.innerHTML = `
    <h3>📧 Test Email Feature</h3>
    <div>
      <div>Recipient Email:</div>
      <input type="email" id="test-email" placeholder="test@example.com" value="test@example.com">
    </div>
    <button id="send-test-email">Send Test Email</button>
    <div id="test-result" style="margin-top: 10px; font-size: 14px;"></div>
  `;
  document.body.appendChild(panel);

  // Add event listener
  const button = panel.querySelector('#send-test-email') as HTMLButtonElement;
  const emailInput = panel.querySelector('#test-email') as HTMLInputElement;
  const resultDiv = panel.querySelector('#test-result') as HTMLDivElement;

  button?.addEventListener('click', async () => {
    if (!button) return;
    
    const email = emailInput.value.trim();
    if (!email) {
      resultDiv.textContent = 'Please enter an email address';
      resultDiv.style.color = '#ff6b6b';
      return;
    }

    button.disabled = true;
    resultDiv.textContent = 'Sending test email...';
    resultDiv.style.color = '#fff';

    try {
      // Dynamically import the email service to avoid loading it in production
      const { sendPredictionEmail } = await import('../services/emailService');
      
      await sendPredictionEmail(prediction, email, {
        subject: '🔮 Test Prediction from Astrobalendar',
        message: 'This is a test email sent from the Astrobalendar development environment.',
      });
      
      resultDiv.textContent = '✅ Test email sent successfully!';
      resultDiv.style.color = '#50fa7b';
    } catch (error) {
      console.error('Failed to send test email:', error);
      resultDiv.textContent = `❌ Error: ${error instanceof Error ? error.message : 'Failed to send email'}`;
      resultDiv.style.color = '#ff6b6b';
    } finally {
      button.disabled = false;
    }
  });

  console.log('%c📧 Email Test Panel is ready!', 'color: #61dafb; font-size: 14px');
  console.log('Use the panel in the bottom-right corner to test the email feature');
}

/**
 * Initialize the email test UI when in development mode
 */
if (process.env.NODE_ENV === 'development') {
  // You can call this function with a mock _prediction object
  // or integrate it with your app's state management
  globalThis.window.setupEmailTestUI = setupEmailTestUI;
}
