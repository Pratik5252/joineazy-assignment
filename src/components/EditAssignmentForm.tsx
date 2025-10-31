import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import * as dataService from "@/services/dataService";
import type { Assignment } from "@/types";

interface EditAssignmentFormProps {
  assignment: Assignment | null;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EditAssignmentForm({
  assignment,
  onSuccess,
  onClose,
}: EditAssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    driveLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description,
        course: assignment.course,
        dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
        driveLink: assignment.driveLink,
      });
      setErrors({});
    }
  }, [assignment]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.course.trim()) {
      newErrors.course = "Course is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    if (!formData.driveLink.trim()) {
      newErrors.driveLink = "Drive link is required";
    } else if (!formData.driveLink.startsWith("http")) {
      newErrors.driveLink = "Drive link must be a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !assignment) {
      return;
    }

    dataService.updateAssignment(assignment.id, {
      title: formData.title,
      description: formData.description,
      course: formData.course,
      dueDate: new Date(formData.dueDate).toISOString(),
      driveLink: formData.driveLink,
      visibility: {
        type: "class",
        value: formData.course,
      },
    });

    onSuccess();
  };

  if (!assignment) return null;

  return (
    <Dialog open={!!assignment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Update the assignment details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              placeholder="e.g., React Dashboard Project"
            />
            {errors.title && <p className="text-sm text-status-error mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              placeholder="Describe the assignment requirements..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-status-error mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-foreground mb-1">
                Course *
              </label>
              <input
                type="text"
                id="course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                placeholder="e.g., CS101, MATH202, etc."
              />
              {errors.course && <p className="text-sm text-status-error mt-1">{errors.course}</p>}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1">
                Due Date *
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              {errors.dueDate && (
                <p className="text-sm text-status-error mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="driveLink" className="block text-sm font-medium text-foreground mb-1">
              Google Drive Folder Link *
            </label>
            <input
              type="url"
              id="driveLink"
              value={formData.driveLink}
              onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              placeholder="https://drive.google.com/drive/folders/..."
            />
            {errors.driveLink && (
              <p className="text-sm text-status-error mt-1">{errors.driveLink}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Students will upload their submissions to this folder
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Update Assignment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
