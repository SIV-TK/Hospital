// Hospital Management System Database Schema
// Firebase Firestore Collections and Document Structure

export interface HospitalDatabase {
  // User Management Collections
  users: UserCollection;
  patients: PatientCollection;
  doctors: DoctorCollection;
  nurses: NurseCollection;
  pharmacists: PharmacistCollection;
  administrators: AdministratorCollection;
  
  // Medical Operations Collections
  appointments: AppointmentCollection;
  consultations: ConsultationCollection;
  prescriptions: PrescriptionCollection;
  labTests: LabTestCollection;
  labResults: LabResultCollection;
  medicalRecords: MedicalRecordCollection;
  
  // Department Collections
  departments: DepartmentCollection;
  rooms: RoomCollection;
  beds: BedCollection;
  equipment: EquipmentCollection;
  
  // Pharmacy Collections
  medications: MedicationCollection;
  inventory: InventoryCollection;
  medicationDispensing: MedicationDispensingCollection;
  
  // Billing & Finance Collections
  billing: BillingCollection;
  payments: PaymentCollection;
  insurance: InsuranceCollection;
  
  // AI & Analytics Collections
  aiAnalysis: AIAnalysisCollection;
  patientEducation: PatientEducationCollection;
  hospitalAnalytics: HospitalAnalyticsCollection;
  
  // Communication Collections
  notifications: NotificationCollection;
  messages: MessageCollection;
  emergencyAlerts: EmergencyAlertCollection;
}

// ============ USER MANAGEMENT ============

interface UserCollection {
  [userId: string]: {
    id: string;
    email: string;
    role: 'patient' | 'doctor' | 'nurse' | 'pharmacist' | 'admin' | 'receptionist';
    firstName: string;
    lastName: string;
    phone: string;
    address: Address;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    profileImage?: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    preferences: UserPreferences;
    emergencyContact: EmergencyContact;
  };
}

interface PatientCollection {
  [patientId: string]: {
    id: string;
    userId: string;
    mrn: string; // Medical Record Number
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContacts: EmergencyContact[];
    insuranceInfo: InsuranceInfo;
    primaryDoctor?: string;
    admissionHistory: AdmissionRecord[];
    vitalSigns: VitalSigns[];
    medications: CurrentMedication[];
    appointments: string[]; // appointment IDs
    labResults: string[]; // lab result IDs
    medicalHistory: MedicalHistoryItem[];
    createdAt: string;
    updatedAt: string;
  };
}

