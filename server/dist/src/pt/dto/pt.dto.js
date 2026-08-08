"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteSessionDto = exports.CreateCommissionDto = exports.CreateMeasurementDto = exports.CreateFitnessPlanDto = exports.BookSessionDto = exports.FitnessPlanType = void 0;
const class_validator_1 = require("class-validator");
var FitnessPlanType;
(function (FitnessPlanType) {
    FitnessPlanType["WORKOUT"] = "WORKOUT";
    FitnessPlanType["DIET"] = "DIET";
})(FitnessPlanType || (exports.FitnessPlanType = FitnessPlanType = {}));
class BookSessionDto {
    trainerId;
    memberId;
    date;
    startTime;
    endTime;
    notes;
}
exports.BookSessionDto = BookSessionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BookSessionDto.prototype, "trainerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BookSessionDto.prototype, "memberId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BookSessionDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BookSessionDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BookSessionDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BookSessionDto.prototype, "notes", void 0);
class CreateFitnessPlanDto {
    memberId;
    trainerId;
    type;
    title;
    content;
}
exports.CreateFitnessPlanDto = CreateFitnessPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFitnessPlanDto.prototype, "memberId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFitnessPlanDto.prototype, "trainerId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FitnessPlanType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFitnessPlanDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFitnessPlanDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreateFitnessPlanDto.prototype, "content", void 0);
class CreateMeasurementDto {
    chest;
    waist;
    hip;
    biceps;
    thigh;
    calf;
    neck;
    forearm;
}
exports.CreateMeasurementDto = CreateMeasurementDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "chest", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "waist", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "hip", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "biceps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "thigh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "calf", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "neck", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMeasurementDto.prototype, "forearm", void 0);
class CreateCommissionDto {
    trainerId;
    sourceId;
    amount;
}
exports.CreateCommissionDto = CreateCommissionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "trainerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "sourceId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateCommissionDto.prototype, "amount", void 0);
class CompleteSessionDto {
    duration;
    exercisesCompleted;
    intensity;
    clientFeedback;
    signatureUrl;
}
exports.CompleteSessionDto = CompleteSessionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CompleteSessionDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteSessionDto.prototype, "exercisesCompleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteSessionDto.prototype, "intensity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteSessionDto.prototype, "clientFeedback", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteSessionDto.prototype, "signatureUrl", void 0);
//# sourceMappingURL=pt.dto.js.map