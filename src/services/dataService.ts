import type { User, Assignment, Submission, SeedData } from "@/types";

const STORAGE_KEYS = {
  CURRENT_USER: "currentUser",
  USERS: "users",
  ASSIGNMENTS: "assignments",
  SUBMISSIONS: "submissions",
  IS_SEEDED: "isSeeded",
} as const;

// ===== Seed Data =====
export async function loadSeedData(): Promise<void> {
  const isSeeded = localStorage.getItem(STORAGE_KEYS.IS_SEEDED);
  if (isSeeded) {
    return;
  }

  try {
    const response = await fetch("/seed.json");
    const seedData: SeedData = await response.json();

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedData.users));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(seedData.assignments));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(seedData.submissions));
    localStorage.setItem(STORAGE_KEYS.IS_SEEDED, "true");

    console.log("✅ Seed data loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load seed data:", error);
    throw error;
  }
}

// ===== Auth =====
export async function login(role: "student" | "admin"): Promise<User | null> {
  try {
    await loadSeedData();

    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!usersStr) {
      throw new Error("No users found");
    }

    const users: User[] = JSON.parse(usersStr);
    const user = users.find((u) => u.role === role);

    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }

    return null;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to parse current user:", error);
    logout();
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ===== Users =====
export function getUsers(): User[] {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
}

// ===== Assignments =====
function getAssignments(): Assignment[] {
  const assignmentsStr = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return assignmentsStr ? JSON.parse(assignmentsStr) : [];
}

export function getAssignmentsByClass(className: string): Assignment[] {
  const assignments = getAssignments();
  return assignments.filter(
    (assignment) =>
      assignment.visibility.type === "class" &&
      assignment.visibility.value === className
  );
}

export function getAssignmentById(id: string): Assignment | undefined {
  const assignments = getAssignments();
  return assignments.find((assignment) => assignment.id === id);
}

export function getAssignmentsByCreator(creatorId: string): Assignment[] {
  const assignments = getAssignments();
  return assignments.filter((assignment) => assignment.createdBy === creatorId);
}

export function createAssignment(assignment: Assignment): void {
  const assignments = getAssignments();
  assignments.push(assignment);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
}

// ===== Submissions =====
function getSubmissions(): Submission[] {
  const submissionsStr = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return submissionsStr ? JSON.parse(submissionsStr) : [];
}

export function getSubmissionsByStudent(studentId: string): Submission[] {
  const submissions = getSubmissions();
  return submissions.filter((submission) => submission.studentId === studentId);
}

export function getSubmissionsByAssignment(assignmentId: string): Submission[] {
  const submissions = getSubmissions();
  return submissions.filter((submission) => submission.assignmentId === assignmentId);
}

export function getSubmission(assignmentId: string, studentId: string): Submission | undefined {
  const submissions = getSubmissions();
  return submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );
}

export function updateSubmission(id: string, updates: Partial<Submission>): void {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index !== -1) {
    submissions[index] = {
      ...submissions[index],
      ...updates,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }
}

export function createSubmission(submission: Submission): void {
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
}
