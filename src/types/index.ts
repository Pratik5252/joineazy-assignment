export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  meta: {
    department?: string;
    employeeId?: string;
    class?: string;
    roll?: string;
    semester?: number;
  };
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  driveLink: string;
  createdBy: string;
  createdAt: string;
  attachments: string[];
  visibility: {
    type: "class" | "all" | "specific";
    value: string;
  };
}

export interface ConfirmationStep {
  step: string;
  at: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: "not_submitted" | "submitted" | "confirmed";
  driveLinkSubmitted: string | null;
  notes: string | null;
  confirmationSteps: ConfirmationStep[];
  confirmedAt: string | null;
  lastUpdatedAt: string;
}

export interface SeedData {
  users: User[];
  assignments: Assignment[];
  submissions: Submission[];
}
