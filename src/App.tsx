/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCircle, 
  GraduationCap, 
  ClipboardCheck, 
  BrainCircuit, 
  Target, 
  FileText, 
  Send, 
  Loader2,
  Trophy,
  History,
  Lightbulb,
  ShieldAlert,
  Users,
  BarChart3,
  LogOut,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  X,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Download,
  Printer,
  ArrowLeft,
  ScrollText,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { generateAnalysis } from './services/geminiService';
import { User, StudentData, Student } from './types';
import Login from './components/Login';

const PALETTE = {
  primary: '#1F3A5F', // Navy
  secondary: '#2E8BC0', // Steel Blue
  accent: '#27AE60', // Emerald
  warning: '#F39C12', // Amber
  risk: '#C0392B', // Crimson
  background: '#F7F9FC', // Light Gray
  text: '#1B1F23', // Charcoal
};

const ENROLLMENT_DATA = [
  { name: 'Active', value: 3840, color: '#1F3A5F' },
  { name: 'Graduated', value: 852, color: '#27AE60' },
  { name: 'Inactive', value: 160, color: '#C0392B' },
];

const TREND_DATA = [
  { month: 'Oct', employability: 82.1, alerts: 18 },
  { month: 'Nov', employability: 83.5, alerts: 14 },
  { month: 'Dec', employability: 84.8, alerts: 22 },
  { month: 'Jan', employability: 86.2, alerts: 15 },
  { month: 'Feb', employability: 87.5, alerts: 10 },
  { month: 'Mar', employability: 88.2, alerts: 12 },
];

