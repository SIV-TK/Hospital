import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { getLatestDocument, queryWithSort } from './firestore-utils';
import { mockPrescriptions, getMockPrescriptionsByStatus } from './mock-pharmacy-data';

export interface PrescriptionRequest {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  medications: Medication[];
  status: 'pending' | 'ai_analyzed' | 'pharmacist_reviewed' | 'prepared' | 'ready' | 'dispensed';
  aiAnalysis?: AIPharmacyAnalysis;
  pharmacistNotes?: string;
  createdAt: string;
  updatedAt: string;
  prescribedAt: string;
  dispensedAt?: string;
  dispensedBy?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  patientInstructions?: string;
}

export interface Medication {
  name: string;
  genericName?: string;
  dosage: string;
  strength: string;
  frequency: string;
  duration: string;
  route: string; // oral, IV, topical, etc.
  instructions: string;
  quantity: number;
  refills: number;
}

export interface AIPharmacyAnalysis {
  medicationEffects: MedicationEffect[];
  drugInteractions: DrugInteraction[];
  dosageRecommendations: DosageRecommendation[];
  foodAdvice: FoodAdvice[];
  activityRestrictions: ActivityRestriction[];
  sideEffects: SideEffect[];
  monitoringRequirements: MonitoringRequirement[];
  patientEducation: PatientEducation[];
  contraindications: string[];
  warnings: string[];
  confidence: number;
}

export interface MedicationEffect {
  medication: string;
  primaryEffect: string;
  secondaryEffects: string[];
  onsetTime: string;
  duration: string;
  mechanismOfAction: string;
}

export interface DrugInteraction {
  medications: string[];
  interactionType: 'major' | 'moderate' | 'minor';
  description: string;
  clinicalSignificance: string;
  recommendation: string;
}

export interface DosageRecommendation {
  medication: string;
  recommendedDose: string;
  adjustmentReason: string;
  patientFactors: string[];
  alternatives: string[];
}

export interface FoodAdvice {
  medication: string;
  foodsToAvoid: string[];
  foodsToTakeWith: string[];
  timingWithMeals: string;
  nutritionalConsiderations: string[];
}

export interface ActivityRestriction {
  medication: string;
  restrictedActivities: string[];
  precautions: string[];
  duration: string;
  alternatives: string[];
}

export interface SideEffect {
  medication: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  whenToSeekHelp: string[];
  managementTips: string[];
}

export interface MonitoringRequirement {
  medication: string;
  parametersToMonitor: string[];
  frequency: string;
  expectedChanges: string[];
  warningValues: string[];
}

export interface PatientEducation {
  medication: string;
  keyPoints: string[];
  administrationTips: string[];
  storageInstructions: string[];
  missedDoseInstructions: string;
}

export interface PatientPortalData {
  patientId: string;
  prescriptions: PatientPrescription[];
  reminders: MedicationReminder[];
  educationalContent: EducationalContent[];
}

export interface PatientPrescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  remainingDoses: number;
  nextDueTime: string;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
  sideEffectsToWatch: string[];
  foodAdvice: string[];
}

export interface MedicationReminder {
  id: string;
  medicationName: string;
  doseTime: string;
  dosage: string;
  instructions: string;
  taken: boolean;
  skipped: boolean;
  notes?: string;
}

export interface EducationalContent {
  medicationName: string;
  title: string;
  content: string;
  type: 'effect' | 'food' | 'activity' | 'monitoring' | 'storage';
  priority: 'high' | 'medium' | 'low';
}

