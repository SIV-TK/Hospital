'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useSession } from '@/hooks/use-session';
import { labResultsService, HospitalLabQueue, LabOrder, LabResult, LabTest } from '@/lib/lab-results-service';
import { mockLabOrders, mockLabResults, mockPatientQueue } from '@/lib/mock-lab-data';
import { LabProcessingInterface } from '@/components/pages/lab-processing-interface';
import { 
  Beaker, 
  ClipboardList, 
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  GraduationCap,
  Cpu,
  ArrowRight,
  User,
  Play
} from 'lucide-react';

interface AIAnalysisProps {
  analysis: any;
}

function AIAnalysisPanel({ analysis }: AIAnalysisProps) {
  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-6 border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
          <Cpu className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">AI Clinical Analysis</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              {analysis.confidence}% Confidence
            </span>
            <span className="text-xs text-gray-600">Medical Grade AI</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Clinical Interpretation</h4>
          <p className="text-gray-700 text-sm">{analysis.interpretation}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Clinical Significance</h4>
          <p className="text-gray-700 text-sm">{analysis.clinicalSignificance}</p>
        </div>
        
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            analysis.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
            analysis.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
            analysis.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            Risk: {analysis.riskLevel}
          </span>
          <span className="text-gray-500">Accuracy: {analysis.accuracy}%</span>
        </div>
      </div>
    </div>
  );
}

