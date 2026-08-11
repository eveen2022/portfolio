"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CourseGrade, TimelineEntry } from "@/lib/types";
import { Label, Input, Textarea, Checkbox, FormRow } from "@/components/admin/form";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";

export function TimelineEntryModal({
  entry,
  type,
  isNew,
  saving,
  onSave,
  onClose,
}: {
  entry: TimelineEntry;
  type: "work" | "education";
  isNew: boolean;
  saving: boolean;
  onSave: (entry: TimelineEntry) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TimelineEntry>(entry);

  function update<K extends keyof TimelineEntry>(key: K, value: TimelineEntry[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function addYearGroup() {
    setDraft((prev) => ({
      ...prev,
      // Blank by default — a single-sitting exam like O-Levels has no year
      // subdivision, so it's left for the admin to opt into a label, not
      // assumed. See the year field's placeholder for guidance.
      gradesByYear: [...(prev.gradesByYear ?? []), { year: "", courses: [] }],
    }));
  }

  function updateYearLabel(yearIndex: number, year: string) {
    setDraft((prev) => ({
      ...prev,
      gradesByYear: (prev.gradesByYear ?? []).map((group, i) =>
        i === yearIndex ? { ...group, year } : group,
      ),
    }));
  }

  function removeYearGroup(yearIndex: number) {
    setDraft((prev) => ({
      ...prev,
      gradesByYear: (prev.gradesByYear ?? []).filter((_, i) => i !== yearIndex),
    }));
  }

  function addCourse(yearIndex: number) {
    setDraft((prev) => ({
      ...prev,
      gradesByYear: (prev.gradesByYear ?? []).map((group, i) =>
        i === yearIndex
          ? { ...group, courses: [...group.courses, { name: "", grade: "" }] }
          : group,
      ),
    }));
  }

  function updateCourse(
    yearIndex: number,
    courseIndex: number,
    field: keyof CourseGrade,
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      gradesByYear: (prev.gradesByYear ?? []).map((group, i) =>
        i === yearIndex
          ? {
              ...group,
              courses: group.courses.map((course, j) =>
                j === courseIndex ? { ...course, [field]: value } : course,
              ),
            }
          : group,
      ),
    }));
  }

  function removeCourse(yearIndex: number, courseIndex: number) {
    setDraft((prev) => ({
      ...prev,
      gradesByYear: (prev.gradesByYear ?? []).map((group, i) =>
        i === yearIndex
          ? { ...group, courses: group.courses.filter((_, j) => j !== courseIndex) }
          : group,
      ),
    }));
  }

  const noun = type === "work" ? "experience" : "education";

  return (
    <Modal title={isNew ? `New ${noun}` : `Edit ${noun}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow>
            <Label htmlFor="entry-org">
              {type === "work" ? "Organization" : "Institution"}
            </Label>
            <Input
              id="entry-org"
              value={draft.organization}
              onChange={(e) => update("organization", e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="entry-role">
              {type === "work" ? "Role" : "Degree"}
            </Label>
            <Input
              id="entry-role"
              value={draft.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </FormRow>
        </div>

        <FormRow>
          <Label htmlFor="entry-location">Location</Label>
          <Input
            id="entry-location"
            value={draft.location ?? ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </FormRow>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormRow>
            <Label htmlFor="entry-start">Start date</Label>
            <Input
              id="entry-start"
              placeholder="2024-06"
              value={draft.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="entry-end">End date</Label>
            <Input
              id="entry-end"
              placeholder="blank = ongoing"
              value={draft.endDate ?? ""}
              disabled={draft.current}
              onChange={(e) => update("endDate", e.target.value || null)}
            />
          </FormRow>
          <div className="flex items-end pb-2">
            <Checkbox
              label="Current"
              checked={draft.current}
              onChange={(e) => update("current", e.target.checked)}
            />
          </div>
        </div>

        <FormRow>
          <Label htmlFor="entry-description">Description</Label>
          <Textarea
            id="entry-description"
            rows={2}
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </FormRow>

        <FormRow>
          <Label htmlFor="entry-highlights">Highlights (one per line)</Label>
          <Textarea
            id="entry-highlights"
            rows={3}
            value={draft.highlights.join("\n")}
            onChange={(e) =>
              update(
                "highlights",
                e.target.value.split("\n").map((h) => h.trim()).filter(Boolean),
              )
            }
          />
        </FormRow>

        {type === "education" && (
          <>
            <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <Checkbox
                label="Show GPA on the detail page"
                checked={draft.showGpa ?? false}
                onChange={(e) => update("showGpa", e.target.checked)}
              />
              {draft.showGpa && (
                <FormRow className="max-w-xs">
                  <Label htmlFor="entry-gpa">GPA</Label>
                  <Input
                    id="entry-gpa"
                    placeholder="e.g. 3.8 / 4.0"
                    value={draft.gpa ?? ""}
                    onChange={(e) => update("gpa", e.target.value)}
                  />
                </FormRow>
              )}
            </div>

            <FormRow>
              <Label>Grades / marks</Label>
              <p className="text-xs text-muted">
                For a multi-year degree, add one group per year (e.g. &quot;Year
                1&quot;). For a single-sitting exam like O-Levels or A-Levels,
                leave the label blank — it&apos;ll display as one plain table
                with no year heading.
              </p>
              <div className="flex flex-col gap-3">
                {(draft.gradesByYear ?? []).map((group, yearIndex) => (
                  <div
                    key={yearIndex}
                    className="flex flex-col gap-2 rounded-xl border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={group.year}
                        onChange={(e) => updateYearLabel(yearIndex, e.target.value)}
                        placeholder="e.g. Year 1 (optional)"
                        className="max-w-[10rem] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeYearGroup(yearIndex)}
                        className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                        aria-label="Remove group"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {group.courses.map((course, courseIndex) => (
                      <div key={courseIndex} className="flex flex-wrap items-center gap-2">
                        <Input
                          value={course.name}
                          onChange={(e) =>
                            updateCourse(yearIndex, courseIndex, "name", e.target.value)
                          }
                          placeholder="Subject / course"
                          className="min-w-[8rem] flex-1"
                        />
                        <Input
                          value={course.grade}
                          onChange={(e) =>
                            updateCourse(yearIndex, courseIndex, "grade", e.target.value)
                          }
                          placeholder="Grade"
                          className="w-28 shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeCourse(yearIndex, courseIndex)}
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                          aria-label="Remove grade row"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCourse(yearIndex)}
                      className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-foreground-secondary hover:bg-foreground/5"
                    >
                      <Plus className="size-3.5" /> Add subject
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addYearGroup}
                  className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-foreground-secondary hover:bg-foreground/5"
                >
                  <Plus className="size-3.5" /> Add group
                </button>
              </div>
            </FormRow>
          </>
        )}

        <ImageUpload
          label="Cover image (optional — shown as a banner on the detail page)"
          category="experience"
          nameHint={`${draft.organization}-cover`}
          value={draft.coverImage ?? ""}
          onChange={(path) => update("coverImage", path)}
          aspect={3}
        />

        <ImageUpload
          label="Logo (optional)"
          category="experience"
          nameHint={draft.organization}
          value={draft.logo ?? ""}
          onChange={(path) => update("logo", path)}
          aspect={1}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={() => onSave(draft)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
