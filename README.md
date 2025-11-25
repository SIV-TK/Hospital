# MediAssist AI - Hospital Management System

**Developed by:** James Kariuki  
**Contact:** jamexkarix583@gmail.com | +254 718 845 849

**Built for:** AI HACKATHON 2025 EDITION  
**Hosted by:** NIRU - Centre for Research and Innovation  
**Theme:** AI for National Prosperity: Leveraging Innovation for Sustainable Development and Security

A comprehensive AI-powered hospital management system built with Next.js 15, Firebase, and Google AI (Genkit). This platform digitizes and streamlines all hospital operations from patient registration to discharge, contributing to national healthcare prosperity through innovative AI solutions.

## 🏥 Core Features

### **Patient Management**
- Complete patient registration and profile management
- Medical history tracking and chronic condition monitoring
- Emergency contact management and insurance integration
- Real-time vital signs monitoring and medication tracking

### **Doctor Dashboard & Departments**
- **Cardiology Department** - Specialized cardiac care with AI-powered diagnostics
- **General Medicine** - Comprehensive primary care management
- **Laboratory Services** - Integrated lab test ordering and result analysis
- **Pharmacy Integration** - Prescription management with AI drug interaction checks
- Real-time patient data fetching from centralized database
- Department-specific workflows and protocols

### **AI-Powered Healthcare**
- **Smart Diagnostics** - AI analysis of symptoms and medical data
- **Drug Interaction Detection** - Automated prescription safety checks
- **Lab Result Analysis** - AI interpretation of test results
- **Treatment Recommendations** - Evidence-based care suggestions
- **Patient Education** - Personalized health information delivery

### **Laboratory Management**
- Comprehensive test ordering system (Blood, Urine, Cardiac, Imaging)
- Real-time result processing and AI analysis
- Critical value alerts and automated notifications
- Integration with doctor workflows for seamless care

### **Pharmacy Operations**
- Complete medication inventory management
- AI-powered prescription analysis and safety checks
- Real-time dispensing workflow (Pending → AI Analyzed → Reviewed → Prepared → Ready → Dispensed)
- Patient medication counseling and education materials
- Drug interaction warnings and contraindication alerts

### **Appointment & Scheduling**
- Intelligent appointment booking system
- Doctor availability management
- Automated reminder notifications
- Emergency appointment prioritization

### **Billing & Finance**
- Comprehensive billing management
- Insurance claim processing
- Payment tracking and financial reporting
- Cost estimation and transparency

### **Communication System**
- Real-time notifications across all departments
- Emergency alert system
- Inter-departmental messaging
- Patient portal communications

## 🚀 Technical Stack

- **Frontend**: Next.js 15.3.3 with TypeScript
- **Backend**: Firebase Firestore for real-time database
- **AI Integration**: Google AI (Genkit) for intelligent healthcare features
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Authentication**: Firebase Auth with role-based access control
- **Real-time Updates**: Firebase real-time subscriptions

## 📊 Database Architecture

### **Collections Structure**
- **Users & Roles**: Patients, Doctors, Nurses, Pharmacists, Administrators
- **Medical Operations**: Appointments, Consultations, Prescriptions, Lab Tests
- **Department Management**: Rooms, Beds, Equipment, Schedules
- **Pharmacy**: Medications, Inventory, Dispensing Records
- **Billing**: Bills, Payments, Insurance Claims
- **AI Analytics**: Analysis Results, Patient Education, Hospital Metrics
- **Communication**: Notifications, Messages, Emergency Alerts

## 🔐 Security & Compliance

- Role-based access control (RBAC)
- HIPAA-compliant data handling
- Encrypted patient data storage
- Audit trails for all medical actions
- Secure authentication and authorization

## 🎯 Key Workflows

### **Patient Journey**
1. Registration → Appointment Booking → Consultation
2. Lab Test Ordering → AI Analysis → Results Review
3. Prescription → Pharmacy Processing → Medication Dispensing
4. Billing → Payment → Discharge

### **Doctor Workflow**
1. Patient Selection → Medical History Review
2. Consultation with AI Insights → Diagnosis
3. Treatment Planning → Prescription/Lab Orders
4. Follow-up Scheduling → Progress Monitoring

### **Pharmacy Workflow**
1. Prescription Receipt → AI Safety Analysis
2. Pharmacist Review → Medication Preparation
3. Patient Counseling → Dispensing → Portal Updates

## 🌟 Advanced Features

- **Smart Patient Matching** - AI-powered patient identification
- **Predictive Analytics** - Health trend analysis and risk assessment
- **Automated Workflows** - Streamlined processes across departments
- **Mobile Responsive** - Full functionality on all devices
- **Real-time Collaboration** - Live updates across all users
- **Emergency Protocols** - Rapid response systems and alerts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Google AI API access

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Hospital

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase and Google AI credentials

# Run development server
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_AI_API_KEY=your_genkit_key
```

### Access the Application
- Development: `http://localhost:3000`
- Production: Deploy to Vercel/Firebase Hosting

## 📱 User Interfaces

- **Patient Portal** - Appointment booking, medical records, prescriptions
- **Doctor Dashboard** - Patient management, consultations, prescriptions
- **Pharmacy Interface** - Prescription processing, inventory management
- **Lab Technician Panel** - Test processing, result entry
- **Admin Console** - System management, analytics, user administration

## 🔄 Real-time Features

- Live patient status updates
- Real-time lab result notifications
- Instant prescription status changes
- Emergency alert broadcasting
- Cross-departmental communication

## 📁 Project Structure

```
Hospital/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── cardiology/         # Cardiology department
│   │   ├── pharmacy/           # Pharmacy management
│   │   ├── lab-results/        # Laboratory system
│   │   ├── doctor/             # Doctor dashboard
│   │   └── home/               # Main homepage
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utility libraries
│   │   ├── database-service.ts # Database operations
│   │   ├── database-schema.ts  # Database schema
│   │   ├── pharmacy-service.ts # Pharmacy operations
│   │   └── firebase.ts         # Firebase configuration
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
└── package.json               # Dependencies
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Key Technologies
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Firebase** - Backend-as-a-Service
- **Google AI (Genkit)** - AI integration

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

This system represents a complete digital transformation of hospital operations, leveraging AI to improve patient care, reduce errors, and streamline healthcare delivery.
