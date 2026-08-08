"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmploymentTypesModule = void 0;
const common_1 = require("@nestjs/common");
const employment_types_controller_1 = require("./employment-types.controller");
const employment_types_service_1 = require("./employment-types.service");
const prisma_module_1 = require("../prisma/prisma.module");
let EmploymentTypesModule = class EmploymentTypesModule {
};
exports.EmploymentTypesModule = EmploymentTypesModule;
exports.EmploymentTypesModule = EmploymentTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [employment_types_controller_1.EmploymentTypesController],
        providers: [employment_types_service_1.EmploymentTypesService],
        exports: [employment_types_service_1.EmploymentTypesService],
    })
], EmploymentTypesModule);
//# sourceMappingURL=employment-types.module.js.map