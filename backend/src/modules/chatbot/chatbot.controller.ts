import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
  ) {}

  @Get('health')
  async getChatbotHealth() {
    return await this.chatbotService.checkHealth();
  }

  @Post('chat')
  async askQuestion(
    @Body() body: {
      message?: string;
      language?: string;
    },
  ) {
    return await this.chatbotService.askChatbot(
      body?.message || '',
      body?.language || 'english',
    );
  }
}