class PharmacyService {
  // Submit prescription from doctor to pharmacy
  async submitPrescription(prescription: Omit<PrescriptionRequest, 'id' | 'createdAt' | 'updatedAt' | 'prescribedAt'>): Promise<string> {
    try {
      const prescriptionData = {
        ...prescription,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        prescribedAt: new Date().toISOString(),
        status: 'pending' as const
      };

      const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
      
      // Trigger AI analysis automatically
      await this.triggerAIAnalysis(docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error submitting prescription:', error);
      throw error;
    }
  }

  // AI Analysis of prescription
  async triggerAIAnalysis(prescriptionId: string): Promise<void> {
    try {
      // Simulate AI analysis (in production, this would call actual AI service)
      const aiAnalysis = await this.generateAIAnalysis(prescriptionId);
      
      await updateDoc(doc(db, 'prescriptions', prescriptionId), {
        aiAnalysis,
        status: 'ai_analyzed',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw error;
    }
  }

  // Generate comprehensive AI analysis
  private async generateAIAnalysis(prescriptionId: string): Promise<AIPharmacyAnalysis> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI analysis (in production, this would be actual AI analysis)
    return {
      medicationEffects: [
        {
          medication: 'Lisinopril',
          primaryEffect: 'Lowers blood pressure by inhibiting ACE enzyme',
          secondaryEffects: ['Reduces strain on heart', 'Improves kidney function'],
          onsetTime: '1-2 hours',
          duration: '24 hours',
          mechanismOfAction: 'ACE inhibitor that blocks conversion of angiotensin I to angiotensin II'
        }
      ],
      drugInteractions: [
        {
          medications: ['Lisinopril', 'Potassium supplements'],
          interactionType: 'moderate',
          description: 'May increase potassium levels',
          clinicalSignificance: 'Monitor potassium levels regularly',
          recommendation: 'Check serum potassium weekly for first month'
        }
      ],
      dosageRecommendations: [
        {
          medication: 'Lisinopril',
          recommendedDose: '10mg once daily',
          adjustmentReason: 'Standard starting dose for hypertension',
          patientFactors: ['Age: 45', 'No kidney disease', 'First-time ACE inhibitor use'],
          alternatives: ['Enalapril 5mg twice daily', 'Captopril 25mg three times daily']
        }
      ],
      foodAdvice: [
        {
          medication: 'Lisinopril',
          foodsToAvoid: ['High potassium foods in excess (bananas, oranges)', 'Salt substitutes with potassium'],
          foodsToTakeWith: ['Can be taken with or without food'],
          timingWithMeals: 'Consistent timing more important than meal timing',
          nutritionalConsiderations: ['Maintain consistent sodium intake', 'Stay hydrated']
        }
      ],
      activityRestrictions: [
        {
          medication: 'Lisinopril',
          restrictedActivities: ['Avoid sudden position changes initially'],
          precautions: ['Monitor for dizziness when standing', 'Avoid dehydration during exercise'],
          duration: 'First 2-4 weeks until body adjusts',
          alternatives: ['Gradual position changes', 'Increase fluid intake before exercise']
        }
      ],
      sideEffects: [
        {
          medication: 'Lisinopril',
          commonSideEffects: ['Dry cough (10-15%)', 'Dizziness', 'Fatigue', 'Headache'],
          seriousSideEffects: ['Angioedema', 'Severe hypotension', 'Kidney dysfunction'],
          whenToSeekHelp: ['Swelling of face/lips/tongue', 'Difficulty breathing', 'Severe dizziness'],
          managementTips: ['Take at bedtime if dizziness occurs', 'Report persistent cough to doctor']
        }
      ],
      monitoringRequirements: [
        {
          medication: 'Lisinopril',
          parametersToMonitor: ['Blood pressure', 'Serum creatinine', 'Potassium levels'],
          frequency: 'Weekly for 4 weeks, then monthly',
          expectedChanges: ['BP decrease 10-15 mmHg within 2-4 weeks'],
          warningValues: ['K+ >5.5 mEq/L', 'Creatinine increase >30%', 'BP <90/60 mmHg']
        }
      ],
      patientEducation: [
        {
          medication: 'Lisinopril',
          keyPoints: [
            'Take at the same time each day',
            'Do not stop suddenly without consulting doctor',
            'Report persistent dry cough',
            'Monitor blood pressure at home if possible'
          ],
          administrationTips: [
            'Swallow tablet whole with water',
            'Can be taken with or without food',
            'If you miss a dose, take it as soon as you remember unless it\'s almost time for the next dose'
          ],
          storageInstructions: [
            'Store at room temperature',
            'Keep in original container',
            'Protect from moisture and light',
            'Keep out of reach of children'
          ],
          missedDoseInstructions: 'Take as soon as you remember, but skip if it\'s within 12 hours of your next dose. Never take two doses at once.'
        }
      ],
      contraindications: [
        'Pregnancy',
        'History of angioedema with ACE inhibitors',
        'Bilateral renal artery stenosis'
      ],
      warnings: [
        'May cause fetal harm during pregnancy',
        'Increased risk of hyperkalemia in patients with diabetes or kidney disease',
        'First dose hypotension may occur'
      ],
      confidence: 92
    };
  }

  // Update prescription status
  async updatePrescriptionStatus(prescriptionId: string, status: PrescriptionRequest['status'], notes?: string, dispensedBy?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (notes) {
        updateData.pharmacistNotes = notes;
      }

      if (status === 'dispensed') {
        updateData.dispensedAt = new Date().toISOString();
        if (dispensedBy) {
          updateData.dispensedBy = dispensedBy;
        }
      }

      // Try to update in Firebase
      try {
        await updateDoc(doc(db, 'prescriptions', prescriptionId), updateData);
      } catch (firebaseError) {
        console.log('Firebase update failed, updating mock data:', firebaseError);
        // Update mock data as fallback
        const mockPrescription = mockPrescriptions.find(rx => rx.id === prescriptionId);
        if (mockPrescription) {
          mockPrescription.status = status;
          mockPrescription.updatedAt = new Date().toISOString();
          if (notes) {
            mockPrescription.pharmacistNotes = notes;
          }
          if (status === 'dispensed') {
            mockPrescription.dispensedAt = new Date().toISOString();
            if (dispensedBy) {
              mockPrescription.dispensedBy = dispensedBy;
            }
          }
        }
      }

      // If dispensed, create patient portal data
      if (status === 'dispensed') {
        await this.createPatientPortalData(prescriptionId);
      }
    } catch (error) {
      console.error('Error updating prescription status:', error);
      throw error;
    }
  }

  // Create patient portal data for tracking and reminders
  private async createPatientPortalData(prescriptionId: string): Promise<void> {
    try {
      // Get prescription data
      const prescriptionDoc = await this.getPrescriptionById(prescriptionId);
      if (!prescriptionDoc || !prescriptionDoc.aiAnalysis) return;

      const patientPrescriptions: PatientPrescription[] = prescriptionDoc.medications.map(med => ({
        id: `${prescriptionId}_${med.name}`,
        medication: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        remainingDoses: this.calculateRemainingDoses(med),
        nextDueTime: this.calculateNextDoseTime(med),
        status: 'active',
        instructions: med.instructions,
        sideEffectsToWatch: prescriptionDoc.aiAnalysis?.sideEffects.find(se => se.medication === med.name)?.commonSideEffects || [],
        foodAdvice: prescriptionDoc.aiAnalysis?.foodAdvice.find(fa => fa.medication === med.name)?.nutritionalConsiderations || []
      }));

      const reminders = this.generateMedicationReminders(prescriptionDoc.medications);
      const educationalContent = this.generateEducationalContent(prescriptionDoc.aiAnalysis);

      const portalData: PatientPortalData = {
        patientId: prescriptionDoc.patientId,
        prescriptions: patientPrescriptions,
        reminders,
        educationalContent
      };

      // Save to patient portal collection
      await addDoc(collection(db, 'patientPortal'), {
        ...portalData,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error creating patient portal data:', error);
      throw error;
    }
  }

  // Get all prescriptions with filtering
  async getPrescriptions(filters?: {
    status?: PrescriptionRequest['status'];
    priority?: PrescriptionRequest['priority'];
    patientId?: string;
  }): Promise<PrescriptionRequest[]> {
    try {
      // Build where constraints based on filters
      const whereConstraints = [];
      
      if (filters?.status) {
        whereConstraints.push(where('status', '==', filters.status));
      }
      if (filters?.priority) {
        whereConstraints.push(where('priority', '==', filters.priority));
      }
      if (filters?.patientId) {
        whereConstraints.push(where('patientId', '==', filters.patientId));
      }

      // Try to query with constraints, fallback to simple query if index missing
      let docs;
      try {
        if (whereConstraints.length > 0) {
          const q = query(collection(db, 'prescriptions'), ...whereConstraints);
          const snapshot = await getDocs(q);
          docs = snapshot.docs;
        } else {
          const snapshot = await getDocs(collection(db, 'prescriptions'));
          docs = snapshot.docs;
        }
      } catch (indexError) {
        console.log('Index not available, using simple query:', indexError);
        const snapshot = await getDocs(collection(db, 'prescriptions'));
        docs = snapshot.docs;
      }
      
      const firebaseData = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrescriptionRequest));

      // If no Firebase data, return mock data
      if (firebaseData.length === 0) {
        let mockData = mockPrescriptions;
        
        if (filters?.status) {
          mockData = mockData.filter(rx => rx.status === filters.status);
        }
        if (filters?.priority) {
          mockData = mockData.filter(rx => rx.priority === filters.priority);
        }
        if (filters?.patientId) {
          mockData = mockData.filter(rx => rx.patientId === filters.patientId);
        }
        
        return mockData;
      }

      return firebaseData;
    } catch (error) {
      console.error('Error fetching prescriptions, returning mock data:', error);
      // Return mock data as fallback
      let mockData = mockPrescriptions;
      
      if (filters?.status) {
        mockData = mockData.filter(rx => rx.status === filters.status);
      }
      if (filters?.priority) {
        mockData = mockData.filter(rx => rx.priority === filters.priority);
      }
      if (filters?.patientId) {
        mockData = mockData.filter(rx => rx.patientId === filters.patientId);
      }
      
      return mockData;
    }
  }

  // Get single prescription by ID
  async getPrescriptionById(id: string): Promise<PrescriptionRequest | null> {
    try {
      // Check mock data first to avoid Firebase permissions issues
      const mockPrescription = mockPrescriptions.find(rx => rx.id === id);
      if (mockPrescription) {
        return mockPrescription;
      }
      
      // Try Firebase as fallback
      const docSnap = await getDocs(query(collection(db, 'prescriptions'), where('__name__', '==', id)));
      if (!docSnap.empty) {
        const doc = docSnap.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as PrescriptionRequest;
      }
      
      return null;
    } catch (error) {
      // Return mock data as fallback
      const mockPrescription = mockPrescriptions.find(rx => rx.id === id);
      return mockPrescription || null;
    }
  }

  // Get patient portal data
  async getPatientPortalData(patientId: string): Promise<PatientPortalData | null> {
    try {
      // Use the utility function to handle index errors gracefully
      const latestData = await getLatestDocument('patientPortal', 'patientId', patientId, 'createdAt');
      
      if (latestData) {
        return latestData as PatientPortalData;
      }
      
      // If no Firebase data, generate mock portal data
      const patientPrescriptions = mockPrescriptions.filter(rx => rx.patientId === patientId);
      if (patientPrescriptions.length === 0) return null;
      
      return this.generateMockPatientPortalData(patientId, patientPrescriptions);
    } catch (error) {
      console.error('Error fetching patient portal data, generating mock data:', error);
      // Generate mock portal data as fallback
      const patientPrescriptions = mockPrescriptions.filter(rx => rx.patientId === patientId);
      if (patientPrescriptions.length === 0) return null;
      
      return this.generateMockPatientPortalData(patientId, patientPrescriptions);
    }
  }

  // Generate mock patient portal data
  private generateMockPatientPortalData(patientId: string, prescriptions: PrescriptionRequest[]): PatientPortalData {
    const patientPrescriptions: PatientPrescription[] = [];
    const reminders: MedicationReminder[] = [];
    const educationalContent: EducationalContent[] = [];

    prescriptions.forEach(prescription => {
      prescription.medications.forEach(med => {
        patientPrescriptions.push({
          id: `${prescription.id}_${med.name}`,
          medication: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          remainingDoses: this.calculateRemainingDoses(med),
          nextDueTime: this.calculateNextDoseTime(med),
          status: prescription.status === 'dispensed' ? 'active' : 'completed',
          instructions: med.instructions,
          sideEffectsToWatch: prescription.aiAnalysis?.sideEffects.find(se => se.medication === med.name)?.commonSideEffects || [],
          foodAdvice: prescription.aiAnalysis?.foodAdvice.find(fa => fa.medication === med.name)?.nutritionalConsiderations || []
        });

        // Generate reminders for active medications
        if (prescription.status === 'dispensed') {
          const medReminders = this.generateMedicationReminders([med]);
          reminders.push(...medReminders);
        }
      });

      // Generate educational content if AI analysis exists
      if (prescription.aiAnalysis) {
        const content = this.generateEducationalContent(prescription.aiAnalysis);
        educationalContent.push(...content);
      }
    });

    return {
      patientId,
      prescriptions: patientPrescriptions,
      reminders,
      educationalContent
    };
  }

  // Helper methods
  private calculateRemainingDoses(medication: Medication): number {
    // Parse frequency and calculate remaining doses based on duration
    const frequencyMap: { [key: string]: number } = {
      'once daily': 1,
      'twice daily': 2,
      'three times daily': 3,
      'four times daily': 4,
      'every 6 hours': 4,
      'every 8 hours': 3,
      'every 12 hours': 2
    };

    const dailyDoses = frequencyMap[medication.frequency.toLowerCase()] || 1;
    const durationDays = this.parseDuration(medication.duration);
    
    return dailyDoses * durationDays;
  }

  private calculateNextDoseTime(medication: Medication): string {
    const now = new Date();
    const frequencyHours: { [key: string]: number } = {
      'once daily': 24,
      'twice daily': 12,
      'three times daily': 8,
      'four times daily': 6,
      'every 6 hours': 6,
      'every 8 hours': 8,
      'every 12 hours': 12
    };

    const intervalHours = frequencyHours[medication.frequency.toLowerCase()] || 24;
    const nextDose = new Date(now.getTime() + (intervalHours * 60 * 60 * 1000));
    
    return nextDose.toISOString();
  }

  private parseDuration(duration: string): number {
    const daysMatch = duration.match(/(\d+)\s*days?/i);
    const weeksMatch = duration.match(/(\d+)\s*weeks?/i);
    const monthsMatch = duration.match(/(\d+)\s*months?/i);

    if (daysMatch) return parseInt(daysMatch[1]);
    if (weeksMatch) return parseInt(weeksMatch[1]) * 7;
    if (monthsMatch) return parseInt(monthsMatch[1]) * 30;
    
    return 30; // Default to 30 days
  }

  private generateMedicationReminders(medications: Medication[]): MedicationReminder[] {
    const reminders: MedicationReminder[] = [];
    const now = new Date();

    medications.forEach(med => {
      const frequencyMap: { [key: string]: string[] } = {
        'once daily': ['08:00'],
        'twice daily': ['08:00', '20:00'],
        'three times daily': ['08:00', '14:00', '20:00'],
        'four times daily': ['08:00', '14:00', '18:00', '22:00']
      };

      const times = frequencyMap[med.frequency.toLowerCase()] || ['08:00'];
      
      times.forEach((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        if (reminderTime < now) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        reminders.push({
          id: `${med.name}_${index}_${Date.now()}`,
          medicationName: med.name,
          doseTime: reminderTime.toISOString(),
          dosage: med.dosage,
          instructions: med.instructions,
          taken: false,
          skipped: false
        });
      });
    });

    return reminders;
  }

  private generateEducationalContent(aiAnalysis: AIPharmacyAnalysis): EducationalContent[] {
    const content: EducationalContent[] = [];

    aiAnalysis.medicationEffects.forEach(effect => {
      content.push({
        medicationName: effect.medication,
        title: 'How This Medicine Works',
        content: `${effect.primaryEffect}. ${effect.mechanismOfAction}. Effects typically begin within ${effect.onsetTime} and last ${effect.duration}.`,
        type: 'effect',
        priority: 'high'
      });
    });

    aiAnalysis.foodAdvice.forEach(advice => {
      content.push({
        medicationName: advice.medication,
        title: 'Food and Nutrition Guidelines',
        content: `Foods to avoid: ${advice.foodsToAvoid.join(', ')}. ${advice.timingWithMeals}. Additional considerations: ${advice.nutritionalConsiderations.join(', ')}.`,
        type: 'food',
        priority: 'medium'
      });
    });

    aiAnalysis.activityRestrictions.forEach(restriction => {
      content.push({
        medicationName: restriction.medication,
        title: 'Activity Guidelines',
        content: `Precautions: ${restriction.precautions.join(', ')}. These restrictions typically last ${restriction.duration}.`,
        type: 'activity',
        priority: 'medium'
      });
    });

    return content;
  }

  // Real-time subscription for prescription updates
  subscribeToPrescriptions(callback: (prescriptions: PrescriptionRequest[]) => void) {
    try {
      // Try simple query first without orderBy to avoid index issues
      const q = query(collection(db, 'prescriptions'));
      
      return onSnapshot(q, (snapshot) => {
        const prescriptions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PrescriptionRequest));
        
        // Sort manually to avoid index requirements
        prescriptions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        // If no Firebase data, return mock data
        if (prescriptions.length === 0) {
          callback(mockPrescriptions);
        } else {
          callback(prescriptions);
        }
      }, (error) => {
        console.error('Error in prescription subscription, using mock data:', error);
        // Return mock data as fallback
        callback(mockPrescriptions);
      });
    } catch (error) {
      console.error('Error setting up prescription subscription, using mock data:', error);
      // Return mock data immediately as fallback
      callback(mockPrescriptions);
      return () => {}; // Return empty unsubscribe function
    }
  }
}

