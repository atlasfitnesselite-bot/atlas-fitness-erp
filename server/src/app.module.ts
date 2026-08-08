import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { ProfileModule } from './profile/profile.module';
import { SettingsModule } from './settings/settings.module';
import { DepartmentsModule } from './departments/departments.module';
import { DesignationsModule } from './designations/designations.module';
import { EmploymentTypesModule } from './employment-types/employment-types.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ShiftModule } from './shift/shift.module';
import { LeaveModule } from './leave/leave.module';
import { MembersModule } from './members/members.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PayrollModule } from './payroll/payroll.module';
import { PtModule } from './pt/pt.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BillingModule } from './billing/billing.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AssetsModule } from './assets/assets.module';
import { KioskModule } from './kiosk/kiosk.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventsModule } from './events/events.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { CafeModule } from './cafe/cafe.module';
import { ReportsModule } from './reports/reports.module';
import { VisitorModule } from './visitor/visitor.module';
import { ClassesModule } from './classes/classes.module';
import { TasksModule } from './tasks/tasks.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ChatModule } from './chat/chat.module';
import { CleaningModule } from './cleaning/cleaning.module';
import { DocumentsModule } from './documents/documents.module';
import { SearchModule } from './search/search.module';
import { SecurityModule } from './security/security.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    RbacModule,
    ProfileModule,
    SettingsModule,
    DepartmentsModule,
    DesignationsModule,
    EmploymentTypesModule,
    EmployeesModule,
    AttendanceModule,
    ShiftModule,
    LeaveModule,
    MembersModule,
    NotificationsModule,
    PayrollModule,
    PtModule,
    SubscriptionsModule,
    BillingModule,
    ExpensesModule,
    AssetsModule,
    KioskModule,
    AnalyticsModule,
    EventsModule,
    FacilitiesModule,
    CafeModule,
    ReportsModule,
    VisitorModule,
    ClassesModule,
    TasksModule,
    EquipmentModule,
    ChatModule,
    CleaningModule,
    DocumentsModule,
    SearchModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
