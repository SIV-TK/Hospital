import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  HospitalDatabase
} from './database-schema';

// ============ USER MANAGEMENT SERVICES ============

export class UserService {
  async createUser(userData: any) {
    return await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getUser(userId: string) {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async updateUser(userId: string, updates: any) {
    const docRef = doc(db, 'users', userId);
    return await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  subscribeToUsers(callback: (users: any[]) => void) {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(users);
    });
  }
}

export class PatientService {
  async createPatient(patientData: any) {
    return await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getPatient(patientId: string) {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async getPatientsByDoctor(doctorId: string) {
    const q = query(collection(db, 'patients'), where('primaryDoctor', '==', doctorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updatePatient(patientId: string, updates: any) {
    const docRef = doc(db, 'patients', patientId);
    return await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  subscribeToPatients(callback: (patients: any[]) => void) {
    const q = query(collection(db, 'patients'));
    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(patients);
    });
  }
}

export class DoctorService {
  async createDoctor(doctorData: any) {
    return await addDoc(collection(db, 'doctors'), {
      ...doctorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getDoctorsByDepartment(department: string) {
    const q = query(collection(db, 'doctors'), where('department', '==', department));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateDoctorAvailability(doctorId: string, isAvailable: boolean) {
    const docRef = doc(db, 'doctors', doctorId);
    return await updateDoc(docRef, {
      isAvailable,
      updatedAt: serverTimestamp()
    });
  }
}

// ============ MEDICAL OPERATIONS SERVICES ============

export class AppointmentService {
  async createAppointment(appointmentData: any) {
    return await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getAppointmentsByPatient(patientId: string) {
    const q = query(
      collection(db, 'appointments'), 
      where('patientId', '==', patientId),
      orderBy('scheduledDateTime', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAppointmentsByDoctor(doctorId: string, date?: string) {
    let q = query(
      collection(db, 'appointments'), 
      where('doctorId', '==', doctorId)
    );
    
    if (date) {
      q = query(q, where('scheduledDateTime', '>=', date));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const docRef = doc(db, 'appointments', appointmentId);
    return await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'completed' && { completedAt: serverTimestamp() })
    });
  }

  subscribeToAppointments(callback: (appointments: any[]) => void) {
    const q = query(collection(db, 'appointments'), orderBy('scheduledDateTime', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(appointments);
    });
  }
}

export class ConsultationService {
  async createConsultation(consultationData: any) {
    return await addDoc(collection(db, 'consultations'), {
      ...consultationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getConsultationsByPatient(patientId: string) {
    const q = query(
      collection(db, 'consultations'), 
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateConsultation(consultationId: string, updates: any) {
    const docRef = doc(db, 'consultations', consultationId);
    return await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
}

export class PrescriptionService {
  async createPrescription(prescriptionData: any) {
    return await addDoc(collection(db, 'prescriptions'), {
      ...prescriptionData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getPrescriptionsByStatus(status: string) {
    const q = query(collection(db, 'prescriptions'), where('status', '==', status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updatePrescriptionStatus(prescriptionId: string, status: string, notes?: string) {
    const docRef = doc(db, 'prescriptions', prescriptionId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (notes) updates.pharmacistNotes = notes;
    if (status === 'dispensed') updates.dispensedAt = serverTimestamp();
    
    return await updateDoc(docRef, updates);
  }

  subscribeToPrescriptions(callback: (prescriptions: any[]) => void) {
    const q = query(collection(db, 'prescriptions'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const prescriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(prescriptions);
    });
  }
}

// ============ LAB SERVICES ============

export class LabService {
  async createLabTest(labTestData: any) {
    return await addDoc(collection(db, 'labTests'), {
      ...labTestData,
      status: 'ordered',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getLabTestsByPatient(patientId: string) {
    const q = query(
      collection(db, 'labTests'), 
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateLabTestStatus(testId: string, status: string) {
    const docRef = doc(db, 'labTests', testId);
    return await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }

  async createLabResult(resultData: any) {
    return await addDoc(collection(db, 'labResults'), {
      ...resultData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getLabResultsByPatient(patientId: string) {
    const q = query(
      collection(db, 'labResults'), 
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  subscribeToLabTests(callback: (tests: any[]) => void) {
    const q = query(collection(db, 'labTests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tests);
    });
  }
}

// ============ PHARMACY SERVICES ============

export class PharmacyService {
  async createMedication(medicationData: any) {
    return await addDoc(collection(db, 'medications'), {
      ...medicationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getMedications() {
    const snapshot = await getDocs(collection(db, 'medications'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateInventory(medicationId: string, quantity: number) {
    const q = query(
      collection(db, 'inventory'), 
      where('medicationId', '==', medicationId),
      where('status', '==', 'available')
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docRef = doc(db, 'inventory', snapshot.docs[0].id);
      return await updateDoc(docRef, {
        quantity,
        updatedAt: serverTimestamp()
      });
    }
  }

  async dispenseMedication(dispensingData: any) {
    return await addDoc(collection(db, 'medicationDispensing'), {
      ...dispensingData,
      createdAt: serverTimestamp()
    });
  }
}

// ============ BILLING SERVICES ============

export class BillingService {
  async createBill(billData: any) {
    return await addDoc(collection(db, 'billing'), {
      ...billData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getBillsByPatient(patientId: string) {
    const q = query(
      collection(db, 'billing'), 
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateBillStatus(billId: string, status: string) {
    const docRef = doc(db, 'billing', billId);
    return await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }

  async createPayment(paymentData: any) {
    return await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: serverTimestamp()
    });
  }
}

// ============ DEPARTMENT SERVICES ============

export class DepartmentService {
  async getDepartments() {
    const snapshot = await getDocs(collection(db, 'departments'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getRoomsByDepartment(department: string) {
    const q = query(collection(db, 'rooms'), where('department', '==', department));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAvailableBeds() {
    const q = query(collection(db, 'beds'), where('status', '==', 'available'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateBedStatus(bedId: string, status: string, patientId?: string) {
    const docRef = doc(db, 'beds', bedId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (patientId) {
      updates.currentPatient = patientId;
      updates.admissionDate = serverTimestamp();
    } else {
      updates.currentPatient = null;
      updates.admissionDate = null;
    }
    
    return await updateDoc(docRef, updates);
  }
}

// ============ AI & ANALYTICS SERVICES ============

export class AIService {
  async createAIAnalysis(analysisData: any) {
    return await addDoc(collection(db, 'aiAnalysis'), {
      ...analysisData,
      createdAt: serverTimestamp()
    });
  }

  async getAIAnalysisByEntity(entityId: string, type: string) {
    const q = query(
      collection(db, 'aiAnalysis'), 
      where('entityId', '==', entityId),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createPatientEducation(educationData: any) {
    return await addDoc(collection(db, 'patientEducation'), {
      ...educationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getPatientEducation(patientId: string) {
    const q = query(
      collection(db, 'patientEducation'), 
      where('patientId', '==', patientId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// ============ COMMUNICATION SERVICES ============

export class NotificationService {
  async createNotification(notificationData: any) {
    return await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      status: 'sent',
      createdAt: serverTimestamp()
    });
  }

  async getNotificationsByRecipient(recipientId: string) {
    const q = query(
      collection(db, 'notifications'), 
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markNotificationAsRead(notificationId: string) {
    const docRef = doc(db, 'notifications', notificationId);
    return await updateDoc(docRef, {
      status: 'read',
      readAt: serverTimestamp()
    });
  }

  subscribeToNotifications(recipientId: string, callback: (notifications: any[]) => void) {
    const q = query(
      collection(db, 'notifications'), 
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(notifications);
    });
  }

  async createEmergencyAlert(alertData: any) {
    return await addDoc(collection(db, 'emergencyAlerts'), {
      ...alertData,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

// ============ ANALYTICS SERVICES ============

export class AnalyticsService {
  async createHospitalAnalytics(analyticsData: any) {
    return await addDoc(collection(db, 'hospitalAnalytics'), {
      ...analyticsData,
      createdAt: serverTimestamp()
    });
  }

  async getAnalyticsByDateRange(startDate: string, endDate: string) {
    const q = query(
      collection(db, 'hospitalAnalytics'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getDashboardMetrics() {
    // Get latest analytics data for dashboard
    const q = query(
      collection(db, 'hospitalAnalytics'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
}

// ============ UNIFIED DATABASE SERVICE ============

export class HospitalDatabaseService {
  users = new UserService();
  patients = new PatientService();
  doctors = new DoctorService();
  appointments = new AppointmentService();
  consultations = new ConsultationService();
  prescriptions = new PrescriptionService();
  lab = new LabService();
  pharmacy = new PharmacyService();
  billing = new BillingService();
  departments = new DepartmentService();
  ai = new AIService();
  notifications = new NotificationService();
  analytics = new AnalyticsService();

  // Cross-service operations
  async admitPatient(patientId: string, departmentId: string, doctorId: string) {
    // Find available bed
    const availableBeds = await this.departments.getAvailableBeds();
    if (availableBeds.length === 0) {
      throw new Error('No available beds');
    }

    const bed = availableBeds[0];
    
    // Update bed status
    await this.departments.updateBedStatus(bed.id, 'occupied', patientId);
    
    // Create medical record
    const medicalRecord = {
      patientId,
      type: 'admission',
      admissionDate: new Date().toISOString(),
      department: departmentId,
      attendingPhysician: doctorId,
      diagnosis: [],
      procedures: [],
      medications: [],
      labResults: [],
      imagingResults: [],
      progressNotes: []
    };
    
    return await addDoc(collection(db, 'medicalRecords'), {
      ...medicalRecord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async dischargePatient(patientId: string, medicalRecordId: string, dischargeInstructions: string) {
    // Update medical record
    const medicalRecordRef = doc(db, 'medicalRecords', medicalRecordId);
    await updateDoc(medicalRecordRef, {
      dischargeDate: new Date().toISOString(),
      dischargeInstructions,
      updatedAt: serverTimestamp()
    });

    // Find and free up the bed
    const q = query(collection(db, 'beds'), where('currentPatient', '==', patientId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const bedRef = doc(db, 'beds', snapshot.docs[0].id);
      await updateDoc(bedRef, {
        status: 'cleaning',
        currentPatient: null,
        admissionDate: null,
        updatedAt: serverTimestamp()
      });
    }

    // Create discharge notification
    await this.notifications.createNotification({
      recipientId: patientId,
      recipientType: 'patient',
      type: 'system',
      title: 'Discharge Complete',
      message: 'You have been successfully discharged. Please follow your discharge instructions.',
      priority: 'normal',
      channel: 'in_app'
    });
  }
}

// Export singleton instance
export const hospitalDB = new HospitalDatabaseService();