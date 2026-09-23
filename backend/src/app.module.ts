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
import { StockistsModule } from './modules/stockists/stockists.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { ProcurementCentresModule } from './modules/procurement-centres/procurement-centres.module';
import { SlotsModule } from './modules/slots/slots.module';
import { ProcurementsModule } from './modules/procurements/procurements.module';
import { CropsModule } from './modules/crops/crops.module';
import { BrokersModule } from './modules/brokers/brokers.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { OrdersModule } from './modules/orders/orders.module';

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
    StockistsModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    AuditLogModule,
    ProcurementCentresModule,
    BrokersModule,
    BuyersModule,
    OrdersModule,
    SlotsModule,
    ProcurementsModule,
    CropsModule,
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppModule {}
