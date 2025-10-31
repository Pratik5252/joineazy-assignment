import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, ExternalLink, Users, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as dataService from "@/services/dataService";
import type { Assignment, User as UserType } from "@/types";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import EditAssignmentForm from "@/components/EditAssignmentForm";
import SubmissionsModal from "@/components/AdminSubmissionsModal";
import { loadAdminData } from "@/utils/dataLoader";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<UserType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const loadData = () => {
    if (currentUser) {
      const data = loadAdminData(currentUser.id);
      setAssignments(data.assignments);
      setStudents(data.students);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const getSubmissionStats = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return { confirmed: 0, pending: 0, notSubmitted: 0, total: 0, percentage: 0 };

    const eligibleStudents = students.filter(s => s.meta.class === assignment.course);
    const submissions = dataService.getSubmissionsByAssignment(assignmentId);
    
    const confirmed = submissions.filter((s) => s.status === "confirmed").length;
    const pending = submissions.filter((s) => s.status === "submitted").length;
    const submitted = confirmed + pending;
    const notSubmitted = eligibleStudents.length - submitted;
    const total = eligibleStudents.length;
    const percentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    return { confirmed, pending, notSubmitted, total, percentage };
  };

  const handleDelete = (assignmentId: string) => {
    dataService.deleteAssignment(assignmentId);
    loadData();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            My Assignments ({assignments.length})
          </h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Assignment
          </Button>
        </div>

        <CreateAssignmentForm
          isOpen={isCreateDialogOpen}
          creatorId={currentUser.id}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            loadData();
          }}
          onClose={() => setIsCreateDialogOpen(false)}
        />

        <EditAssignmentForm
          assignment={editingAssignment}
          onSuccess={() => {
            setEditingAssignment(null);
            loadData();
          }}
          onClose={() => setEditingAssignment(null)}
        />

        {assignments.length === 0 ? (
          <Card className="rounded-md">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No assignments created yet. Click "Create Assignment" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => {
              const stats = getSubmissionStats(assignment.id);

              return (
                <Card key={assignment.id} className="rounded-md flex flex-col">
                  <CardContent className="px-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-foreground line-clamp-2 flex-1">
                        {assignment.title}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAssignment(assignment)}
                          className="h-8 w-8"
                        >
                          <Pencil size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-status-error hover:text-status-error"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{assignment.title}" and all related submissions. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(assignment.id)}
                                className="bg-status-error hover:bg-status-error/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assignment.description}
                      </p>
                      <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
                        <span>Course: {assignment.course}</span>
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {stats.total} students
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <a
                        href={assignment.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-link hover:text-link-hover mb-4"
                      >
                        <ExternalLink size={14} />
                        Drive Folder
                      </a>

                      <div className="flex flex-col gap-3 pt-4 border-t border-border">
                        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-status-success" />
                            {stats.confirmed}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-status-warning" />
                            {stats.pending}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-status-error" />
                            {stats.notSubmitted}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setSelectedAssignment(assignment)}
                          className="w-full"
                        >
                          <Users size={16} className="mr-2" />
                          View Submissions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <SubmissionsModal
          assignment={selectedAssignment}
          students={students}
          onClose={() => setSelectedAssignment(null)}
        />
      </main>
    </div>
  );
}
