import * as dataService from "@/services/dataService";
import type { Assignment, Submission, User } from "@/types";

export interface StudentData {
  assignments: Assignment[];
  submissions: Submission[];
}

export interface AdminData {
  assignments: Assignment[];
  students: User[];
}

export function loadStudentData(userId: string, userClass: string): StudentData {
  const assignments = dataService.getAssignmentsByClass(userClass);
  const submissions = dataService.getSubmissionsByStudent(userId);
  
  return {
    assignments,
    submissions,
  };
}

export function loadAdminData(userId: string): AdminData {
  const assignments = dataService.getAssignmentsByCreator(userId);
  const students = dataService.getUsers().filter((u) => u.role === "student");
  
  return {
    assignments,
    students,
  };
}
