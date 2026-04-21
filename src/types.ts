export type Role = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string | number;
  name: string;
  email: string;
  major: string;
  year: string;
  path: string;
  status: string;
  color: string;
  assessmentData?: StudentData;
}

export interface StudentData {
  studentProfile: string;
  academicData: string;
  attendanceBehaviorData: string;
  skillsProjectsCertifications: string;
  interestPsychometricData: string;
  constraintsAndPreferences: string;
}
