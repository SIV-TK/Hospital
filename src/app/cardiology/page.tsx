'use client';

import { useState, useEffect } from 'react';
import { Heart, TestTube, Brain, Activity, AlertTriangle, CheckCircle, Clock, Send, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/main-layout';
import { useToast } from '@/hooks/use-toast';
import { hospitalDB } from '@/lib/database-service';

interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  tests: string[];
  urgency: 'routine' | 'urgent' | 'stat';
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed';
  aiRecommendation?: string;
}

interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  value: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  completedAt: string;
  aiAnalysis?: {
    interpretation: string;
    clinicalSignificance: string;
    recommendations: string[];
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  };
}

export default function CardiologyPage() {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [directAiAnalysis, setDirectAiAnalysis] = useState('');
  const [isDirectAnalyzing, setIsDirectAnalyzing] = useState(false);
  const [prescribedMeds, setPrescribedMeds] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch patients from database
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        // Get current doctor's patients
        const doctorId = localStorage.getItem('userId') || 'dr_cardiology_001';
        const patientData = await hospitalDB.patients.getPatientsByDoctor(doctorId);
        
        // If no patients found, use mock data
        if (patientData.length === 0) {
          setPatients([
            { id: '1', name: 'John Smith', age: 65, condition: 'Chest pain, SOB', priority: 'urgent', userId: 'patient_001' },
            { id: '2', name: 'Mary Johnson', age: 58, condition: 'Hypertension follow-up', priority: 'routine', userId: 'patient_002' },
            { id: '3', name: 'Robert Chen', age: 72, condition: 'Post-MI care', priority: 'high', userId: 'patient_003' }
          ]);
        } else {
          // Transform database data to match component expectations
          const transformedPatients = patientData.map(patient => ({
            id: patient.id,
            name: `${patient.firstName || 'Patient'} ${patient.lastName || patient.id}`,
            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'Unknown',
            condition: patient.chronicConditions?.join(', ') || 'General consultation',
            priority: determinePriority(patient),
            userId: patient.userId,
            bloodType: patient.bloodType,
            allergies: patient.allergies,
            medicalHistory: patient.medicalHistory
          }));
          setPatients(transformedPatients);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        // Fallback to mock data
        setPatients([
          { id: '1', name: 'John Smith', age: 65, condition: 'Chest pain, SOB', priority: 'urgent' },
          { id: '2', name: 'Mary Johnson', age: 58, condition: 'Hypertension follow-up', priority: 'routine' },
          { id: '3', name: 'Robert Chen', age: 72, condition: 'Post-MI care', priority: 'high' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const determinePriority = (patient: any): string => {
    if (patient.chronicConditions?.some((condition: string) => 
      condition.toLowerCase().includes('heart') || 
      condition.toLowerCase().includes('cardiac') ||
      condition.toLowerCase().includes('chest pain')
    )) {
      return 'urgent';
    }
    if (patient.age > 70) return 'high';
    return 'routine';
  };

  const pharmacyMeds = [
    { id: '1', name: 'Lisinopril 10mg', stock: 45, aiGuidance: 'ACE inhibitor for hypertension. Take once daily in morning. Monitor BP and kidney function.' },
    { id: '2', name: 'Metoprolol 50mg', stock: 32, aiGuidance: 'Beta-blocker for heart rate control. Take twice daily with meals. Monitor heart rate <60 bpm.' },
    { id: '3', name: 'Atorvastatin 20mg', stock: 28, aiGuidance: 'Statin for cholesterol management. Take at bedtime. Monitor liver enzymes and muscle pain.' },
    { id: '4', name: 'Aspirin 81mg', stock: 67, aiGuidance: 'Antiplatelet for cardiovascular protection. Take once daily with food. Watch for bleeding.' },
    { id: '5', name: 'Furosemide 40mg', stock: 23, aiGuidance: 'Diuretic for fluid management. Take in morning. Monitor electrolytes and kidney function.' },
    { id: '6', name: 'Clopidogrel 75mg', stock: 19, aiGuidance: 'Antiplatelet for dual therapy. Take once daily. Monitor for bleeding and drug interactions.' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLabRequests(prev => {
        const updated = [...prev];
        const pendingIndex = updated.findIndex(req => req.status === 'pending');
        if (pendingIndex >= 0 && Math.random() > 0.7) {
          updated[pendingIndex].status = 'completed';
          
          const request = updated[pendingIndex];
          const mockResults: LabResult[] = request.tests.map(test => ({
            id: `${request.id}_${test}`,
            patientId: request.patientId,
            patientName: request.patientName,
            testName: test,
            value: generateMockValue(test),
            normalRange: getNormalRange(test),
            status: Math.random() > 0.7 ? 'abnormal' : 'normal',
            completedAt: new Date().toISOString(),
            aiAnalysis: {
              interpretation: `AI analysis of ${test} results`,
              clinicalSignificance: 'Requires cardiology review',
              recommendations: ['Monitor closely', 'Consider medication adjustment'],
              riskLevel: Math.random() > 0.5 ? 'moderate' : 'low'
            }
          }));
          
          setLabResults(prev => [...prev, ...mockResults]);
        }
        return updated;
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const generateMockValue = (test: string): string => {
    const values: Record<string, string> = {
      'Troponin I': Math.random() > 0.5 ? '0.02 ng/mL' : '0.15 ng/mL',
      'CK-MB': Math.random() > 0.5 ? '3.2 ng/mL' : '8.5 ng/mL',
      'BNP': Math.random() > 0.5 ? '85 pg/mL' : '450 pg/mL',
      'Lipid Panel': '180 mg/dL',
      'ECG': 'Normal sinus rhythm',
      'Echocardiogram': 'EF 55%'
    };
    return values[test] || 'Normal';
  };

  const getNormalRange = (test: string): string => {
    const ranges: Record<string, string> = {
      'Troponin I': '< 0.04 ng/mL',
      'CK-MB': '< 6.3 ng/mL',
      'BNP': '< 100 pg/mL',
      'Lipid Panel': '< 200 mg/dL',
      'ECG': 'Normal',
      'Echocardiogram': 'EF > 50%'
    };
    return ranges[test] || 'Normal';
  };

  const generateDirectAiAnalysis = async () => {
    if (!selectedPatient) return;
    
    setIsDirectAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = `AI CARDIOLOGY ASSESSMENT (Clinical Evaluation):

🔍 PATIENT EVALUATION:
• Patient: ${selectedPatient.name}, Age: ${selectedPatient.age}
• Symptoms: ${selectedPatient.condition}
• Vital Signs: Stable
• Physical Examination: Normal cardiac sounds

⚠️ CLINICAL ASSESSMENT:
• Risk Level: ${selectedPatient.priority === 'urgent' ? 'Moderate' : 'Low'}
• ${selectedPatient.priority === 'urgent' ? 'Requires immediate attention' : 'No immediate concerns detected'}
• Preventive care recommended

💊 DIRECT TREATMENT PLAN:
• Lifestyle counseling
• Regular exercise program
• Dietary modifications
• ${selectedPatient.priority === 'urgent' ? 'Schedule urgent follow-up' : 'Schedule routine follow-up'}

📊 AI CONFIDENCE: 92%`;
    
    setDirectAiAnalysis(analysis);
    setIsDirectAnalyzing(false);
  };

  const requestLabTests = async (patientId: string, tests: string[], urgency: 'routine' | 'urgent' | 'stat') => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const aiRecommendation = `Based on ${patient.condition}, recommended cardiac markers and imaging studies for comprehensive evaluation.`;

    const labRequest: LabRequest = {
      id: `lab_${Date.now()}`,
      patientId,
      patientName: patient.name,
      tests,
      urgency,
      requestedBy: 'Dr. Cardiologist',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      aiRecommendation
    };

    setLabRequests(prev => [...prev, labRequest]);
  };

  const cardiacTests = [
    'Troponin I',
    'CK-MB', 
    'BNP',
    'Lipid Panel',
    'ECG',
    'Echocardiogram',
    'Stress Test',
    'Holter Monitor'
  ];

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="relative mb-8 p-6 bg-gradient-to-r from-red-600 via-pink-600 to-rose-700 rounded-2xl text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Heart className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Cardiology Department</h1>
              <p className="text-xl text-red-100">Heart & Cardiovascular Care with AI-Powered Lab Integration</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-xl">
            <TabsTrigger value="patients" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg font-semibold">
              <User className="h-4 w-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="lab-requests" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg font-semibold">
              <TestTube className="h-4 w-4 mr-2" />
              Lab Requests ({labRequests.length})
            </TabsTrigger>
            <TabsTrigger value="lab-results" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg font-semibold">
              <CheckCircle className="h-4 w-4 mr-2" />
              Results ({labResults.length})
            </TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg font-semibold">
              <Activity className="h-4 w-4 mr-2" />
              Medications ({prescribedMeds.length})
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg font-semibold">
              <Brain className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="mt-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Heart className="h-6 w-6" />
                  Cardiology Patients
                </CardTitle>
                <CardDescription>Select a patient to request lab tests and view cardiac assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading patients...</p>
                    </div>
                  ) : patients.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No patients assigned to you yet.</p>
                    </div>
                  ) : (
                    patients.map(patient => (
                    <Card key={patient.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer" 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveTab('lab-requests');
                          }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-full">
                              <Heart className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{patient.name}</h3>
                              <p className="text-gray-600">{patient.age} years old</p>
                              <p className="text-sm text-gray-500">{patient.condition}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={patient.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {patient.priority}
                            </Badge>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              Start Treatment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))
                  )}
                </div>
                
                {selectedPatient && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">🤖 AI Treatment Assistant</h3>
                      <p className="text-purple-600 mb-4">Choose treatment approach for {selectedPatient.name}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setActiveTab('lab-requests')}
                          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>🧪</span>
                          <span>Request Lab Tests</span>
                        </button>
                        
                        <button
                          onClick={generateDirectAiAnalysis}
                          disabled={isDirectAnalyzing}
                          className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <span>🤖</span>
                          <span>{isDirectAnalyzing ? 'Analyzing...' : 'Direct AI Analysis'}</span>
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          onClick={() => setActiveTab('medications')}
                          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>💊</span>
                          <span>Prescribe Medications</span>
                        </button>
                      </div>
                    </div>
                    
                    {directAiAnalysis && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">🤖 AI Analysis Complete</h3>
                        <pre className="text-sm text-green-700 whitespace-pre-wrap font-mono">{directAiAnalysis}</pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-requests" className="mt-8">
            {selectedPatient && (
              <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="bg-blue-100 border-b border-blue-200">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Request Lab Tests for {selectedPatient.name}
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    AI-recommended cardiac tests based on patient condition: {selectedPatient.condition}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">AI Recommended Tests</h4>
                      <div className="space-y-2">
                        {['Troponin I', 'ECG', 'BNP'].map(test => (
                          <div key={test} className="p-3 bg-white rounded border-l-4 border-blue-400 flex items-center gap-3">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{test}</span>
                            <Badge className="bg-blue-100 text-blue-800">AI Recommended</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">Select Tests to Order</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {cardiacTests.map(test => (
                          <Button 
                            key={test} 
                            variant={selectedTests.includes(test) ? "default" : "outline"} 
                            size="sm" 
                            className="justify-start"
                            onClick={() => {
                              if (selectedTests.includes(test)) {
                                setSelectedTests(prev => prev.filter(t => t !== test));
                              } else {
                                setSelectedTests(prev => [...prev, test]);
                              }
                            }}
                          >
                            <TestTube className="h-3 w-3 mr-2" />
                            {test}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={() => requestLabTests(selectedPatient.id, ['Troponin I', 'ECG', 'BNP'], 'urgent')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Request AI Recommended Tests
                    </Button>
                    <Button 
                      onClick={() => selectedTests.length > 0 && requestLabTests(selectedPatient.id, selectedTests, 'routine')}
                      disabled={selectedTests.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      Request Selected Tests ({selectedTests.length})
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('medications')}
                    >
                      Skip Lab Tests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Clock className="h-6 w-6" />
                  Pending Lab Requests
                </CardTitle>
                <CardDescription>Track lab test requests and processing status</CardDescription>
              </CardHeader>
              <CardContent>
                {labRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No lab requests yet. Select a patient to request tests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {labRequests.map(request => (
                      <Card key={request.id} className={`border-l-4 ${
                        request.status === 'completed' ? 'border-green-400 bg-green-50' :
                        request.status === 'processing' ? 'border-yellow-400 bg-yellow-50' :
                        'border-orange-400 bg-orange-50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{request.patientName}</h3>
                              <p className="text-sm text-gray-600">Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {request.tests.map(test => (
                                  <Badge key={test} variant="outline" className="text-xs">{test}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={request.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                                {request.urgency}
                              </Badge>
                              <Badge className={`${
                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                          {request.aiRecommendation && (
                            <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                              <div className="flex items-start gap-2">
                                <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                                <p className="text-sm text-purple-700">{request.aiRecommendation}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lab-results" className="mt-8">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-6 w-6" />
                  Lab Results Ready for Review
                </CardTitle>
                <CardDescription>Review completed lab results with AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {labResults.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No results available yet. Results will appear here when ready.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {labResults.map(result => (
                      <Card key={result.id} className={`border-l-4 ${
                        result.status === 'critical' ? 'border-red-400 bg-red-50' :
                        result.status === 'abnormal' ? 'border-yellow-400 bg-yellow-50' :
                        'border-green-400 bg-green-50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{result.patientName}</h3>
                                <Badge className="text-xs">{result.testName}</Badge>
                              </div>
                              <div className="grid md:grid-cols-3 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-600">Result Value</p>
                                  <p className="font-semibold">{result.value}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Normal Range</p>
                                  <p className="font-semibold">{result.normalRange}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Completed</p>
                                  <p className="font-semibold">{new Date(result.completedAt).toLocaleString()}</p>
                                </div>
                              </div>
                              {result.aiAnalysis && (
                                <div className="p-3 bg-white rounded border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-purple-800">AI Analysis</span>
                                    <Badge className={`text-xs ${
                                      result.aiAnalysis.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                      result.aiAnalysis.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                      result.aiAnalysis.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {result.aiAnalysis.riskLevel} risk
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{result.aiAnalysis.interpretation}</p>
                                  <p className="text-sm text-gray-600">{result.aiAnalysis.clinicalSignificance}</p>
                                </div>
                              )}
                            </div>
                            <Badge className={`${
                              result.status === 'critical' ? 'bg-red-100 text-red-800' :
                              result.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {result.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="mt-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="bg-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Activity className="h-6 w-6" />
                  Pharmacy - Available Medications
                </CardTitle>
                <CardDescription className="text-green-700">
                  {selectedPatient ? `Prescribe medications for ${selectedPatient.name}` : 'Select a patient to prescribe medications'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!selectedPatient ? (
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a patient first to prescribe medications.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pharmacyMeds.map(med => (
                      <Card key={med.id} className={`border-l-4 transition-all duration-300 ${
                        prescribedMeds.includes(med.id) ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{med.name}</h3>
                                <Badge className={med.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                  Stock: {med.stock}
                                </Badge>
                                {prescribedMeds.includes(med.id) && (
                                  <Badge className="bg-blue-100 text-blue-800">Prescribed</Badge>
                                )}
                              </div>
                              <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                <div className="flex items-start gap-2">
                                  <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-purple-800">AI Guidance:</p>
                                    <p className="text-sm text-purple-700">{med.aiGuidance}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                if (prescribedMeds.includes(med.id)) {
                                  setPrescribedMeds(prev => prev.filter(id => id !== med.id));
                                } else {
                                  setPrescribedMeds(prev => [...prev, med.id]);
                                }
                              }}
                              className={prescribedMeds.includes(med.id) ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                            >
                              {prescribedMeds.includes(med.id) ? 'Remove' : 'Prescribe'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Prescription Recommendations
                      </h3>
                      <p className="text-purple-600 mb-3">Based on {selectedPatient.condition}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['Lisinopril 10mg', 'Aspirin 81mg'].map(med => {
                          const medData = pharmacyMeds.find(m => m.name === med);
                          return medData ? (
                            <div key={med} className="p-3 bg-white rounded border-l-4 border-purple-400 flex items-center justify-between">
                              <div>
                                <span className="font-medium">{med}</span>
                                <p className="text-xs text-purple-600">AI Recommended</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!prescribedMeds.includes(medData.id)) {
                                    setPrescribedMeds(prev => [...prev, medData.id]);
                                  }
                                }}
                                disabled={prescribedMeds.includes(medData.id)}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                              >
                                {prescribedMeds.includes(medData.id) ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    {prescribedMeds.length > 0 && (
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-blue-800">Prescription Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {prescribedMeds.map(medId => {
                              const med = pharmacyMeds.find(m => m.id === medId);
                              return med ? (
                                <div key={medId} className="flex items-center justify-between p-2 bg-white rounded">
                                  <span className="font-medium">{med.name}</span>
                                  <Badge className="bg-blue-100 text-blue-800">Prescribed</Badge>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <Button 
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                            onClick={async () => {
                              if (selectedPatient && prescribedMeds.length > 0) {
                                try {
                                  const { submitCardiologyPrescription } = await import('@/lib/pharmacy-service');
                                  const medNames = prescribedMeds.map(medId => {
                                    const med = pharmacyMeds.find(m => m.id === medId);
                                    return med?.name || '';
                                  }).filter(Boolean);
                                  
                                  await submitCardiologyPrescription(selectedPatient, medNames);
                                  setPrescribedMeds([]);
                                  setActiveTab('ai-analysis');
                                } catch (error) {
                                  console.error('Error sending to pharmacy:', error);
                                }
                              }
                            }}
                          >
                            Send to Pharmacy ({prescribedMeds.length} medications)
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-analysis" className="mt-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="bg-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Brain className="h-6 w-6" />
                  AI-Powered Cardiac Analysis
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Comprehensive AI analysis of patient data and lab results
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {labResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">AI analysis will appear here once lab results are available.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-blue-800">Cardiac Risk Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-white rounded">
                            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <p className="font-semibold">Overall Risk</p>
                            <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                          </div>
                          <div className="text-center p-4 bg-white rounded">
                            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                            <p className="font-semibold">Cardiac Function</p>
                            <Badge className="bg-green-100 text-green-800">Stable</Badge>
                          </div>
                          <div className="text-center p-4 bg-white rounded">
                            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                            <p className="font-semibold">Intervention Needed</p>
                            <Badge className="bg-blue-100 text-blue-800">Monitoring</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-green-800">AI Treatment Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded border-l-4 border-green-400">
                            <p className="font-medium">Medication Adjustment</p>
                            <p className="text-sm text-gray-600">Consider ACE inhibitor optimization based on current BP readings</p>
                          </div>
                          <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                            <p className="font-medium">Follow-up Testing</p>
                            <p className="text-sm text-gray-600">Repeat lipid panel in 6 weeks to assess statin therapy effectiveness</p>
                          </div>
                          <div className="p-3 bg-white rounded border-l-4 border-yellow-400">
                            <p className="font-medium">Lifestyle Modifications</p>
                            <p className="text-sm text-gray-600">Cardiac rehabilitation program recommended for optimal recovery</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}