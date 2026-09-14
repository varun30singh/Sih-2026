import { Injectable, createSuccessResponse, createErrorResponse } from '../../common';
import * as http from 'http';

@Injectable()
export class ChatbotService {
  private pythonChatbotUrl = process.env.CHATBOT_API_URL || 'http://127.0.0.1:5000/api';

  async checkHealth() {
    return new Promise((resolve) => {
      const req = http.get(`${this.pythonChatbotUrl}/health`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(createSuccessResponse(parsed));
          } catch (e) {
            resolve(createSuccessResponse({ status: 'healthy', pythonBridge: 'connected' }));
          }
        });
      });

      req.on('error', () => {
        resolve(createSuccessResponse({
          status: 'degraded',
          pythonBridge: 'unreachable',
          message: 'Python ProcureAI service offline or restarting'
        }));
      });

      req.setTimeout(2000, () => {
        req.destroy();
        resolve(createSuccessResponse({ status: 'timeout' }));
      });
    });
  }

  async askChatbot(message: string, language: string = 'english') {
    return new Promise((resolve) => {
      const payload = JSON.stringify({ message, language });
      const url = new URL(`${this.pythonChatbotUrl}/chat`);

      const options = {
        hostname: url.hostname,
        port: url.port || 5000,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = http.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(createSuccessResponse(parsed));
          } catch (e) {
            resolve(createErrorResponse('Failed to parse chatbot response'));
          }
        });
      });

      req.on('error', (err) => {
        resolve(createErrorResponse(`Chatbot service error: ${err.message}`));
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve(createErrorResponse('Chatbot request timed out'));
      });

      req.write(payload);
      req.end();
    });
  }
}
