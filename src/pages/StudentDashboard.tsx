import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import * as dataService from "@/services/dataService";
import type { Assignment, Submission } from "@/types";
import SubmissionDialog from "@/components/SubmissionDialog";

export default function StudentDashboard() {
  const [assignment, setAssignment] = useState<Assignment[]>([]);
  const [submitted, setSubmitted] = useState<Submission[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { currentUser, logout } = useAuth();


  useEffect(() => {
    if(currentUser?.meta.class){
      const assignments = dataService.getAssignmentsByClass(currentUser.meta.class);
      const submissions = dataService.getSubmissionsByStudent(currentUser.id);
      setAssignment(assignments);
      setSubmitted(submissions);
    }
  }, [currentUser]);
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <div className="flex items-center gap-2">
              <User size={16}/>
              <p className="text-sm text-gray-600">{currentUser.name}</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {currentUser.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.length === 0 ? (
              <p className="text-gray-600">No assignments assigned to your class.</p>
            ) : (
              <div className="space-y-4">
                {assignment.map((assignment) => {
                  const submission = submitted.find(s => s.assignmentId === assignment.id);
                  const status = submission?.status || "not_submitted";
                  const statusConfig = {
                    not_submitted: { text: "Not Submitted", color: "text-red-600 bg-red-50" },
                    submitted: { text: "Pending Confirmation", color: "text-yellow-600 bg-yellow-50" },
                    confirmed: { text: "Submitted", color: "text-green-600 bg-green-50" },
                  };
                  
                  const statusInfo = statusConfig[status as keyof typeof statusConfig];
                  
                  return (
                    <div 
                      key={assignment.id} 
                      className="p-4 border rounded-lg bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gray-900">{assignment.title}</h2>
                          <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
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
                    </div>
                  );
                }
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <SubmissionDialog 
        assignmentId={selectedAssignmentId} 
        onClose={() => setSelectedAssignmentId(null)} 
      />
    </div>
  );
}
