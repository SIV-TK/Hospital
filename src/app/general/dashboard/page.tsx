'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Shield, 
  Brain, 
  Activity, 
  Apple, 
  Moon, 
  Droplets,
  Calendar,
  BookOpen,
  Users,
  Award,
  AlertCircle,
  ArrowRight,
  Zap,
  Leaf,
  Timer,
  CreditCard,
  Wallet,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { InsuranceWidget } from '@/components/pages/insurance-widget';
import { useSession } from '@/hooks/use-session';
import { generalFinanceService, type GeneralBill, type FinancialSummary } from '@/lib/general-finance-service';
import MpesaPaymentModal from '@/components/ui/mpesa-payment-modal';
import { useState, useEffect } from 'react';

export default function GeneralDashboard() {
  const { session } = useSession();
  const [bills, setBills] = useState<GeneralBill[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<GeneralBill | null>(null);

  useEffect(() => {
    if (session) {
      loadFinanceData();
    }
  }, [session]);
  
  if (!session) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to access the dashboard.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const loadFinanceData = async () => {
    const [billsData, summaryData] = await Promise.all([
      generalFinanceService.getBills(),
      generalFinanceService.getFinancialSummary()
    ]);
    setBills(billsData);
    setFinancialSummary(summaryData);
  };

  const handlePayBill = (bill: GeneralBill) => {
    setSelectedBill(bill);
    setShowMpesaModal(true);
  };

  const handlePaymentSuccess = () => {
    loadFinanceData();
    setShowMpesaModal(false);
    setSelectedBill(null);
  };
  
  // Mock user data for demonstration
  const userProfile = {
    name: 'Alex Johnson',
    age: 32,
    memberSince: 'January 2024',
    healthScore: 78,
    completedAssessments: 3,
    activeGoals: 5,
    streakDays: 12,
  };

  const healthMetrics = {
    steps: { current: 8420, target: 10000, percentage: 84 },
    water: { current: 6, target: 8, percentage: 75 },
    sleep: { current: 7.2, target: 8, percentage: 90 },
    calories: { current: 1850, target: 2100, percentage: 88 },
  };

  const upcomingGoals = [
    { id: 1, title: 'Walk 10,000 steps daily', progress: 84, category: 'Fitness', dueDate: 'Today' },
    { id: 2, title: 'Drink 8 glasses of water', progress: 75, category: 'Nutrition', dueDate: 'Today' },
    { id: 3, title: 'Sleep 8 hours nightly', progress: 90, category: 'Recovery', dueDate: 'Ongoing' },
    { id: 4, title: 'Complete weekly meal prep', progress: 60, category: 'Nutrition', dueDate: 'Sunday' },
    { id: 5, title: 'Practice meditation 10 min', progress: 40, category: 'Mental Health', dueDate: 'Daily' },
  ];

  const personalizedServices = [
    {
      id: 1,
      title: 'Personalized Health Plan',
      description: 'Get AI-powered recommendations based on your unique health profile',
      icon: Target,
      color: 'bg-red-500',
      href: '/general/personalized-health',
      status: 'Recommended',
      estimatedTime: '15 min assessment',
    },
    {
      id: 2,
      title: 'Nutrition Optimization',
      description: 'Personalized meal plans and nutrition guidance',
      icon: Apple,
      color: 'bg-green-500',
      href: '/general/nutrition',
      status: 'Available',
      estimatedTime: '10 min setup',
    },
    {
      id: 3,
      title: 'Fitness Coaching',
      description: 'Custom workout plans adapted to your fitness level',
      icon: Activity,
      color: 'bg-blue-500',
      href: '/general/fitness',
      status: 'Available',
      estimatedTime: '12 min assessment',
    },
    {
      id: 4,
      title: 'Sleep Optimization',
      description: 'Improve sleep quality with personalized strategies',
      icon: Moon,
      color: 'bg-indigo-500',
      href: '/general/sleep',
      status: 'Available',
      estimatedTime: '8 min evaluation',
    },
    {
      id: 5,
      title: 'Mental Wellness',
      description: 'Stress management and mental health support',
      icon: Brain,
      color: 'bg-purple-500',
      href: '/general/mental-health',
      status: 'Available',
      estimatedTime: '15 min screening',
    },
    {
      id: 6,
      title: 'Preventive Care',
      description: 'Personalized screening recommendations and health monitoring',
      icon: Shield,
      color: 'bg-orange-500',
      href: '/general/preventive-care',
      status: 'Available',
      estimatedTime: '5 min checkup',
    },
    {
      id: 7,
      title: 'Blood Donation Hub',
      description: 'Track donations, transfusions, and earn life-saving rewards',
      icon: Heart,
      color: 'bg-red-500',
      href: '/blood-donation',
      status: 'Recommended',
      estimatedTime: '3 min setup',
    },
  ];

  const healthInsights = [
    {
      id: 1,
      title: 'Your Health Score Improved!',
      description: 'Your health score increased by 8 points this month through consistent habits.',
      type: 'success',
      icon: TrendingUp,
      action: 'View Details',
    },
    {
      id: 2,
      title: 'Hydration Reminder',
      description: 'You\'re 2 glasses behind your daily water goal. Stay hydrated!',
      type: 'warning',
      icon: Droplets,
      action: 'Track Water',
    },
    {
      id: 3,
      title: 'Sleep Pattern Analysis',
      description: 'Your sleep quality has improved 15% over the past week.',
      type: 'info',
      icon: Moon,
      action: 'View Sleep Data',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'Fitness': 'bg-blue-100 text-blue-800',
      'Nutrition': 'bg-green-100 text-green-800',
      'Recovery': 'bg-purple-100 text-purple-800',
      'Mental Health': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile.name}! 👋
              </h1>
              <p className="text-gray-600">
                Your personalized health journey continues • Member since {userProfile.memberSince}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{userProfile.healthScore}/100</div>
              <div className="text-sm text-gray-500">Health Score</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Steps</p>
                  <p className="text-2xl font-bold">{healthMetrics.steps.current.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={healthMetrics.steps.percentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Water Intake</p>
                  <p className="text-2xl font-bold">{healthMetrics.water.current}/{healthMetrics.water.target} glasses</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-400" />
              </div>
              <Progress value={healthMetrics.water.percentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sleep Quality</p>
                  <p className="text-2xl font-bold">{healthMetrics.sleep.current}h</p>
                </div>
                <Moon className="h-8 w-8 text-indigo-500" />
              </div>
              <Progress value={healthMetrics.sleep.percentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Streak</p>
                  <p className="text-2xl font-bold">{userProfile.streakDays} days</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2 text-xs text-green-600 font-medium">Keep it up! 🔥</div>
            </CardContent>
          </Card>


        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personalized Services */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Personalized Health Services
                </CardTitle>
                <CardDescription>
                  AI-powered tools tailored to your unique health profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {personalizedServices.map((service) => {
                    const IconComponent = service.icon;
                    return (
                      <Card key={service.id} className="hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${service.color}`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                                <Badge variant={service.status === 'Recommended' ? 'default' : 'secondary'}>
                                  {service.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Timer className="h-3 w-3" />
                                  {service.estimatedTime}
                                </div>
                                <Link href={service.href}>
                                  <Button size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-300">
                                    Start <ArrowRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>



            {/* Health Insights */}
            <Card className="shadow-lg mt-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Health Insights
                </CardTitle>
                <CardDescription>Personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthInsights.map((insight) => {
                    const IconComponent = insight.icon;
                    const bgColor = insight.type === 'success' ? 'bg-green-50 border-green-200' : 
                                   insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                                   'bg-blue-50 border-blue-200';
                    const iconColor = insight.type === 'success' ? 'text-green-600' : 
                                     insight.type === 'warning' ? 'text-yellow-600' : 
                                     'text-blue-600';
                    
                    return (
                      <div key={insight.id} className={`p-3 rounded-lg border ${bgColor}`}>
                        <div className="flex items-start gap-3">
                          <IconComponent className={`h-5 w-5 ${iconColor} mt-0.5`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                            <Button size="sm" variant="ghost" className="text-xs p-0 h-auto">
                              {insight.action} <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Reminders */}
            <Card className="shadow-lg border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  AI Reminders
                </CardTitle>
                <CardDescription>Personalized health suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">💊 Medication Time</p>
                    <p className="text-xs text-blue-700">Take your vitamin D supplement in 30 minutes</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">🚶 Activity Goal</p>
                    <p className="text-xs text-green-700">You're 1,580 steps away from your daily goal</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">🩺 Health Check</p>
                    <p className="text-xs text-purple-700">Schedule your annual checkup - it's been 11 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Health Check
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Health Learning Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Connect with Community
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Emergency Resources
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="shadow-lg border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Active Goals
                </CardTitle>
                <CardDescription>{userProfile.activeGoals} goals in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{goal.title}</h4>
                        <Badge variant="outline" className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{goal.progress}% complete</span>
                        <span>{goal.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Target className="mr-2 h-4 w-4" />
                  Manage Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* M-Pesa Payment Modal */}
        {selectedBill && (
          <MpesaPaymentModal
            isOpen={showMpesaModal}
            onClose={() => setShowMpesaModal(false)}
            billId={selectedBill.id}
            amount={selectedBill.amount}
            patientId={session?.userId || 'general-user'}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </MainLayout>
  );
}
