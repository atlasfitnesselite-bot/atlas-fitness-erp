const fs = require('fs');
let buf = fs.readFileSync('server/prisma/schema.prisma');
const target = Buffer.from('model MemberStatusHistory {');
const idx = buf.lastIndexOf(target);
if (idx !== -1) {
  const str = buf.toString('utf8', 0, buf.length);
  const endIdx = str.indexOf('}', idx);
  if (endIdx !== -1) {
    const cleanStr = str.substring(0, endIdx + 1) + '\n\n';
    
    const newModels = `model MemberMedical {
  id               String   @id @default(uuid())
  memberId         String   @unique
  height           Float?   // cm
  weight           Float?   // kg
  bmi              Float?
  bloodPressure    String?
  bloodGroup       String?
  medicalConditions String?
  allergies        String?
  asthma           Boolean  @default(false)
  diabetes         Boolean  @default(false)
  heartDisease     Boolean  @default(false)
  recentSurgery    String?
  injuries         String?
  medications      String?
  doctorName       String?
  doctorContact    String?
  medicalNotes     String?
  updatedAt        DateTime @updatedAt

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}

model MemberFitnessAssessment {
  id           String   @id @default(uuid())
  memberId     String   @unique
  fitnessGoal  String?  // Weight Loss, Muscle Gain, etc.
  
  // Future Placeholders
  bodyFatPercentage Float?
  muscleMass        Float?
  visceralFat       Float?
  bmr               Float?
  tdee              Float?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}

model MemberMeasurement {
  id           String   @id @default(uuid())
  memberId     String
  chest        Float?
  waist        Float?
  hip          Float?
  neck         Float?
  biceps       Float?
  forearm      Float?
  thigh        Float?
  calf         Float?
  date         DateTime @default(now())
  
  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}

model MemberDocument {
  id           String   @id @default(uuid())
  memberId     String
  type         String   // Aadhaar, Passport, Medical Certificate, etc.
  title        String
  fileUrl      String
  fileSize     Int?
  mimeType     String?
  uploadedById String?
  createdAt    DateTime @default(now())

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}

model MemberNote {
  id           String   @id @default(uuid())
  memberId     String
  category     String   // Reception, Trainer, Medical, Management, Private
  content      String   // Rich text
  authorId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
}`;
    fs.writeFileSync('server/prisma/schema.prisma', cleanStr + newModels);
    console.log('Fixed file');
  }
}
