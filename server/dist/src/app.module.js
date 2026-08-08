"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const rbac_module_1 = require("./rbac/rbac.module");
const profile_module_1 = require("./profile/profile.module");
const settings_module_1 = require("./settings/settings.module");
const departments_module_1 = require("./departments/departments.module");
const designations_module_1 = require("./designations/designations.module");
const employment_types_module_1 = require("./employment-types/employment-types.module");
const employees_module_1 = require("./employees/employees.module");
const attendance_module_1 = require("./attendance/attendance.module");
const shift_module_1 = require("./shift/shift.module");
const leave_module_1 = require("./leave/leave.module");
const members_module_1 = require("./members/members.module");
const notifications_module_1 = require("./notifications/notifications.module");
const payroll_module_1 = require("./payroll/payroll.module");
const pt_module_1 = require("./pt/pt.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const billing_module_1 = require("./billing/billing.module");
const expenses_module_1 = require("./expenses/expenses.module");
const assets_module_1 = require("./assets/assets.module");
const kiosk_module_1 = require("./kiosk/kiosk.module");
const analytics_module_1 = require("./analytics/analytics.module");
const events_module_1 = require("./events/events.module");
const facilities_module_1 = require("./facilities/facilities.module");
const cafe_module_1 = require("./cafe/cafe.module");
const reports_module_1 = require("./reports/reports.module");
const visitor_module_1 = require("./visitor/visitor.module");
const classes_module_1 = require("./classes/classes.module");
const tasks_module_1 = require("./tasks/tasks.module");
const equipment_module_1 = require("./equipment/equipment.module");
const chat_module_1 = require("./chat/chat.module");
const cleaning_module_1 = require("./cleaning/cleaning.module");
const documents_module_1 = require("./documents/documents.module");
const search_module_1 = require("./search/search.module");
const security_module_1 = require("./security/security.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            rbac_module_1.RbacModule,
            profile_module_1.ProfileModule,
            settings_module_1.SettingsModule,
            departments_module_1.DepartmentsModule,
            designations_module_1.DesignationsModule,
            employment_types_module_1.EmploymentTypesModule,
            employees_module_1.EmployeesModule,
            attendance_module_1.AttendanceModule,
            shift_module_1.ShiftModule,
            leave_module_1.LeaveModule,
            members_module_1.MembersModule,
            notifications_module_1.NotificationsModule,
            payroll_module_1.PayrollModule,
            pt_module_1.PtModule,
            subscriptions_module_1.SubscriptionsModule,
            billing_module_1.BillingModule,
            expenses_module_1.ExpensesModule,
            assets_module_1.AssetsModule,
            kiosk_module_1.KioskModule,
            analytics_module_1.AnalyticsModule,
            events_module_1.EventsModule,
            facilities_module_1.FacilitiesModule,
            cafe_module_1.CafeModule,
            reports_module_1.ReportsModule,
            visitor_module_1.VisitorModule,
            classes_module_1.ClassesModule,
            tasks_module_1.TasksModule,
            equipment_module_1.EquipmentModule,
            chat_module_1.ChatModule,
            cleaning_module_1.CleaningModule,
            documents_module_1.DocumentsModule,
            search_module_1.SearchModule,
            security_module_1.SecurityModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map