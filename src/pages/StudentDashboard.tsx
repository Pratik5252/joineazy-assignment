import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import * as dataService from "@/services/dataService";
import type { Assignment, Submission } from "@/types";
import SubmissionDialog from "@/components/SubmissionDialog";

export default function StudentDashboard() {
  const [assignment, setAssignment] = useState<Assignment[]>([]);
  const [submitted, setSubmitted] = useState<Submission[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const loadData = () => {
    if(currentUser?.meta.class){
      const assignments = dataService.getAssignmentsByClass(currentUser.meta.class);
      const submissions = dataService.getSubmissionsByStudent(currentUser.id);
      setAssignment(assignments);
      setSubmitted(submissions);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          My Assignments ({assignment.length})
        </h2>
        
        {assignment.length === 0 ? (
          <p className="text-muted-foreground">No assignments assigned to your class.</p>
        ) : (
          <div className="space-y-4">
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
                <Card key={assignment.id} className="rounded-md">
                  <CardContent className="px-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-foreground">{assignment.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                        <p className="text-sm text-muted-foreground/80 mt-2">
                          Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        disabled={status === "confirmed"}
                        variant={status === "confirmed" ? "outline" : "default"}
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
