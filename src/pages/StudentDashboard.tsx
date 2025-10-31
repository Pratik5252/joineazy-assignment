import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Assignment, Submission } from "@/types";
import SubmissionDialog from "@/components/StudentSubmissionModal";
import { loadStudentData } from "@/utils/dataLoader";

export default function StudentDashboard() {
  const [assignment, setAssignment] = useState<Assignment[]>([]);
  const [submitted, setSubmitted] = useState<Submission[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  const loadData = () => {
    if (currentUser?.meta.class) {
      const data = loadStudentData(currentUser.id, currentUser.meta.class);
      setAssignment(data.assignments);
      setSubmitted(data.submissions);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          My Assignments ({assignment.length})
        </h2>
        
        {assignment.length === 0 ? (
          <Card className="rounded-md">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No assignments assigned to your class.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignment.map((assignment) => {
              const submission = submitted.find(s => s.assignmentId === assignment.id);
              const status = submission?.status || "not_submitted";
              const statusConfig = {
                not_submitted: { text: "Not Submitted", color: "text-status-error bg-status-error-bg" },
                submitted: { text: "Pending Confirmation", color: "text-status-warning bg-status-warning-bg" },
                confirmed: { text: "Submitted", color: "text-status-success bg-status-success-bg" },
              };
              
              const statusInfo = statusConfig[status as keyof typeof statusConfig];
              
              return (
                <Card key={assignment.id} className="rounded-md flex flex-col">
                  <CardContent className="px-6 flex flex-col flex-1">
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-semibold text-foreground line-clamp-2 flex-1">
                          {assignment.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <span>Course: {assignment.course}</span>
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border">
                      <Button 
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        disabled={status === "confirmed"}
                        variant={status === "confirmed" ? "outline" : "default"}
                        className="w-full"
                      >
                        {status === "confirmed" 
                          ? "Submitted" 
                          : status === "submitted" 
                          ? "Confirm Submission" 
                          : "Submit Assignment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            )}
          </div>
        )}
      </main>
      
      <SubmissionDialog 
        assignmentId={selectedAssignmentId} 
        onClose={() => {
          setSelectedAssignmentId(null);
          loadData();
        }} 
      />
    </div>
  );
}
