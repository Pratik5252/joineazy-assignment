import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as dataService from "@/services/dataService";

interface SubmissionDialogProps {
  assignmentId: string | null;
  onClose: () => void;
}

export default function SubmissionDialog({ assignmentId, onClose }: SubmissionDialogProps) {
  const assignment = assignmentId ? dataService.getAssignmentById(assignmentId) : null;

  return (
    <Dialog open={!!assignmentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>
            {assignment?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">Modal content placeholder</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={onClose}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