interface DoctorCollection {
  [doctorId: string]: {
    id: string;
    userId: string;
    licenseNumber: string;
    specialization: string[];
    department: string;
    yearsOfExperience: number;
    education: Education[];
    certifications: Certification[];
    schedule: DoctorSchedule[];
    patients: string[]; // patient IDs
    consultationFee: number;
    rating: number;
    reviews: Review[];
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface NurseCollection {
  [nurseId: string]: {
    id: string;
    userId: string;
    licenseNumber: string;
    department: string;
    shift: 'day' | 'night' | 'rotating';
    specializations: string[];
    assignedPatients: string[];
    schedule: NurseSchedule[];
    createdAt: string;
    updatedAt: string;
  };
}

interface PharmacistCollection {
  [pharmacistId: string]: {
    id: string;
    userId: string;
    licenseNumber: string;
    specializations: string[];
    shift: 'day' | 'night' | 'rotating';
    prescriptionsHandled: string[];
    createdAt: string;
    updatedAt: string;
  };
}

interface AdministratorCollection {
  [adminId: string]: {
    id: string;
    userId: string;
    role: 'super_admin' | 'department_admin' | 'finance_admin' | 'hr_admin';
    permissions: string[];
    department?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ============ MEDICAL OPERATIONS ============

interface AppointmentCollection {
  [appointmentId: string]: {
    id: string;
    patientId: string;
    doctorId: string;
    department: string;
    type: 'consultation' | 'follow_up' | 'emergency' | 'surgery' | 'lab_test';
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    scheduledDateTime: string;
    duration: number; // minutes
    reason: string;
    notes?: string;
    roomNumber?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    remindersSent: boolean;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
  };
}

interface ConsultationCollection {
  [consultationId: string]: {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    chiefComplaint: string;
    historyOfPresentIllness: string;
    physicalExamination: PhysicalExam;
    vitalSigns: VitalSigns;
    diagnosis: Diagnosis[];
    treatmentPlan: TreatmentPlan;
    prescriptions: string[]; // prescription IDs
    labTestsOrdered: string[]; // lab test IDs
    followUpRequired: boolean;
    followUpDate?: string;
    consultationNotes: string;
    aiInsights?: AIConsultationInsights;
    duration: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PrescriptionCollection {
  [prescriptionId: string]: {
    id: string;
    patientId: string;
    doctorId: string;
    consultationId?: string;
    medications: PrescribedMedication[];
    diagnosis: string;
    instructions: string;
    status: 'pending' | 'ai_analyzed' | 'pharmacist_reviewed' | 'prepared' | 'ready' | 'dispensed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    aiAnalysis?: AIPharmacyAnalysis;
    pharmacistNotes?: string;
    dispensedBy?: string;
    dispensedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface LabTestCollection {
  [labTestId: string]: {
    id: string;
    patientId: string;
    doctorId: string;
    consultationId?: string;
    testType: string;
    testName: string;
    category: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'cardiac' | 'other';
    urgency: 'routine' | 'urgent' | 'stat';
    status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
    instructions: string;
    sampleCollectedAt?: string;
    sampleCollectedBy?: string;
    estimatedCompletionTime?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface LabResultCollection {
  [resultId: string]: {
    id: string;
    labTestId: string;
    patientId: string;
    testName: string;
    results: LabTestResult[];
    normalRanges: LabNormalRange[];
    interpretation: string;
    criticalValues: boolean;
    aiAnalysis?: AILabAnalysis;
    reviewedBy: string;
    reviewedAt: string;
    reportGenerated: boolean;
    reportUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface MedicalRecordCollection {
  [recordId: string]: {
    id: string;
    patientId: string;
    type: 'admission' | 'discharge' | 'surgery' | 'emergency' | 'outpatient';
    admissionDate?: string;
    dischargeDate?: string;
    department: string;
    attendingPhysician: string;
    diagnosis: Diagnosis[];
    procedures: MedicalProcedure[];
    medications: PrescribedMedication[];
    labResults: string[];
    imagingResults: string[];
    progressNotes: ProgressNote[];
    dischargeInstructions?: string;
    followUpInstructions?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ============ DEPARTMENT & FACILITY ============

interface DepartmentCollection {
  [departmentId: string]: {
    id: string;
    name: string;
    description: string;
    headOfDepartment: string;
    location: string;
    contactNumber: string;
    email: string;
    services: string[];
    doctors: string[];
    nurses: string[];
    equipment: string[];
    rooms: string[];
    operatingHours: OperatingHours;
    emergencyContact: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface RoomCollection {
  [roomId: string]: {
    id: string;
    roomNumber: string;
    department: string;
    type: 'patient_room' | 'icu' | 'operating_room' | 'emergency' | 'consultation' | 'lab';
    capacity: number;
    currentOccupancy: number;
    beds: string[];
    equipment: string[];
    status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    features: string[];
    dailyRate?: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface BedCollection {
  [bedId: string]: {
    id: string;
    bedNumber: string;
    roomId: string;
    type: 'standard' | 'icu' | 'pediatric' | 'maternity';
    status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    currentPatient?: string;
    admissionDate?: string;
    features: string[];
    dailyRate: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface EquipmentCollection {
  [equipmentId: string]: {
    id: string;
    name: string;
    type: string;
    model: string;
    manufacturer: string;
    serialNumber: string;
    department: string;
    location: string;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    purchaseDate: string;
    warrantyExpiry?: string;
    cost: number;
    createdAt: string;
    updatedAt: string;
  };
}

// ============ PHARMACY & INVENTORY ============

interface MedicationCollection {
  [medicationId: string]: {
    id: string;
    name: string;
    genericName: string;
    brandNames: string[];
    category: string;
    dosageForm: string;
    strength: string[];
    manufacturer: string;
    description: string;
    indications: string[];
    contraindications: string[];
    sideEffects: string[];
    interactions: string[];
    storageRequirements: string;
    prescriptionRequired: boolean;
    controlledSubstance: boolean;
    fdaApproved: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface InventoryCollection {
  [inventoryId: string]: {
    id: string;
    medicationId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitPrice: number;
    supplier: string;
    receivedDate: string;
    location: string;
    status: 'available' | 'expired' | 'recalled' | 'damaged';
    minimumStockLevel: number;
    reorderLevel: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface MedicationDispensingCollection {
  [dispensingId: string]: {
    id: string;
    prescriptionId: string;
    patientId: string;
    pharmacistId: string;
    medicationId: string;
    quantityDispensed: number;
    batchNumber: string;
    dispensedAt: string;
    patientInstructions: string;
    counselingProvided: boolean;
    patientSignature?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ============ BILLING & FINANCE ============

interface BillingCollection {
  [billId: string]: {
    id: string;
    patientId: string;
    invoiceNumber: string;
    consultationFees: BillItem[];
    procedureFees: BillItem[];
    medicationFees: BillItem[];
    labTestFees: BillItem[];
    roomCharges: BillItem[];
    otherCharges: BillItem[];
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
    dueDate: string;
    insuranceClaim?: InsuranceClaim;
    paymentHistory: string[];
    createdAt: string;
    updatedAt: string;
  };
}

interface PaymentCollection {
  [paymentId: string]: {
    id: string;
    billId: string;
    patientId: string;
    amount: number;
    paymentMethod: 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'check';
    transactionId?: string;
    paymentDate: string;
    processedBy: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface InsuranceCollection {
  [insuranceId: string]: {
    id: string;
    patientId: string;
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    policyHolderName: string;
    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
    effectiveDate: string;
    expiryDate: string;
    copayAmount: number;
    deductible: number;
    coverageDetails: CoverageDetail[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// ============ AI & ANALYTICS ============

interface AIAnalysisCollection {
  [analysisId: string]: {
    id: string;
    type: 'consultation' | 'lab_result' | 'prescription' | 'diagnosis' | 'treatment';
    entityId: string; // ID of the entity being analyzed
    patientId: string;
    analysis: any; // Flexible structure for different AI analysis types
    confidence: number;
    recommendations: string[];
    warnings: string[];
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    actionsTaken?: string[];
  };
}

interface PatientEducationCollection {
  [educationId: string]: {
    id: string;
    patientId: string;
    topic: string;
    content: string;
    type: 'medication' | 'condition' | 'procedure' | 'lifestyle' | 'prevention';
    format: 'text' | 'video' | 'infographic' | 'audio';
    language: string;
    readingLevel: 'basic' | 'intermediate' | 'advanced';
    personalizedFor: string[];
    viewedAt?: string;
    completedAt?: string;
    feedback?: PatientFeedback;
    createdAt: string;
    updatedAt: string;
  };
}

interface HospitalAnalyticsCollection {
  [analyticsId: string]: {
    id: string;
    date: string;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    patientMetrics: PatientMetrics;
    departmentMetrics: DepartmentMetrics[];
    financialMetrics: FinancialMetrics;
    staffMetrics: StaffMetrics;
    qualityMetrics: QualityMetrics;
    operationalMetrics: OperationalMetrics;
    createdAt: string;
  };
}

// ============ COMMUNICATION ============

interface NotificationCollection {
  [notificationId: string]: {
    id: string;
    recipientId: string;
    recipientType: 'patient' | 'doctor' | 'nurse' | 'pharmacist' | 'admin';
    type: 'appointment' | 'lab_result' | 'prescription' | 'billing' | 'emergency' | 'system';
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    channel: 'in_app' | 'email' | 'sms' | 'push';
    scheduledFor?: string;
    sentAt?: string;
    readAt?: string;
    actionRequired: boolean;
    actionUrl?: string;
    createdAt: string;
  };
}

interface MessageCollection {
  [messageId: string]: {
    id: string;
    senderId: string;
    recipientId: string;
    subject?: string;
    content: string;
    type: 'direct' | 'consultation' | 'emergency' | 'system';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'sent' | 'delivered' | 'read';
    attachments?: MessageAttachment[];
    threadId?: string;
    sentAt: string;
    readAt?: string;
    createdAt: string;
  };
}

interface EmergencyAlertCollection {
  [alertId: string]: {
    id: string;
    type: 'code_blue' | 'code_red' | 'code_yellow' | 'mass_casualty' | 'system_failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    description: string;
    triggeredBy: string;
    status: 'active' | 'acknowledged' | 'resolved';
    respondingStaff: string[];
    acknowledgedBy?: string[];
    resolvedBy?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ============ SUPPORTING INTERFACES ============

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'auto';
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointments: boolean;
  labResults: boolean;
  prescriptions: boolean;
  billing: boolean;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: string;
  expiryDate: string;
}

interface AdmissionRecord {
  admissionDate: string;
  dischargeDate?: string;
  department: string;
  reason: string;
  attendingPhysician: string;
}

interface VitalSigns {
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedAt: string;
  recordedBy: string;
}

interface CurrentMedication {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
}

interface MedicalHistoryItem {
  condition: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
  specialization?: string;
}

interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
}

interface DoctorSchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxAppointments: number;
}

interface NurseSchedule {
  date: string;
  shift: 'day' | 'night';
  startTime: string;
  endTime: string;
  department: string;
}

interface Review {
  patientId: string;
  rating: number;
  comment: string;
  date: string;
}

interface PhysicalExam {
  general: string;
  cardiovascular: string;
  respiratory: string;
  abdominal: string;
  neurological: string;
  musculoskeletal: string;
  skin: string;
  other?: string;
}

interface Diagnosis {
  code: string; // ICD-10 code
  description: string;
  type: 'primary' | 'secondary';
  confidence: number;
  aiSuggested: boolean;
}

interface TreatmentPlan {
  medications: PrescribedMedication[];
  procedures: string[];
  lifestyle: string[];
  followUp: string;
  referrals: string[];
}

interface PrescribedMedication {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refills: number;
}

interface AIConsultationInsights {
  suggestedDiagnoses: Diagnosis[];
  recommendedTests: string[];
  drugInteractions: string[];
  riskFactors: string[];
  confidence: number;
}

interface AIPharmacyAnalysis {
  drugInteractions: string[];
  allergicReactions: string[];
  dosageRecommendations: string[];
  patientEducation: string[];
  monitoringRequirements: string[];
  confidence: number;
}

interface LabTestResult {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
}

interface LabNormalRange {
  parameter: string;
  minValue: number;
  maxValue: number;
  unit: string;
  ageGroup?: string;
  gender?: string;
}

interface AILabAnalysis {
  interpretation: string;
  clinicalSignificance: string;
  recommendations: string[];
  criticalValues: string[];
  trendAnalysis?: string;
  confidence: number;
}

interface MedicalProcedure {
  code: string; // CPT code
  name: string;
  description: string;
  performedBy: string;
  performedAt: string;
  duration: number;
  complications?: string[];
  outcome: string;
}

interface ProgressNote {
  date: string;
  time: string;
  author: string;
  type: 'physician' | 'nurse' | 'therapist' | 'other';
  note: string;
  vitalSigns?: VitalSigns;
}

interface OperatingHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

interface InsuranceClaim {
  claimNumber: string;
  submittedDate: string;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'partial';
  approvedAmount?: number;
  denialReason?: string;
  processedDate?: string;
}

interface CoverageDetail {
  service: string;
  coveragePercentage: number;
  copayAmount: number;
  deductibleApplies: boolean;
  annualLimit?: number;
}

interface PatientFeedback {
  rating: number;
  helpful: boolean;
  comments?: string;
  submittedAt: string;
}

interface PatientMetrics {
  totalPatients: number;
  newPatients: number;
  admissions: number;
  discharges: number;
  emergencyVisits: number;
  outpatientVisits: number;
  averageStayDuration: number;
  occupancyRate: number;
}

interface DepartmentMetrics {
  departmentId: string;
  name: string;
  patientCount: number;
  averageWaitTime: number;
  satisfactionScore: number;
  revenue: number;
  staffUtilization: number;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  outstandingBills: number;
  insuranceReimbursements: number;
  cashPayments: number;
  averageBillAmount: number;
}

interface StaffMetrics {
  totalStaff: number;
  doctorsOnDuty: number;
  nursesOnDuty: number;
  pharmacistsOnDuty: number;
  averageWorkload: number;
  overtimeHours: number;
  staffSatisfaction: number;
}

interface QualityMetrics {
  patientSatisfactionScore: number;
  readmissionRate: number;
  infectionRate: number;
  mortalityRate: number;
  averageResponseTime: number;
  medicationErrorRate: number;
}

interface OperationalMetrics {
  bedUtilization: number;
  equipmentUtilization: number;
  averageAppointmentWaitTime: number;
  labTestTurnaroundTime: number;
  pharmacyDispenseTime: number;
  emergencyResponseTime: number;
}

interface MessageAttachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

// ============ DATABASE INDEXES ============

export const DatabaseIndexes = {
  // User indexes
  'users/email': ['email'],
  'users/role': ['role'],
  'users/active': ['isActive'],
  
  // Patient indexes
  'patients/mrn': ['mrn'],
  'patients/doctor': ['primaryDoctor'],
  'patients/bloodType': ['bloodType'],
  
  // Appointment indexes
  'appointments/patient': ['patientId'],
  'appointments/doctor': ['doctorId'],
  'appointments/date': ['scheduledDateTime'],
  'appointments/status': ['status'],
  'appointments/department': ['department'],
  
  // Prescription indexes
  'prescriptions/patient': ['patientId'],
  'prescriptions/doctor': ['doctorId'],
  'prescriptions/status': ['status'],
  'prescriptions/date': ['createdAt'],
  
  // Lab test indexes
  'labTests/patient': ['patientId'],
  'labTests/doctor': ['doctorId'],
  'labTests/status': ['status'],
  'labTests/urgency': ['urgency'],
  
  // Billing indexes
  'billing/patient': ['patientId'],
  'billing/status': ['status'],
  'billing/dueDate': ['dueDate'],
  
  // Notification indexes
  'notifications/recipient': ['recipientId'],
  'notifications/status': ['status'],
  'notifications/type': ['type'],
  'notifications/date': ['createdAt']
};

// ============ SECURITY RULES ============

export const FirestoreSecurityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Patients can read their own data
    match /patients/{patientId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         isDoctor() || isNurse() || isAdmin());
      allow write: if request.auth != null && isAdmin();
    }
    
    // Doctors can read/write their consultations and prescriptions
    match /consultations/{consultationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.doctorId || isAdmin());
    }
    
    // Pharmacists can read/write prescriptions
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null && 
        (isPharmacist() || isDoctor() || isAdmin());
    }
    
    // Lab technicians can read/write lab tests and results
    match /labTests/{testId} {
      allow read, write: if request.auth != null && 
        (isLabTech() || isDoctor() || isAdmin());
    }
    
    // Billing access for finance staff
    match /billing/{billId} {
      allow read, write: if request.auth != null && 
        (isFinanceStaff() || isAdmin());
    }
    
    // Helper functions
    function isDoctor() {
      return exists(/databases/$(database)/documents/doctors/$(request.auth.uid));
    }
    
    function isNurse() {
      return exists(/databases/$(database)/documents/nurses/$(request.auth.uid));
    }
    
    function isPharmacist() {
      return exists(/databases/$(database)/documents/pharmacists/$(request.auth.uid));
    }
    
    function isAdmin() {
      return exists(/databases/$(database)/documents/administrators/$(request.auth.uid));
    }
    
    function isLabTech() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lab_tech';
    }
    
    function isFinanceStaff() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'finance';
    }
  }
}
`;