const PLACEMENT_DATA = [
  { major: 'CompSci', rate: 94 },
  { major: 'Finance', rate: 88 },
  { major: 'BioMed', rate: 91 },
  { major: 'Engineering', rate: 93 },
  { major: 'Arts', rate: 76 },
  { major: 'Psych', rate: 82 },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'report' | 'overview' | 'students' | 'settings' | 'resources'>('input');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Career Report', message: 'Your AI career intelligence report is ready for review.', time: '5m ago', read: false },
    { id: 2, title: 'Faculty Message', message: 'Dr. Sarah updated your research milestones.', time: '1h ago', read: false },
    { id: 3, title: 'System Update', message: 'UniPath AI v3.0.0 is now live with new features.', time: '2h ago', read: true },
  ]);
  const [formData, setFormData] = useState<StudentData>({
    studentProfile: '',
    academicData: '',
    attendanceBehaviorData: '',
    skillsProjectsCertifications: '',
    interestPsychometricData: '',
    constraintsAndPreferences: '',
  });

  // Settings State
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectStudentModalOpen, setIsSelectStudentModalOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Student Directory State
  const [students, setStudents] = useState<Student[]>([
    { 
      id: 1, 
      name: "Alex Johnson", 
      email: "alex@unipath.ai",
      major: "CompSci", 
      year: "Junior", 
      path: "AI Research", 
      status: "On Track", 
      color: "text-[#27AE60]",
      assessmentData: {
        studentProfile: "Alex Johnson, 20, Junior (Year 3). Computer Science Major. Interested in AI and Sustainable Tech.",
        academicData: "GPA: 3.85/4.0. Data Structures: A, Algorithms: A-, Discrete Math: B+, Operating Systems: A. Strong performance in core CS, minor in Environmental Studies.",
        attendanceBehaviorData: "98% lecture attendance. Active in Research Lab (AI for Climate). Consistently meets project deadlines.",
        skillsProjectsCertifications: "Python, C++, PyTorch, AWS Cloud Practitioner. Project: Neural Network for local weather prediction. Internship: Software Intern at EcoTech Solutions.",
        interestPsychometricData: "High logical-mathematical intelligence, strong problem-solving, prefers research-oriented roles. MBTI: INTJ.",
        constraintsAndPreferences: "Interested in Silicon Valley internships. Considering Master's degree. Needs full-tuition scholarship for grad school.",
      }
    },
    { 
      id: 2, 
      name: "Emma Wilson", 
      email: "emma@unipath.ai",
      major: "Bio-Med", 
      year: "Senior", 
      path: "Clinical Lab", 
      status: "Needs Review", 
      color: "text-[#F39C12]",
      assessmentData: {
        studentProfile: "Emma Wilson, 21, Senior. Biomedical Sciences. Healthcare focus.",
        academicData: "GPA: 3.4/4.0. Organic Chemistry: B, Biochemistry: A, Anatomy: B+. Consistent performance but some struggle with advanced lab work.",
        attendanceBehaviorData: "92% attendance. Missed several labs due to conflicting clinical observations.",
        skillsProjectsCertifications: "Clinical certification level 1. Lab techniques: PCR, Electrophoresis. Volunteered at City Hospital.",
        interestPsychometricData: "High social intelligence, empathetic, prefers clinical environments. MBTI: ISFJ.",
        constraintsAndPreferences: "Wants to stay within the region. Interested in medical school but open to biotech lab roles.",
      }
    },
    { 
      id: 3, 
      name: "James Chen", 
      email: "james@unipath.ai",
      major: "Finance", 
      year: "Sophomore", 
      path: "Quant Analyst", 
      status: "At Risk", 
      color: "text-[#C0392B]",
      assessmentData: {
        studentProfile: "James Chen, 19, Sophomore. Finance and Mathematics double major.",
        academicData: "GPA: 2.9/4.0. Microeconomics: C+, Calculus II: B-, Statistics: C. Declining trend in quantitative subjects.",
        attendanceBehaviorData: "75% attendance. Often misses early morning lectures.",
        skillsProjectsCertifications: "Excel (Advanced), Python (Basics). Bloomberg Terminal certified. Member of Finance Club.",
        interestPsychometricData: "High ambition, risk-taker, competitive. Prefers high-stakes environments. MBTI: ENTJ.",
        constraintsAndPreferences: "High pressure to succeed. Needs paid internship. Worried about GPA for top firms.",
      }
    },
    { 
      id: 4, 
      name: "Sophia Garcia", 
      email: "sophia@unipath.ai",
      major: "Env-Eng", 
      year: "Junior", 
      path: "Sustainability", 
      status: "On Track", 
      color: "text-[#27AE60]",
      assessmentData: {
        studentProfile: "Sophia Garcia, 20, Junior. Environmental Engineering. Sustainable infrastructure focus.",
        academicData: "GPA: 3.7/4.0. Environmental Policy: A, Hydrogeology: A-, Civil Engineering: B+. Strong performance in interdisciplinary courses.",
        attendanceBehaviorData: "100% attendance. Leads the campus sustainable living initiative.",
        skillsProjectsCertifications: "LEED Associate candidate. GIS software expert. AutoCAD. Summer internship with City Planning.",
        interestPsychometricData: "Nature-oriented, values-driven, practical problem solver. MBTI: ENFP.",
        constraintsAndPreferences: "Looking for roles in NGO sector or government policy. Prefers urban locations with good transit.",
      }
    },
  ]);

  // Dynamic Dashboard Data computed from state
  const enrollmentStats = [
    { name: 'Active', value: students.length, color: '#1F3A5F' },
    { name: 'Graduated', value: Math.floor(students.length * 0.2), color: '#27AE60' },
    { name: 'Inactive', value: Math.floor(students.length * 0.05), color: '#C0392B' },
  ];
  const totalEnrollment = enrollmentStats.reduce((acc, curr) => acc + curr.value, 0);

  const loadStudentAssessment = (studentId: string | number) => {
    const student = students.find(s => s.id === studentId);
    if (student && student.assessmentData) {
      setFormData(student.assessmentData);
      setActiveTab('input');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    major: '',
    year: 'Freshman',
    path: '',
    status: 'On Track'
  });

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.major) {
      alert("Please enter Name and Major.");
      return;
    }
    const color = newStudent.status === 'On Track' ? 'text-[#27AE60]' : 
                  newStudent.status === 'Needs Review' ? 'text-[#F39C12]' : 'text-[#C0392B]';
    
    setStudents([
      ...students,
      { 
        ...newStudent, 
        id: Date.now(), 
        email: `${newStudent.name.toLowerCase().replace(/\s+/g, '.')}@unipath.ai`,
        color,
        assessmentData: {
          studentProfile: `${newStudent.name}, ${newStudent.year}. Major: ${newStudent.major}. Path: ${newStudent.path}`,
          academicData: '',
          attendanceBehaviorData: '',
          skillsProjectsCertifications: '',
          interestPsychometricData: '',
          constraintsAndPreferences: '',
        }
      }
    ]);
    setIsAddStudentModalOpen(false);
    setNewStudent({ name: '', major: '', year: 'Freshman', path: '', status: 'On Track' });
  };

  // Set default tab based on role when user logs in
  React.useEffect(() => {
    if (!user) return;
    setSettingsName(user.name);
    setSettingsEmail(user.email);
    if (user.role === 'admin') setActiveTab('overview');
    else if (user.role === 'staff') setActiveTab('students');
    else setActiveTab('input');
  }, [user?.role]);

  // Utility to slugify text for anchor links
  const getSlug = (text: any): string => {
    if (typeof text !== 'string') {
      if (Array.isArray(text)) {
        text = text.join('');
      } else if (text?.props?.children) {
        text = text.props.children;
      } else {
        text = String(text || '');
      }
    }
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Extract Table of Contents from report
  useEffect(() => {
    if (report) {
      const lines = report.split('\n');
      const headers = lines
        .filter(line => line.trim().startsWith('#'))
        .map(line => {
          const match = line.match(/^(#+)\s*(.*)$/);
          if (!match) return null;
          const level = match[1].length;
          const text = match[2].trim().replace(/\*|_|`/g, '');
          const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
          return { id, text, level };
        })
        .filter((h): h is {id: string, text: string, level: number} => h !== null);
      setToc(headers);
    } else {
      setToc([]);
    }
  }, [report]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.studentProfile && !formData.academicData) {
      alert("Please provide at least some academic or profile information.");
      return;
    }

    setReport(null); // Clear previous
    setLoading(true);
    try {
      const result = await generateAnalysis(formData);
      setReport(result);
      setActiveTab('report');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Unknown error";
      alert(`Error generating analysis: ${errorMessage}. Please check your connection.`);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentReport = (studentName: string) => {
    setReport(`# Career Intelligence Report: ${studentName}\n\n**Note: This is a placeholder report for demonstration.**\n\n### Executive Summary\n${studentName} is a high-performing undergraduate with significant potential in their chosen field. Their academic trajectory shows strong consistency in core technical subjects.\n\n### Career Recommendations\n1. **Primary Path:** Specialized Research & Development - Based on laboratory engagement and technical skill acquisition.\n2. **Secondary Path:** Strategic Consultancy - Leveraging strong problem-solving and communication scores.\n\n### Next Steps\n- Schedule a mentorship session with their faculty advisor.\n- Apply for summer internships in industry-leading firms.\n- Focus on building a professional portfolio of projects.`);
    setActiveTab('report');
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({
      ...user,
      name: settingsName,
      email: settingsEmail
    });
    setIsSaving(false);
    alert("Settings updated successfully!");
  };

  const exportToPDF = () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `UniPath_Report_${user?.name?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Force standard colors on elements for html2canvas compatibility (avoids oklch issues)
          const reportElement = clonedDoc.querySelector('.report-content') as HTMLElement;
          if (reportElement) {
            reportElement.style.color = '#1B1F23';
            reportElement.style.backgroundColor = '#ffffff';
          }
        }
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
    };

    // Use the functional interface of html2pdf
    const worker = html2pdf().set(opt).from(element);
    
    worker.save().then(() => {
      setIsExporting(false);
    }).catch((err: any) => {
      console.error('PDF Export Error:', err);
      setIsExporting(false);
      alert('PDF generation failed. Please try "Print" -> "Save as PDF" instead as a fallback.');
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: PALETTE.background, color: PALETTE.text }}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#1F3A5F] text-white shadow-lg shadow-slate-200">
                <BrainCircuit size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">UniPath AI</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-[#C0392B]' : user.role === 'staff' ? 'bg-[#2E8BC0]' : 'bg-[#27AE60]'}`}></span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{user.role === 'staff' ? 'Faculty' : user.role}</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative rounded-lg ${showNotifications ? 'bg-slate-100 text-[#1F3A5F]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C0392B] rounded-full border-2 border-white"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                    >
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-slate-900">{n.title}</p>
                                <span className="text-[10px] text-slate-400">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-xs text-slate-400">No new notifications</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                        <button className="text-[10px] font-bold text-[#1F3A5F] hover:underline uppercase tracking-widest">Mark all as read</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{user.email}</p>
                </div>
                <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full border-2 border-white shadow-sm" />
                <button 
                  onClick={() => setUser(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 p-4 md:p-6 border-r border-gray-200 bg-white/50">
          <nav className="space-y-1">
            {user.role === 'admin' && (
              <NavItem 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                icon={<BarChart3 size={20} />} 
                label="System Overview" 
              />
            )}
            {(user.role === 'admin' || user.role === 'staff') && (
              <NavItem 
                active={activeTab === 'students'} 
                onClick={() => setActiveTab('students')} 
                icon={<Users size={20} />} 
                label="Undergraduate Directory" 
              />
            )}
            {user.role === 'student' && (
              <NavItem 
                active={activeTab === 'input'} 
                onClick={() => setActiveTab('input')} 
                icon={<ClipboardCheck size={20} />} 
                label="Self-Assessment" 
              />
            )}
            
            {(report || activeTab === 'report') && (
              <NavItem 
                active={activeTab === 'report'} 
                onClick={() => setActiveTab('report')} 
                icon={<FileText size={20} />} 
                label="Intelligence Report" 
              />
            )}
            <NavItem 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              icon={<Settings size={20} />} 
              label="Account Settings" 
            />
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Resources</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('resources')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all ${activeTab === 'resources' ? 'bg-[#F7F9FC] text-[#1F3A5F] font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <BookOpen size={16} />
                Knowledge Base
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all ${activeTab === 'resources' ? 'bg-[#F7F9FC] text-[#1F3A5F] font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ShieldAlert size={16} />
                Support Center
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'input' && user.role === 'student' && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <UserCircle className="text-[#1F3A5F]" size={22} />
                        Academic Profile & Career Data
                      </h2>
                      <button 
                        onClick={() => setIsSelectStudentModalOpen(true)}
                        className="text-[10px] font-bold text-[#1F3A5F] hover:text-[#2E8BC0] bg-slate-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                        title="Choose an undergraduate profile from the university directory"
                      >
                        <Users size={14} />
                        Choose from Directory
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Undergraduate Profile" name="studentProfile" value={formData.studentProfile} onChange={handleInputChange} placeholder="Major, Year, Minor, Research interests..." icon={<UserCircle size={16} />} />
                      <InputField label="Academic Transcript" name="academicData" value={formData.academicData} onChange={handleInputChange} placeholder="GPA, Core courses, Semester trends..." icon={<GraduationCap size={16} />} />
                      <InputField label="Engagement & Research" name="attendanceBehaviorData" value={formData.attendanceBehaviorData} onChange={handleInputChange} placeholder="Lab participation, Research assistantships..." icon={<ClipboardCheck size={16} />} />
                      <InputField label="Internships & Skills" name="skillsProjectsCertifications" value={formData.skillsProjectsCertifications} onChange={handleInputChange} placeholder="Industry experience, Tech stack, Certs..." icon={<Trophy size={16} />} />
                      <InputField label="Aptitude & Interests" name="interestPsychometricData" value={formData.interestPsychometricData} onChange={handleInputChange} placeholder="Career goals, MBTI, Technical aptitude..." icon={<BrainCircuit size={16} />} />
                      <InputField label="Post-Grad Preferences" name="constraintsAndPreferences" value={formData.constraintsAndPreferences} onChange={handleInputChange} placeholder="Industry vs Academia, Location, Salary goals..." icon={<Target size={16} />} />
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-[#1F3A5F] text-white rounded-xl font-bold hover:bg-[#152a45] transition-all shadow-lg shadow-slate-200 disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Analyzing Career Trajectory...
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            Generate Career Intelligence
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#1F3A5F] text-white p-6 rounded-2xl shadow-xl shadow-slate-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Lightbulb className="text-[#F39C12]" size={20} />
                      Career Strategy Tips
                    </h3>
                    <ul className="space-y-4 text-sm text-blue-50">
                      <li className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-[#2E8BC0] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                        <p>Highlight your research projects—they are critical for high-tier industry roles.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-[#2E8BC0] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                        <p>Specify if you're aiming for Graduate School or immediate Industry placement.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'report' && (
              <motion.div 
                key="report"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-7xl mx-auto pb-12 px-4"
              >
                <div className="flex flex-col xl:flex-row gap-8 items-start">
                  {/* Table of Contents - Desktop Only */}
                  {toc.length > 0 && (
                    <aside className="hidden xl:block w-72 shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-hide">
                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                          <ScrollText size={18} className="text-[#1F3A5F]" />
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Report Sections</h4>
                        </div>
                        <nav className="space-y-3">
                          {toc.map((item, idx) => (
                            <a
                              key={`${item.id}-${idx}`}
                              href={`#${item.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(item.id);
                                if (element) {
                                  window.scrollTo({
                                    top: element.getBoundingClientRect().top + window.pageYOffset - 100,
                                    behavior: 'smooth'
                                  });
                                  window.history.pushState(null, '', `#${item.id}`);
                                }
                              }}
                              className={`block w-full text-left text-xs leading-relaxed transition-all hover:text-[#1F3A5F] hover:translate-x-1 ${
                                item.level === 1 ? 'font-bold text-slate-900 border-l-2 border-[#1F3A5F] pl-3 py-1' : 
                                item.level === 2 ? 'font-medium text-slate-600 pl-5' : 
                                'text-slate-400 pl-8'
                              }`}
                            >
                              {item.text}
                            </a>
                          ))}
                        </nav>
                      </div>
                    </aside>
                  )}

                  <div className="flex-1 w-full max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <button 
                        onClick={() => setActiveTab(user.role === 'student' ? 'input' : 'students')}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-slate-500 hover:text-[#1F3A5F] transition-all border border-slate-100 shadow-sm"
                      >
                        <ArrowLeft size={16} />
                        {user.role === 'student' ? 'Back to Assessment' : 'Back to Directory'}
                      </button>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => window.print()}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Printer size={18} />
                          Print
                        </button>
                        <button 
                          onClick={exportToPDF}
                          disabled={isExporting || !report}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1F3A5F] text-white rounded-xl text-sm font-bold hover:bg-[#152a45] transition-all shadow-md shadow-slate-100 disabled:opacity-70"
                        >
                          {isExporting ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Download size={18} />
                          )}
                          {isExporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                      </div>
                    </div>

                    <div ref={reportRef} className="report-content" style={{ backgroundColor: '#ffffff', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                      <div style={{ padding: '2.5rem', background: 'linear-gradient(to bottom right, #1F3A5F, #2E8BC0)', color: '#ffffff' }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                              University Career Intelligence
                            </span>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>Professional Success Analysis</h2>
                            <p style={{ marginTop: '0.75rem', fontSize: '1.125rem', opacity: 0.9, color: '#e0e7ff', margin: 0 }}>Prepared for {user?.name} &bull; {new Date().toLocaleDateString()}</p>
                          </div>
                          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem' }}>
                            <FileText size={48} style={{ color: '#ffffff' }} color="#ffffff" />
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '2.5rem' }} className="markdown-body">
                        {toc.length > 0 && (
                          <div style={{ marginBottom: '3rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1B1F23', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ScrollText size={18} style={{ color: '#1F3A5F' }} color="#1F3A5F" />
                              Contents
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                              {toc.map((item, idx) => (
                                <a 
                                  key={idx} 
                                  href={`#${item.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const el = document.getElementById(item.id);
                                    if (el) {
                                      window.scrollTo({
                                        top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                                        behavior: 'smooth'
                                      });
                                    }
                                  }}
                                  style={{ 
                                    textDecoration: 'none', 
                                    fontSize: '0.6875rem', 
                                    color: item.level === 1 ? '#334155' : '#64748b', 
                                    fontWeight: item.level === 1 ? 700 : 400,
                                    paddingLeft: item.level === 1 ? '0' : '0.5rem'
                                  }}
                                  className="hover:text-indigo-600 hover:underline"
                                >
                                  {item.text}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 id={getSlug(children)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {children}
                                <a href={`#${getSlug(children)}`} style={{ color: '#cbd5e1', fontSize: '0' }} className="print-hide">
                                  <ExternalLink size={16} color="#cbd5e1" />
                                </a>
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 id={getSlug(children)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {children}
                                <a href={`#${getSlug(children)}`} style={{ color: '#cbd5e1', fontSize: '0' }} className="print-hide">
                                  <ExternalLink size={14} color="#cbd5e1" />
                                </a>
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 id={getSlug(children)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {children}
                                <a href={`#${getSlug(children)}`} style={{ color: '#cbd5e1', fontSize: '0' }} className="print-hide">
                                  <ExternalLink size={12} color="#cbd5e1" />
                                </a>
                              </h3>
                            ),
                          }}
                        >
                          {report || '# No Report Generated\nPlease complete the self-assessment first.'}
                        </ReactMarkdown>
                      </div>
                      
                      <div style={{ padding: '2.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#94a3b8', margin: 0 }}>
                          Generated by UniPath AI &bull; Confidential Career Intelligence Report
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'overview' && user.role === 'admin' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 pb-12"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Institutional Intelligence & KPIs &bull; Live Updates</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#F7F9FC] text-[#1F3A5F] rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
                      Download Report
                    </button>
                    <button className="px-4 py-2 bg-[#1F3A5F] text-white rounded-xl text-xs font-bold hover:bg-[#152a45] transition-all flex items-center gap-2">
                      <Plus size={16} />
                      Config Metrics
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Total Undergraduates" value={students.length.toString()} trend="+20%" icon={<Users size={24} />} />
                  <StatCard label="Industry Placement Rate" value="94%" trend="+2%" icon={<BrainCircuit size={24} />} />
                  <StatCard label="Academic Alerts" value={students.filter(s => s.status !== 'On Track').length.toString()} trend="-5%" icon={<AlertCircle size={24} />} color="text-rose-500" />
                  <StatCard label="Employability Index" value="89.4" trend="+0.8" icon={<TrendingUp size={24} />} color="text-emerald-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-bold text-slate-900">Employability Index vs Alerts</h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#1F3A5F]"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Index</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Alerts</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TREND_DATA}>
                          <defs>
                            <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1F3A5F" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1F3A5F" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: '700' }}
                          />
                          <Area type="monotone" dataKey="employability" stroke="#1F3A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorIndex)" />
                          <Line type="monotone" dataKey="alerts" stroke="#C0392B" strokeWidth={2} dot={{ r: 4, fill: '#C0392B' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-8">Placement Rate by Major</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={PLACEMENT_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="major" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(31, 58, 95, 0.05)' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                          />
                          <Bar dataKey="rate" fill="#1F3A5F" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Enrollment Mix</h3>
                    <div className="h-[200px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={enrollmentStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {enrollmentStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-900">{totalEnrollment}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      {enrollmentStats.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-xs font-medium text-slate-600">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-900">{Math.round((item.value / (totalEnrollment || 1)) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Critical Intervention List</h3>
                    <div className="space-y-4">
                      {students.filter(s => s.status !== 'On Track').map((student, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#2E8BC0] transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#1F3A5F] shadow-sm">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.major}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">Career Path</p>
                              <p className="text-xs font-bold text-slate-700 text-right">{student.path}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              student.status === 'At Risk' ? 'bg-rose-50 text-rose-600' : 
                              student.status === 'Needs Review' ? 'bg-amber-50 text-amber-600' : 
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                              {student.status}
                            </div>
                          </div>
                        </div>
                      ))}
                      {students.filter(s => s.status !== 'On Track').length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-400">No students currently require intervention.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (user.role === 'admin' || user.role === 'staff') && (
              <motion.div 
                key="students"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">Undergraduate Directory</h2>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by major or name..." 
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => setIsAddStudentModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={18} />
                      Add Undergraduate
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Undergraduate</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Major</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Year</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Career Path</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => (
                        <StudentRow 
                          key={student.id}
                          name={student.name} 
                          major={student.major} 
                          year={student.year} 
                          path={student.path} 
                          status={student.status} 
                          color={student.color} 
                          onViewReport={() => viewStudentReport(student.name)} 
                          onLoadAssessment={() => loadStudentAssessment(student.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-[#1F3A5F] mb-8">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                    <img src={user.avatar} alt="" className="h-20 w-20 rounded-full border-4 border-gray-50 shadow-sm" />
                    <div>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-all">Change Avatar</button>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG or SVG. Max 2MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        value={settingsName} 
                        onChange={(e) => setSettingsName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E8BC0] outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                      <input 
                        type="email" 
                        value={settingsEmail} 
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2E8BC0] outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="pt-6">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="px-6 py-3 bg-[#1F3A5F] text-white rounded-xl font-bold hover:bg-[#152a45] transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div 
                key="resources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">University Resources</h2>
                    <p className="text-sm text-slate-500 mt-1">Access documentation, guides, and professional support.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ResourceCard 
                    title="Knowledge Base" 
                    description="Comprehensive guides on using UniPath AI for career planning and academic success."
                    icon={<BookOpen className="text-[#1F3A5F]" size={24} />}
                    links={['Getting Started Guide', 'Understanding Your Report', 'Career Mapping FAQ']}
                  />
                  <ResourceCard 
                    title="Support Center" 
                    description="Need help? Our academic support team is available to assist with any technical or career-related queries."
                    icon={<HelpCircle className="text-[#2E8BC0]" size={24} />}
                    links={['Open a Support Ticket', 'Live Chat with Mentor', 'System Status']}
                  />
                  <ResourceCard 
                    title="Community" 
                    description="Join the UniPath community to connect with other undergraduates and faculty members."
                    icon={<MessageSquare className="text-[#27AE60]" size={24} />}
                    links={['Undergraduate Forum', 'Research Groups', 'Alumni Network']}
                  />
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
                  <div className="space-y-6">
                    <FAQItem 
                      question="How accurate is the AI Career Intelligence Report?" 
                      answer="The report is generated using advanced models that analyze your specific academic and professional data. While highly accurate for trajectory forecasting, we recommend discussing results with your faculty mentor."
                    />
                    <FAQItem 
                      question="Can I update my assessment data?" 
                      answer="Yes, you can update your Academic Self-Assessment at any time. We recommend updating it after every semester or major internship completion."
                    />
                    <FAQItem 
                      question="Who can see my career intelligence reports?" 
                      answer="By default, your reports are visible to you and your assigned faculty mentors. Admins can see aggregated data but individual reports are protected."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isSelectStudentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-[#1F3A5F]" size={20} />
                    Choose from Directory
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select an undergraduate to load their profile</p>
                </div>
                <button onClick={() => setIsSelectStudentModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="p-6 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search by name, major, or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-3">
                  {students.filter(s => 
                    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.major.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.email.toLowerCase().includes(studentSearch.toLowerCase())
                  ).map(student => (
                    <button
                      key={student.id}
                      onClick={() => {
                        loadStudentAssessment(student.id);
                        setIsSelectStudentModalOpen(false);
                      }}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-[#1F3A5F] hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#1F3A5F] border-2 border-white shadow-sm">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-medium">{student.major}</span>
                            <span className="text-[10px] text-slate-400 italic">{student.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{student.year}</p>
                          <p className={`text-[9px] font-bold mt-1 ${student.color}`}>{student.status}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1F3A5F] transition-colors" />
                      </div>
                    </button>
                  ))}
                  {students.filter(s => 
                    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.major.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.email.toLowerCase().includes(studentSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-12">
                      <Users size={40} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No undergraduates found matching "{studentSearch}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-medium">Selecting a student will overwrite the current form data.</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddStudentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="text-[#1F3A5F]" size={20} />
                  Add New Undergraduate
                </h3>
                <button onClick={() => setIsAddStudentModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Major</label>
                  <input 
                    type="text" 
                    value={newStudent.major}
                    onChange={(e) => setNewStudent({...newStudent, major: e.target.value})}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Year</label>
                    <select 
                      value={newStudent.year}
                      onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                    >
                      <option>Freshman</option>
                      <option>Sophomore</option>
                      <option>Junior</option>
                      <option>Senior</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={newStudent.status}
                      onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                    >
                      <option>On Track</option>
                      <option>Needs Review</option>
                      <option>At Risk</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Career Path</label>
                  <input 
                    type="text" 
                    value={newStudent.path}
                    onChange={(e) => setNewStudent({...newStudent, path: e.target.value})}
                    placeholder="e.g. AI Engineer"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3A5F] outline-none transition-all"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-3 bg-[#1F3A5F] text-white rounded-xl font-bold text-sm hover:bg-[#152a45] transition-all shadow-lg shadow-slate-100"
                >
                  Save Undergraduate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-6 border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            UniPath AI University Intelligence System &bull; v3.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, disabled = false }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-[#1F3A5F] text-white shadow-lg shadow-slate-200' 
          : 'text-slate-500 hover:bg-[#F7F9FC] hover:text-[#1F3A5F] disabled:opacity-30 disabled:cursor-not-allowed'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InputField({ label, name, value, onChange, placeholder, icon }: { 
  label: string, 
  name: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  placeholder: string,
  icon: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 ml-1 tracking-widest">
        {icon}
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent transition-all resize-none text-sm bg-slate-50/30"
      />
    </div>
  );
}

function StatCard({ label, value, trend, icon, color = "text-[#1F3A5F]" }: { label: string, value: string, trend: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function ActivityItem({ user, action, time }: { user: string, action: string, time: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#1F3A5F]">
        {user.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">
          <span className="font-bold text-[#1F3A5F]">{user}</span> {action}
        </p>
        <p className="text-[10px] text-gray-400">{time}</p>
      </div>
    </div>
  );
}

function ProgressItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-gray-600">{label}</span>
        <span className="text-[#1F3A5F]">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#2E8BC0] rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function StudentRow({ name, major, year, path, status, color, onViewReport, onLoadAssessment }: { 
  name: string, 
  major: string, 
  year: string, 
  path: string, 
  status: string, 
  color: string, 
  onViewReport?: () => void,
  onLoadAssessment?: () => void 
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#F7F9FC] flex items-center justify-center text-[10px] font-bold text-[#1F3A5F]">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm font-bold text-slate-800">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{major}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{year}</td>
      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{path}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')}`}></div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{status}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onViewReport}
            className="text-[#1F3A5F] hover:text-[#2E8BC0] text-[10px] font-bold bg-[#F7F9FC] px-3 py-1.5 rounded-lg transition-all active:scale-95"
            title="View career report"
          >
            View Intelligence
          </button>
          <button 
            onClick={onLoadAssessment}
            className="text-[#27AE60] hover:text-[#2E8BC0] text-[10px] font-bold bg-[#F7F9FC] px-3 py-1.5 rounded-lg transition-all active:scale-95"
            title="Load data into self-assessment form"
          >
            Load Assessment
          </button>
        </div>
      </td>
    </tr>
  );
}

function ResourceCard({ title, description, icon, links }: { title: string, description: string, icon: React.ReactNode, links: string[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="p-3 bg-slate-50 rounded-2xl w-fit mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">{description}</p>
      <div className="space-y-3">
        {links.map((link, i) => (
          <a key={i} href="#" className="flex items-center justify-between text-xs font-bold text-[#1F3A5F] hover:text-[#2E8BC0] group">
            {link}
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
          </a>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-slate-800">{question}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{answer}</p>
    </div>
  );
}