export default function LabResultsPage() {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState('queue');
  const [labQueue, setLabQueue] = useState<HospitalLabQueue | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showProcessingInterface, setShowProcessingInterface] = useState(false);

  useEffect(() => {
    // Check if user should access hospital lab management or patient portal
    if (session && (session as any).userType === 'patient') {
      // Redirect patients to their personal lab results portal
      window.location.href = '/patient/dashboard';
      return;
    }
    loadLabData();
  }, [session]);

  const loadLabData = async () => {
    try {
      // For demonstration, use mock data
      const mockQueue: HospitalLabQueue = {
        pendingSamples: mockLabOrders.filter(o => o.status === 'ordered' || o.status === 'sample_collected'),
        processingSamples: mockLabOrders.filter(o => o.status === 'processing'),
        completedSamples: mockLabOrders.filter(o => o.status === 'completed'),
        criticalResults: mockLabResults.filter(r => r.status === 'critical'),
        dailyStats: {
          totalOrders: mockLabOrders.length,
          completed: mockLabOrders.filter(o => o.status === 'completed').length,
          pending: mockLabOrders.filter(o => o.status !== 'completed').length,
          criticalResults: mockLabResults.filter(r => r.status === 'critical').length
        }
      };
      
      setLabQueue(mockQueue);
      setAvailableTests(labResultsService.getAvailableLabTests());
    } catch (error) {
      console.error('Error loading lab data:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: LabOrder['status']) => {
    try {
      await labResultsService.updateLabOrderStatus(orderId, newStatus);
      loadLabData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setShowProcessingInterface(true);
  };

  const handleProcessingComplete = (results: any) => {
    console.log('Lab processing completed:', results);
    // Here you would typically send the results to the backend
    // and update the patient status in the queue
    setShowProcessingInterface(false);
    setSelectedPatient(null);
    loadLabData(); // Refresh the queue
  };

  const handleBackToQueue = () => {
    setShowProcessingInterface(false);
    setSelectedPatient(null);
  };

  const filteredTests = availableTests.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show access control message for unauthorized users
  if (session && (session as any).userType === 'patient') {
    return (
      <MainLayout>
        <AuthGuard>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
              <Beaker className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
              <p className="text-gray-600 mb-6">
                This is the hospital laboratory management system. As a patient, you can view your lab results in your personal dashboard.
              </p>
              <button
                onClick={() => window.location.href = '/patient/dashboard'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                Go to My Lab Results
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </AuthGuard>
      </MainLayout>
    );
  }

  if (!labQueue) {
    return (
      <MainLayout>
        <AuthGuard>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <Beaker className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Lab Data...</h2>
            </div>
          </div>
        </AuthGuard>
      </MainLayout>
    );
  }

  // Show processing interface if patient is selected
  if (showProcessingInterface && selectedPatient) {
    return (
      <LabProcessingInterface
        patient={selectedPatient}
        onBack={handleBackToQueue}
        onSubmit={handleProcessingComplete}
      />
    );
  }

  return (
    <MainLayout>
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="relative mb-8 p-6 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-700 rounded-2xl text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Beaker className="h-10 w-10" />
                  </div>
                  <h1 className="text-4xl font-bold">
                    Lab Results Analyzer
                  </h1>
                </div>
                <p className="text-xl text-blue-100">
                  AI-Powered Laboratory Management & Analysis System
                </p>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span>AI Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Medical Grade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Real-time Processing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-0 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">Total Orders</p>
                    <p className="text-4xl font-bold text-blue-900">{labQueue.dailyStats.totalOrders}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1 bg-blue-200 rounded">
                        <ClipboardList className="h-3 w-3 text-blue-700" />
                      </div>
                      <span className="text-sm font-medium text-blue-700">Today's queue</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border-0 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-yellow-700 mb-1">Pending</p>
                    <p className="text-4xl font-bold text-yellow-900">{labQueue.dailyStats.pending}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1 bg-yellow-200 rounded">
                        <Clock className="h-3 w-3 text-yellow-700" />
                      </div>
                      <span className="text-sm font-medium text-yellow-700">In progress</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-0 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">Completed</p>
                    <p className="text-4xl font-bold text-green-900">{labQueue.dailyStats.completed}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1 bg-green-200 rounded">
                        <CheckCircle className="h-3 w-3 text-green-700" />
                      </div>
                      <span className="text-sm font-medium text-green-700">Processed</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border-0 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">Critical</p>
                    <p className="text-4xl font-bold text-red-900">{labQueue.dailyStats.criticalResults}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1 bg-red-200 rounded">
                        <AlertTriangle className="h-3 w-3 text-red-700" />
                      </div>
                      <span className="text-sm font-medium text-red-700">Urgent alerts</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-0">
              <div className="flex space-x-1 bg-gradient-to-r from-gray-50 to-gray-100 p-2">
                {[
                  { id: 'queue', label: 'Patient Queue', icon: Users, color: 'blue' },
                  { id: 'tests', label: 'Lab Tests Directory', icon: Beaker, color: 'teal' },
                  { id: 'results', label: 'Results & AI Analysis', icon: BarChart3, color: 'purple' },
                  { id: 'critical', label: 'Critical Results', icon: AlertTriangle, color: 'red' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 flex-1 py-4 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-white text-${tab.color}-600 shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Patient Queue Tab */}
                {activeTab === 'queue' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">Patient Treatment Queue</h2>
                      <div className="text-sm text-gray-600">
                        {mockPatientQueue.length} patients in queue
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {mockPatientQueue.map((patient, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <User className="h-5 w-5 text-gray-400" />
                                <h3 className="font-semibold text-gray-900">{patient.patientName}</h3>
                                <span className="text-sm text-gray-500">#{patient.id}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <p><span className="font-medium">Age:</span> {patient.age}</p>
                                  <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                                  <p><span className="font-medium">Department:</span> {patient.department}</p>
                                </div>
                                <div>
                                  <p><span className="font-medium">Doctor:</span> {patient.doctorName}</p>
                                  <p><span className="font-medium">Order Date:</span> {patient.orderDate}</p>
                                  <p><span className="font-medium">Expected:</span> {patient.expectedTime}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">Tests Ordered:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {patient.testsOrdered.map((test, testIndex) => (
                                    <span key={testIndex} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                      {test}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  patient.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  patient.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {patient.priority}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  patient.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  patient.status === 'waiting' ? 'bg-gray-100 text-gray-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {patient.status.replace('_', ' ')}
                                </span>
                              </div>
                              <button
                                onClick={() => handlePatientSelect(patient)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                              >
                                <Play className="h-4 w-4" />
                                Process Patient
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab Tests Directory Tab */}
                {activeTab === 'tests' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">Lab Tests Directory</h2>
                      <div className="text-sm text-gray-600">
                        {availableTests.length} tests available
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search tests by name or code..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        <option value="blood">Blood Tests</option>
                        <option value="urine">Urine Tests</option>
                        <option value="biochemistry">Biochemistry</option>
                        <option value="microbiology">Microbiology</option>
                        <option value="pathology">Pathology</option>
                        <option value="radiology">Radiology</option>
                        <option value="genetics">Genetics</option>
                      </select>
                    </div>

                    {/* Tests Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTests.map((test, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-gray-900">{test.testName}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {test.testCode}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                          <div className="space-y-2 text-xs text-gray-500">
                            <p><strong>Sample:</strong> {test.sampleType}</p>
                            <p><strong>Processing Time:</strong> {test.processingTime}</p>
                            <p><strong>Cost:</strong> ${test.cost}</p>
                            <p><strong>Normal Range:</strong> {test.normalRange.description}</p>
                          </div>
                          {test.preparationInstructions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-700 mb-1">Preparation:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {test.preparationInstructions.map((instruction, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-blue-600">•</span>
                                    {instruction}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results & AI Analysis Tab */}
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Results & AI Analysis</h2>
                    
                    <div className="grid gap-6">
                      {mockLabResults.map((result) => (
                        <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{result.patientName}</h3>
                              <p className="text-gray-600">{result.testName}</p>
                              <p className="text-sm text-gray-500">
                                Result: <span className="font-medium">{result.value} {result.unit}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                result.status === 'critical' ? 'bg-red-100 text-red-800' :
                                result.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {result.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(result.resultDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {result.aiAnalysis && <AIAnalysisPanel analysis={result.aiAnalysis} />}
                          
                          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                            <p>Technician: {result.technicianName}</p>
                            {result.verified && (
                              <p>Verified by: {result.verifiedBy} on {new Date(result.verificationDate!).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Results Tab */}
                {activeTab === 'critical' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Critical Results Alert</h2>
                    </div>
                    
                    {labQueue.criticalResults.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Critical Results</h3>
                        <p className="text-gray-600">All current lab results are within acceptable ranges.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {labQueue.criticalResults.map((result) => (
                          <div key={result.id} className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  <h3 className="font-semibold text-red-900">{result.patientName}</h3>
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">CRITICAL</span>
                                </div>
                                <p className="text-red-800 font-medium">{result.testName}</p>
                                <p className="text-red-700">
                                  Result: <span className="font-bold">{result.value} {result.unit}</span>
                                </p>
                                {result.aiAnalysis && (
                                  <p className="text-red-700 text-sm mt-2">
                                    <strong>AI Analysis:</strong> {result.aiAnalysis.interpretation}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-red-600">
                                  {new Date(result.resultDate).toLocaleDateString()}
                                </p>
                                <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                                  Notify Doctor
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </MainLayout>
  );
}