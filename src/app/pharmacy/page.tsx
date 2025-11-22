'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pill, 
  Clock, 
  CheckCircle, 
  Package, 
  User,
  Stethoscope,
  Calendar,
  AlertCircle,
  Phone,
  MapPin,
  Brain,
  Activity,
  Utensils,
  Shield,
  Eye,
  FileText,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { useSession } from '@/hooks/use-session';
import { pharmacyService, PrescriptionRequest, AIPharmacyAnalysis } from '@/lib/pharmacy-service';

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRequest | null>(null);
  const { session } = useSession();

  // Access control - only hospital staff should access this page
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'doctor') {
      // Redirect unauthorized users
      window.location.href = '/patient-portal';
      return;
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
    
    // Set up real-time subscription
    const unsubscribe = pharmacyService.subscribeToPrescriptions((updatedPrescriptions) => {
      setPrescriptions(updatedPrescriptions);
    });

    return () => unsubscribe();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const prescriptionData = await pharmacyService.getPrescriptions();
      setPrescriptions(prescriptionData);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (prescriptionId: string, newStatus: PrescriptionRequest['status'], notes?: string) => {
    try {
      await pharmacyService.updatePrescriptionStatus(prescriptionId, newStatus, notes);
      // Prescriptions will be updated via real-time subscription
    } catch (error) {
      console.error('Error updating prescription status:', error);
    }
  };

  const getStatusColor = (status: PrescriptionRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ai_analyzed': return 'bg-purple-100 text-purple-800';
      case 'pharmacist_reviewed': return 'bg-blue-100 text-blue-800';
      case 'prepared': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PrescriptionRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'ai_analyzed': return <Brain className="h-4 w-4" />;
      case 'pharmacist_reviewed': return <Eye className="h-4 w-4" />;
      case 'prepared': return <Package className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'dispensed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: PrescriptionRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const pendingPrescriptions = prescriptions.filter(rx => rx.status === 'pending');
  const aiAnalyzedPrescriptions = prescriptions.filter(rx => rx.status === 'ai_analyzed');
  const reviewedPrescriptions = prescriptions.filter(rx => rx.status === 'pharmacist_reviewed');
  const preparedPrescriptions = prescriptions.filter(rx => rx.status === 'prepared');
  const readyPrescriptions = prescriptions.filter(rx => rx.status === 'ready');
  const dispensedPrescriptions = prescriptions.filter(rx => rx.status === 'dispensed');

  // Patient status tracking
  const getInlinePatients = () => {
    return prescriptions.filter(p => p.status !== 'dispensed');
  };

  const getServedPatients = () => {
    return prescriptions.filter(p => p.status === 'dispensed');
  };

  const inlinePatients = getInlinePatients();
  const servedPatients = getServedPatients();

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="relative mb-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Pill className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Pharmacy Department</h1>
              <p className="text-xl text-blue-100">AI-Powered Prescription Management & Smart Dispensing</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Package className="h-4 w-4 mr-1" />
                  {prescriptions.length} Total Prescriptions
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {readyPrescriptions.length} Ready for Pickup
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Brain className="h-4 w-4 mr-1" />
                  AI Analysis Active
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingPrescriptions.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">AI Analyzed</p>
                  <p className="text-3xl font-bold text-purple-600">{aiAnalyzedPrescriptions.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Reviewed</p>
                  <p className="text-3xl font-bold text-blue-600">{reviewedPrescriptions.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Prepared</p>
                  <p className="text-3xl font-bold text-orange-600">{preparedPrescriptions.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Ready</p>
                  <p className="text-3xl font-bold text-green-600">{readyPrescriptions.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Dispensed</p>
                  <p className="text-3xl font-bold text-gray-600">{dispensedPrescriptions.length}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-xl">
            <TabsTrigger value="all">All Prescriptions</TabsTrigger>
            <TabsTrigger value="dashboard">Patient Dashboard</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="ai_analyzed">AI Analyzed ({aiAnalyzedPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reviewedPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="prepared">Prepared ({preparedPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="ready">Ready ({readyPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="dispensed">Dispensed ({dispensedPrescriptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <PrescriptionsList 
              prescriptions={prescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Inline Patients (waiting for service) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Inline Patients ({inlinePatients.length})
                  </CardTitle>
                  <CardDescription>
                    Click on a patient to view prescription details and AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inlinePatients.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No patients in line</p>
                    ) : (
                      inlinePatients.map((prescription) => (
                        <div 
                          key={prescription.id} 
                          className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-full">
                              <User className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{prescription.patientName}</h4>
                              <p className="text-sm text-gray-600">{prescription.medications.map(m => m.name).join(', ')}</p>
                              <p className="text-xs text-gray-500">
                                Prescribed: {new Date(prescription.prescribedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Priority: {prescription.priority}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Served Patients (completed) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Served Patients ({servedPatients.length})
                  </CardTitle>
                  <CardDescription>
                    Patients who have received their medications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {servedPatients.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No patients served today</p>
                    ) : (
                      servedPatients.slice(-5).map((prescription) => (
                        <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{prescription.patientName}</h4>
                              <p className="text-sm text-gray-600">{prescription.medications.map(m => m.name).join(', ')}</p>
                              <p className="text-xs text-gray-500">
                                Dispensed: {prescription.dispensedAt ? 
                                  new Date(prescription.dispensedAt).toLocaleString() : 
                                  'Recently'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">
                              Dispensed
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {prescription.dispensedBy || 'Pharmacist'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {servedPatients.length > 5 && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">
                        Showing last 5 of {servedPatients.length} served patients
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Statistics */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Service Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {prescriptions.length > 0 ? 
                          Math.round((servedPatients.length / prescriptions.length) * 100) : 0
                        }%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Wait Time</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {inlinePatients.length > 0 ? 
                          Math.round(inlinePatients.length * 15) : 0
                        }min
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Portal Updates</p>
                      <p className="text-2xl font-bold text-green-600">
                        {servedPatients.length}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <PrescriptionsList 
              prescriptions={pendingPrescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>

          <TabsContent value="ai_analyzed" className="mt-6">
            <PrescriptionsList 
              prescriptions={aiAnalyzedPrescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>

          <TabsContent value="reviewed" className="mt-6">
            <PrescriptionsList 
              prescriptions={reviewedPrescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>

          <TabsContent value="prepared" className="mt-6">
            <PrescriptionsList 
              prescriptions={preparedPrescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>

          <TabsContent value="ready" className="mt-6">
            <PrescriptionsList 
              prescriptions={readyPrescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>

          <TabsContent value="dispensed" className="mt-6">
            <PrescriptionsList 
              prescriptions={dispensedPrescriptions}
              onStatusUpdate={updatePrescriptionStatus}
              onSelectPrescription={setSelectedPrescription}
            />
          </TabsContent>
        </Tabs>

        {/* AI Analysis Modal/Sidebar */}
        {selectedPrescription && (
          <PrescriptionDetailsPanel 
            prescription={selectedPrescription}
            onClose={() => setSelectedPrescription(null)}
            onStatusUpdate={updatePrescriptionStatus}
          />
        )}
      </div>
    </MainLayout>
  );
}

interface PrescriptionsListProps {
  prescriptions: PrescriptionRequest[];
  onStatusUpdate: (id: string, status: PrescriptionRequest['status'], notes?: string) => void;
  onSelectPrescription: (prescription: PrescriptionRequest) => void;
}

function PrescriptionsList({ prescriptions, onStatusUpdate, onSelectPrescription }: PrescriptionsListProps) {
  const getStatusColor = (status: PrescriptionRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ai_analyzed': return 'bg-purple-100 text-purple-800';
      case 'pharmacist_reviewed': return 'bg-blue-100 text-blue-800';
      case 'prepared': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PrescriptionRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'ai_analyzed': return <Brain className="h-4 w-4" />;
      case 'pharmacist_reviewed': return <Eye className="h-4 w-4" />;
      case 'prepared': return <Package className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'dispensed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: PrescriptionRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No prescriptions in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <Card key={prescription.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">RX #{prescription.id}</CardTitle>
                  <Badge className={getStatusColor(prescription.status)}>
                    {getStatusIcon(prescription.status)}
                    <span className="ml-1 capitalize">{prescription.status}</span>
                  </Badge>
                </div>
                <CardDescription>
                  Prescribed on {new Date(prescription.createdAt).toLocaleDateString()} at {new Date(prescription.createdAt).toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{prescription.patientName}</p>
                <p className="text-sm text-gray-500">Patient ID: {prescription.patientId}</p>
                <Badge className={getPriorityColor(prescription.priority)} variant="secondary">
                  {prescription.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prescription Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Stethoscope className="h-4 w-4" />
                  <span>Dr. {prescription.doctorName} • {prescription.department}</span>
                </div>
                
                {prescription.diagnosis && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Diagnosis</p>
                    <p className="text-sm text-blue-700">{prescription.diagnosis}</p>
                  </div>
                )}

                {prescription.pharmacistNotes && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Pharmacist Notes</p>
                    <p className="text-sm text-yellow-700">{prescription.pharmacistNotes}</p>
                  </div>
                )}

                {prescription.aiAnalysis && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-purple-800">AI Analysis Available</p>
                      <Badge variant="outline" className="text-purple-600">
                        {prescription.aiAnalysis.confidence}% Confidence
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectPrescription(prescription)}
                      className="w-full"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      View AI Analysis & Patient Education
                    </Button>
                  </div>
                )}
              </div>

              {/* Medications */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Medications</h4>
                {prescription.medications.map((med: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{med.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {med.duration}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Dosage:</strong> {med.dosage}</p>
                      <p><strong>Strength:</strong> {med.strength}</p>
                      <p><strong>Frequency:</strong> {med.frequency}</p>
                      <p><strong>Route:</strong> {med.route}</p>
                      <p><strong>Quantity:</strong> {med.quantity}</p>
                      <p><strong>Refills:</strong> {med.refills}</p>
                      <p><strong>Instructions:</strong> {med.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2 flex-wrap">
              {prescription.status === 'pending' && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg w-full">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">Waiting for AI analysis...</span>
                </div>
              )}

              {prescription.status === 'ai_analyzed' && (
                <>
                  <Button 
                    onClick={() => onStatusUpdate(prescription.id!, 'pharmacist_reviewed')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review & Approve
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onSelectPrescription(prescription)}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    View AI Analysis
                  </Button>
                </>
              )}
              
              {prescription.status === 'pharmacist_reviewed' && (
                <>
                  <Button 
                    onClick={() => onStatusUpdate(prescription.id!, 'prepared')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Start Preparation
                  </Button>
                </>
              )}

              {prescription.status === 'prepared' && (
                <>
                  <Button 
                    onClick={() => onStatusUpdate(prescription.id!, 'ready')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Ready for Pickup
                  </Button>
                </>
              )}
              
              {prescription.status === 'ready' && (
                <>
                  <Button 
                    onClick={() => onStatusUpdate(prescription.id!, 'dispensed')}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Dispense to Patient
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Patient
                  </Button>
                </>
              )}

              {prescription.status === 'dispensed' && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg w-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Dispensed on {new Date(prescription.updatedAt).toLocaleDateString()} - Patient portal updated
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Prescription Details Panel Component
interface PrescriptionDetailsPanelProps {
  prescription: PrescriptionRequest;
  onClose: () => void;
  onStatusUpdate: (id: string, status: PrescriptionRequest['status'], notes?: string) => void;
}

function PrescriptionDetailsPanel({ prescription, onClose, onStatusUpdate }: PrescriptionDetailsPanelProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
            <p className="text-sm text-gray-600">
              Patient: {prescription.patientName} • Dr. {prescription.doctorName} • {prescription.department}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prescription Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Prescription Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Patient Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {prescription.patientName}</p>
                    <p><strong>Patient ID:</strong> {prescription.patientId}</p>
                    <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                    <div><strong>Priority:</strong> <Badge className={getPriorityColor(prescription.priority)}>{prescription.priority}</Badge></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Prescription Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Prescribed by:</strong> Dr. {prescription.doctorName}</p>
                    <p><strong>Department:</strong> {prescription.department}</p>
                    <p><strong>Date:</strong> {new Date(prescription.prescribedAt).toLocaleDateString()}</p>
                    <div><strong>Status:</strong> <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-600" />
                Prescribed Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {prescription.medications.map((med: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-green-800">{med.name}</h5>
                      <Badge variant="outline">{med.duration}</Badge>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p><strong>Dosage:</strong> {med.dosage}</p>
                        <p><strong>Strength:</strong> {med.strength}</p>
                        <p><strong>Route:</strong> {med.route}</p>
                      </div>
                      <div>
                        <p><strong>Frequency:</strong> {med.frequency}</p>
                        <p><strong>Quantity:</strong> {med.quantity}</p>
                        <p><strong>Refills:</strong> {med.refills}</p>
                      </div>
                      <div>
                        <p><strong>Instructions:</strong></p>
                        <p className="text-gray-600">{med.instructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {prescription.aiAnalysis && (
            <AIAnalysisSection analysis={prescription.aiAnalysis} />
          )}

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {prescription.status === 'pending' && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg w-full">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-700">Waiting for AI analysis to complete...</span>
                  </div>
                )}

                {prescription.status === 'ai_analyzed' && (
                  <Button 
                    onClick={() => {
                      onStatusUpdate(prescription.id!, 'pharmacist_reviewed');
                      onClose();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review & Approve Prescription
                  </Button>
                )}
                
                {prescription.status === 'pharmacist_reviewed' && (
                  <Button 
                    onClick={() => {
                      onStatusUpdate(prescription.id!, 'prepared');
                      onClose();
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Start Medication Preparation
                  </Button>
                )}

                {prescription.status === 'prepared' && (
                  <Button 
                    onClick={() => {
                      onStatusUpdate(prescription.id!, 'ready');
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Ready for Patient Pickup
                  </Button>
                )}
                
                {prescription.status === 'ready' && (
                  <Button 
                    onClick={() => {
                      onStatusUpdate(prescription.id!, 'dispensed');
                      onClose();
                    }}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Dispense to Patient
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getPriorityColor(priority: PrescriptionRequest['priority']) {
  switch (priority) {
    case 'urgent': return 'bg-red-500 text-white';
    case 'high': return 'bg-orange-500 text-white';
    case 'normal': return 'bg-blue-500 text-white';
    case 'low': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

function getStatusColor(status: PrescriptionRequest['status']) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'ai_analyzed': return 'bg-purple-100 text-purple-800';
    case 'pharmacist_reviewed': return 'bg-blue-100 text-blue-800';
    case 'prepared': return 'bg-orange-100 text-orange-800';
    case 'ready': return 'bg-green-100 text-green-800';
    case 'dispensed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// AI Analysis Section Component
function AIAnalysisSection({ analysis }: { analysis: AIPharmacyAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Analysis & Patient Education
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            {analysis.confidence}% Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="effects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="food">Food Advice</TabsTrigger>
            <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
            <TabsTrigger value="education">Patient Education</TabsTrigger>
          </TabsList>
          
          <TabsContent value="effects" className="mt-4">
            <div className="space-y-4">
              {analysis.medicationEffects.map((effect, index) => (
                <div key={index} className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-2">{effect.medication}</h4>
                  <p className="text-blue-700 mb-2">{effect.primaryEffect}</p>
                  <div className="text-sm text-blue-600">
                    <p><strong>Onset:</strong> {effect.onsetTime} | <strong>Duration:</strong> {effect.duration}</p>
                    <p><strong>Mechanism:</strong> {effect.mechanismOfAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="food" className="mt-4">
            <div className="space-y-4">
              {analysis.foodAdvice.map((advice, index) => (
                <div key={index} className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">{advice.medication}</h4>
                  <div className="text-sm text-green-700 space-y-2">
                    <p><strong>Avoid:</strong> {advice.foodsToAvoid.join(', ')}</p>
                    <p><strong>Take with:</strong> {advice.foodsToTakeWith.join(', ')}</p>
                    <p><strong>Timing:</strong> {advice.timingWithMeals}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="side-effects" className="mt-4">
            <div className="space-y-4">
              {analysis.sideEffects.map((sideEffect, index) => (
                <div key={index} className="p-4 border rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">{sideEffect.medication}</h4>
                  <div className="text-sm text-red-700 space-y-2">
                    <p><strong>Common:</strong> {sideEffect.commonSideEffects.join(', ')}</p>
                    <p><strong>Serious:</strong> {sideEffect.seriousSideEffects.join(', ')}</p>
                    <p><strong>Seek help if:</strong> {sideEffect.whenToSeekHelp.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="mt-4">
            <div className="space-y-4">
              {analysis.patientEducation.map((education, index) => (
                <div key={index} className="p-4 border rounded-lg bg-purple-50">
                  <h4 className="font-semibold text-purple-800 mb-2">{education.medication}</h4>
                  <div className="text-sm text-purple-700 space-y-2">
                    <div>
                      <p><strong>Key Points:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        {education.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p><strong>Administration:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        {education.administrationTips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                    <p><strong>Storage:</strong> {education.storageInstructions.join(', ')}</p>
                    <p><strong>Missed Dose:</strong> {education.missedDoseInstructions}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// AI Analysis Panel Component (kept for backward compatibility)
interface AIAnalysisPanelProps {
  prescription: PrescriptionRequest;
  onClose: () => void;
}

function AIAnalysisPanel({ prescription, onClose }: AIAnalysisPanelProps) {
  const analysis = prescription.aiAnalysis;
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Pharmacy Analysis</h2>
            <p className="text-sm text-gray-600">
              Patient: {prescription.patientName} • Confidence: {analysis.confidence}%
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Medication Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Medication Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.medicationEffects.map((effect, index) => (
                <div key={index} className="p-4 border rounded-lg bg-blue-50 mb-4">
                  <h4 className="font-semibold text-blue-800">{effect.medication}</h4>
                  <p className="text-blue-700 mb-2">{effect.primaryEffect}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Onset:</strong> {effect.onsetTime}</p>
                      <p><strong>Duration:</strong> {effect.duration}</p>
                    </div>
                    <div>
                      <p><strong>Secondary Effects:</strong></p>
                      <ul className="list-disc list-inside">
                        {effect.secondaryEffects.map((se, i) => (
                          <li key={i}>{se}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    <strong>Mechanism:</strong> {effect.mechanismOfAction}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Food Advice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-600" />
                Food & Nutrition Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.foodAdvice.map((advice, index) => (
                <div key={index} className="p-4 border rounded-lg bg-green-50 mb-4">
                  <h4 className="font-semibold text-green-800">{advice.medication}</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <p><strong>Foods to Avoid:</strong></p>
                      <ul className="list-disc list-inside">
                        {advice.foodsToAvoid.map((food, i) => (
                          <li key={i}>{food}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p><strong>Take With:</strong></p>
                      <ul className="list-disc list-inside">
                        {advice.foodsToTakeWith.map((food, i) => (
                          <li key={i}>{food}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    <strong>Timing:</strong> {advice.timingWithMeals}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Activity Guidelines & Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.activityRestrictions.map((restriction, index) => (
                <div key={index} className="p-4 border rounded-lg bg-orange-50 mb-4">
                  <h4 className="font-semibold text-orange-800">{restriction.medication}</h4>
                  <div className="text-sm text-orange-700 space-y-2">
                    <div>
                      <p><strong>Precautions:</strong></p>
                      <ul className="list-disc list-inside">
                        {restriction.precautions.map((precaution, i) => (
                          <li key={i}>{precaution}</li>
                        ))}
                      </ul>
                    </div>
                    <p><strong>Duration:</strong> {restriction.duration}</p>
                    <div>
                      <p><strong>Safe Alternatives:</strong></p>
                      <ul className="list-disc list-inside">
                        {restriction.alternatives.map((alt, i) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Side Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Side Effects & Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.sideEffects.map((sideEffect, index) => (
                <div key={index} className="p-4 border rounded-lg bg-red-50 mb-4">
                  <h4 className="font-semibold text-red-800">{sideEffect.medication}</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-red-700">
                    <div>
                      <p><strong>Common Side Effects:</strong></p>
                      <ul className="list-disc list-inside">
                        {sideEffect.commonSideEffects.map((effect, i) => (
                          <li key={i}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p><strong>Serious Side Effects:</strong></p>
                      <ul className="list-disc list-inside">
                        {sideEffect.seriousSideEffects.map((effect, i) => (
                          <li key={i}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-red-600">
                    <p><strong>Seek Help If:</strong></p>
                    <ul className="list-disc list-inside">
                      {sideEffect.whenToSeekHelp.map((condition, i) => (
                        <li key={i}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Patient Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Patient Education Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.patientEducation.map((education, index) => (
                <div key={index} className="p-4 border rounded-lg bg-purple-50 mb-4">
                  <h4 className="font-semibold text-purple-800">{education.medication}</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div>
                      <p><strong>Key Points:</strong></p>
                      <ul className="list-disc list-inside">
                        {education.keyPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p><strong>Administration Tips:</strong></p>
                      <ul className="list-disc list-inside">
                        {education.administrationTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p><strong>Storage:</strong></p>
                      <ul className="list-disc list-inside">
                        {education.storageInstructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                    <p><strong>Missed Dose:</strong> {education.missedDoseInstructions}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Warnings & Contraindications */}
          {(analysis.warnings.length > 0 || analysis.contraindications.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Important Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.contraindications.length > 0 && (
                  <div className="p-4 border rounded-lg bg-red-100 mb-4">
                    <h4 className="font-semibold text-red-800 mb-2">Contraindications</h4>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {analysis.contraindications.map((contraindication, i) => (
                        <li key={i}>{contraindication}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.warnings.length > 0 && (
                  <div className="p-4 border rounded-lg bg-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-2">Warnings</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {analysis.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}