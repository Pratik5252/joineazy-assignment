import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/context/AuthContext";
import * as dataService from "@/services/dataService";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

interface SubmissionDialogProps {
  assignmentId: string | null;
  onClose: () => void;
}

export default function SubmissionDialog({ assignmentId, onClose }: SubmissionDialogProps) {
  const { currentUser } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  if (!assignmentId || !currentUser) return null;

  const assignment = dataService.getAssignmentById(assignmentId);
  let submission = dataService.getSubmission(assignmentId, currentUser.id);
  
  if (!assignment) return null;

  if (!submission) {
    const newSubmission = {
      id: crypto.randomUUID(),
      assignmentId: assignmentId,
      studentId: currentUser.id,
      status: "not_submitted" as const,
      driveLinkSubmitted: null,
      notes: null,
      confirmationSteps: [],
      confirmedAt: null,
      lastUpdatedAt: new Date().toISOString(),
    };
    dataService.createSubmission(newSubmission);
    submission = newSubmission;
  }

  const status = submission.status;

  const handleSubmit = () => {
    if (!isConfirmed && status === "not_submitted") {
      return;
    }

    if (status === "not_submitted") {
      dataService.updateSubmission(submission.id, {
        status: "submitted",
        confirmationSteps: [
          { step: "declared_submitted", at: new Date().toISOString() }
        ],
        lastUpdatedAt: new Date().toISOString(),
      });
      setIsConfirmed(false);
      onClose();
    } else if (status === "submitted") {
      dataService.updateSubmission(submission.id, {
        status: "confirmed",
        confirmationSteps: [
          ...submission.confirmationSteps,
          { step: "final_confirm", at: new Date().toISOString() }
        ],
        confirmedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      });
      onClose();
    }
  };

  const statusConfig = {
    not_submitted: { text: "Not Submitted", color: "text-status-error bg-status-error-bg" },
    submitted: { text: "Pending Confirmation", color: "text-status-warning bg-status-warning-bg" },
    confirmed: { text: "Submitted", color: "text-status-success bg-status-success-bg" },
  };

  const statusInfo = statusConfig[status];

  return (
    <Dialog open={!!assignmentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>
            {assignment.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Current Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        <div className="space-y-3 py-4 border-t border-b border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">Course:</span>
              <p className="text-muted-foreground">{assignment.course}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Due Date:</span>
              <p className="text-muted-foreground">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <span className="font-medium text-foreground block mb-2">Assignment Folder:</span>
            <a
              href={assignment.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-link-bg text-link rounded-lg hover:bg-link-bg-hover hover:text-link-hover transition-colors"
            >
              <ExternalLink size={16} />
              Open Drive Folder
            </a>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-foreground">
            {status === "not_submitted" && (
              <>
                <strong>Step 1:</strong> Upload your assignment to the Drive folder above, then check the box and declare your submission.
              </>
            )}
            {status === "submitted" && (
              <>
                <strong>Step 2:</strong> You have declared your submission. Please review your work and click "Confirm Submission" to finalize.
              </>
            )}
            {status === "confirmed" && (
              <>
                <strong>Submitted:</strong> Your assignment has been successfully submitted on{" "}
                {submission.confirmedAt && new Date(submission.confirmedAt).toLocaleString()}.
              </>
            )}
          </p>
        </div>

        {status === "not_submitted" && (
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-upload"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <label htmlFor="confirm-upload" className="text-sm text-foreground cursor-pointer">
              I confirm that I have uploaded my work to the assignment folder
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} variant="outline">
            {status === "confirmed" ? "Close" : "Cancel"}
          </Button>
          
          {status !== "confirmed" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={status === "not_submitted" && !isConfirmed}
                >
                  {status === "submitted" ? "Confirm Submission" : "Declare Submission"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {status === "submitted" ? "Final Confirmation" : "Declare Submission?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {status === "submitted" 
                      ? "This action is final. Your assignment will be marked as submitted and cannot be changed."
                      : "Are you sure you have uploaded your work to the Drive folder? You'll need to confirm again in the next step."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    {status === "submitted" ? "Yes, Confirm" : "Yes, Declare"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
