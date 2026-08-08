"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtModule = void 0;
const common_1 = require("@nestjs/common");
const pt_controller_1 = require("./pt.controller");
const pt_service_1 = require("./pt.service");
let PtModule = class PtModule {
};
exports.PtModule = PtModule;
exports.PtModule = PtModule = __decorate([
    (0, common_1.Module)({
        controllers: [pt_controller_1.PtController],
        providers: [pt_service_1.PtService],
    })
], PtModule);
//# sourceMappingURL=pt.module.js.map