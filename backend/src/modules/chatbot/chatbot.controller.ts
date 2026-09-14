import { Controller, Get, Post, Body } from '../../common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('health')
  getChatbotHealth() {
    return this.chatbotService.checkHealth();
  }

  @Post('chat')
  askQuestion(@Body() body: any) {
    return this.chatbotService.askChatbot(body?.message || '', body?.language || 'english');
  }
}
