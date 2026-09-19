import { Module } from '@nestjs/common';
import { ConfigService } from './config';
import { FarmersModule } from './modules/farmers/farmers.module';
import { CentresModule } from './modules/centres/centres.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { QueueModule } from './modules/queue/queue.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { RetailUsersModule } from './modules/retail-users/retail-users.module';

@Module({
  imports: [
    FarmersModule,
    CentresModule,
    BookingsModule,
    TokensModule,
    QueueModule,
    ProcurementModule,
    PaymentsModule,
    NotificationsModule,
    RecommendationsModule,
    ChatbotModule,
    RetailUsersModule,
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppModule {}
