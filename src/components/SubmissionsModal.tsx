import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import * as dataService from "@/services/dataService";
import type { Assignment, User as UserType } from "@/types";

interface SubmissionsModalProps {
  assignment: Assignment | null;
  students: UserType[];
  onClose: () => void;
}

export default function SubmissionsModal({
  assignment,
  students,
  onClose,
}: SubmissionsModalProps) {
  if (!assignment) return null;

  const eligibleStudents = students.filter(
    (s) => s.meta.class === assignment.course
  );
  const submissions = dataService.getSubmissionsByAssignment(assignment.id);

  const confirmed = submissions.filter((s) => s.status === "confirmed").length;
  const pending = submissions.filter((s) => s.status === "submitted").length;
  const total = eligibleStudents.length;
  const percentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <Dialog open={!!assignment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90vw] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{assignment.title}</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span>
                <strong>Course:</strong> {assignment.course}
              </span>
              <span>
                <strong>Due:</strong>{" "}
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
              <a
                href={assignment.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-link hover:text-link-hover"
              >
                <ExternalLink size={14} />
                Drive Folder
              </a>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="border-t border-b border-border py-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {confirmed}/{total} submitted ({percentage}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-status-success h-3 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-status-success" />
              Confirmed: {confirmed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-status-warning" />
              Pending: {pending}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-status-error" />
              Not Submitted: {total - confirmed - pending}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Student Name</TableHead>
                <TableHead className="w-[650px]">Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-left">Submitted On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eligibleStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No students enrolled in {assignment.course}
                  </TableCell>
                </TableRow>
              ) : (
                eligibleStudents.map((student) => {
                  const submission = dataService.getSubmission(
                    assignment.id,
                    student.id
                  );
                  const status = submission?.status || "not_submitted";

                  const statusConfig = {
                    not_submitted: {
                      text: "Not Submitted",
                      color: "bg-status-error",
                      textColor: "text-status-error",
                      width: 0,
                    },
                    submitted: {
                      text: "Pending Confirmation",
                      color: "bg-status-warning",
                      textColor: "text-status-warning",
                      width: 50,
                    },
                    confirmed: {
                      text: "Submitted",
                      color: "bg-status-success",
                      textColor: "text-status-success",
                      width: 100,
                    },
                  };

                  const statusInfo = statusConfig[status];

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded transition-all duration-300 ${statusInfo.color}`}
                            style={{ width: `${statusInfo.width}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell className="text-left text-sm text-muted-foreground">
                        {submission?.confirmedAt
                          ? new Date(submission.confirmedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