// Function to submit prescription from cardiology department
export const submitCardiologyPrescription = async (patientData: any, medications: string[]) => {
  const prescriptionData = {
    patientId: patientData.id,
    patientName: patientData.name,
    doctorId: 'dr_cardiology_001',
    doctorName: 'Dr. Cardiologist',
    department: 'Cardiology',
    diagnosis: patientData.condition,
    medications: medications.map(medName => {
      const medMap: { [key: string]: any } = {
        'Lisinopril 10mg': {
          name: 'Lisinopril 10mg',
          genericName: 'Lisinopril',
          dosage: '10mg',
          strength: '10mg',
          frequency: 'once daily',
          duration: '30 days',
          route: 'oral',
          instructions: 'Take once daily in the morning with or without food',
          quantity: 30,
          refills: 2
        },
        'Aspirin 81mg': {
          name: 'Aspirin 81mg',
          genericName: 'Aspirin',
          dosage: '81mg',
          strength: '81mg',
          frequency: 'once daily',
          duration: '30 days',
          route: 'oral',
          instructions: 'Take once daily with food to prevent stomach upset',
          quantity: 30,
          refills: 5
        },
        'Metoprolol 50mg': {
          name: 'Metoprolol 50mg',
          genericName: 'Metoprolol',
          dosage: '50mg',
          strength: '50mg',
          frequency: 'twice daily',
          duration: '30 days',
          route: 'oral',
          instructions: 'Take twice daily with meals',
          quantity: 60,
          refills: 2
        }
      };
      return medMap[medName] || {
        name: medName,
        dosage: '1 tablet',
        strength: 'standard',
        frequency: 'as directed',
        duration: '30 days',
        route: 'oral',
        instructions: 'Take as directed by physician',
        quantity: 30,
        refills: 1
      };
    }),
    priority: patientData.priority === 'urgent' ? 'urgent' : 'normal'
  };
  
  return await pharmacyService.submitPrescription(prescriptionData);
};

export const pharmacyService = new PharmacyService();
