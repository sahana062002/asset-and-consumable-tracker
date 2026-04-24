# Business Requirements Document (BRD)
## Project: Asset & Consumable Tracker PWA

### 1. Executive Summary
The Asset & Consumable Tracker is a specialized inventory management system designed to bridge the gap between office administration and field operations. By leveraging PWA technology, it provides a mobile-first scanning experience for field personnel while maintaining a robust management dashboard for administrators.

### 2. Business Objectives
- **Operational Transparency**: Provide real-time visibility into the physical location of fixed assets and the stock levels of consumables.
- **Efficiency**: Minimize manual data entry through a mobile-optimized barcode scanning interface.
- **Accountability**: Maintain a non-repudiable audit trail of all asset movements and consumption events.
- **Automation**: Reduce administrative overhead by automatically decommissioning assets when depleted.

### 3. Stakeholder Analysis
- **Administrators**: Require high-level monitoring, reporting, and full CRUD control over the system entity database.
- **Field Personnel (Users)**: Require a fast, reliable, and offline-capable interface to record physical changes in the inventory.

### 4. Functional Requirements

#### 4.1 Asset Management
- Support for two distinct asset types:
    - **Fixed Assets**: Tracked by location and translocation history.
    - **Consumable Assets**: Tracked by quantity, initial payload, and drain history.
- Unique Barcode Generation (AST-XXXXXXXX) for every inventory item.

#### 4.2 User Workflows
- **Scanner Interface**: High-speed QR/Barcode scanner integrated into the mobile view.
- **Translocation**: Fixed assets can be moved between locations with mandatory note logging.
- **Drain Sequence**: Consumables can have partial volumes deducted until depletion.
- **Auto-Disposal**: Assets reaching zero quantity are automatically moved to a 'disposed' state and locked from further edits.

#### 4.3 Security & Compliance
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admin and User roles.
- **Secure Authentication**: JWT-based session management with automated logout mechanisms.
- **Data Integrity**: Backend validation of all state transitions (e.g., preventing negative stock).

### 5. Non-Functional Requirements
- **Performance**: Scan-to-display latency under 500ms.
- **Offline Readiness**: PWA manifest and service workers for basic offline visibility of scanned history.
- **Reliability**: Project-wide type safety and standardized linting gates to prevent regression.
