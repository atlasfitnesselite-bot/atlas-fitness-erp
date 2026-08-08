# Attendance Kiosk Execution Plan

- [x] **1. Database Schema Updates (Prisma)**
  - [x] Add `hashedPin` to `Employee` model.
  - [x] Create `KioskDevice` model (device name, branch, status, managerExitPin).
  - [x] Create `KioskSession` model (device token, expiresAt).
  - [x] Generate and run Prisma migration.

- [x] **2. Backend Security & Kiosk Session**
  - [x] Create a migration script to generate secure hashed PINs for all existing employees.
  - [x] Create `KioskAuthGuard` to validate Kiosk tokens.
  - [x] Create `POST /auth/kiosk/launch` endpoint to register a session for a `KioskDevice`.
  - [x] Update Attendance APIs (Check-in, Check-out, etc.) to use `KioskAuthGuard` and validate hashed PINs.

- [x] **3. Frontend Architecture & Routing**
  - [x] Update `App.jsx` to map `/kiosk` to a new `KioskLayout`.
  - [x] Implement `useKioskStore` for handling `kioskToken`, device state, and offline synchronization queue.
  - [x] Update `AttendanceDashboard` "Launch Kiosk" button to call the launch API and configure the device.

- [x] **4. Dedicated Kiosk UI**
  - [x] `KioskLayout.jsx`: Fullscreen, isolated layout.
  - [x] `KioskHome.jsx`: Digital numpad, clock, shift info.
  - [x] `KioskSuccess.jsx`: Animated success screen (auto-return in 5s).
  - [x] Implement hidden Manager Exit button + Manager PIN modal to close the kiosk session.

- [x] **5. Offline Synchronization Architecture**
  - [x] Implement an offline queue in `useKioskStore` (persist to localStorage/IndexedDB).
  - [x] Create `OfflineSyncManager.jsx` component that listens for `window.addEventListener('online')` and processes the queue sequentially.
  - [x] Update Backend to accept an optional `offlineTimestamp` field to retroactively clock the event at the time it occurred.
