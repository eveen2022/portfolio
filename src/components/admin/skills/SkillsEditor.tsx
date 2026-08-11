"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { SkillGroup, SkillLevel } from "@/lib/types";
import { Label, Input, Select, Card } from "@/components/admin/form";
import { IconPicker } from "@/components/admin/IconPicker";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";

export function SkillsEditor({ initial }: { initial: SkillGroup[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [groups, setGroups] = useState<SkillGroup[]>(initial);
  const [saving, setSaving] = useState(false);

  function addGroup() {
    setGroups((prev) => [...prev, { category: "New category", items: [] }]);
  }

  function removeGroup(index: number) {
    setGroups((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCategory(index: number, category: string) {
    setGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, category } : g)),
    );
  }

  function addItem(groupIndex: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              items: [
                ...g.items,
                { name: "", level: "intermediate" as SkillLevel, icon: "" },
              ],
            }
          : g,
      ),
    );
  }

  function updateItem(
    groupIndex: number,
    itemIndex: number,
    field: "name" | "level" | "icon",
    value: string,
  ) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              items: g.items.map((item, j) =>
                j === itemIndex ? { ...item, [field]: value } : item,
              ),
            }
          : g,
      ),
    );
  }

  function removeItem(groupIndex: number, itemIndex: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, items: g.items.filter((_, j) => j !== itemIndex) }
          : g,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groups),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save");
      }
      toast({ type: "success", title: "Skills saved" });
      router.refresh();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save skills",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, groupIndex) => (
        <Card key={groupIndex} className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor={`category-${groupIndex}`}>Category</Label>
              <Input
                id={`category-${groupIndex}`}
                value={group.category}
                onChange={(e) => updateCategory(groupIndex, e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeGroup(groupIndex)}
              className="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
              aria-label="Remove category"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex flex-wrap items-center gap-2">
                <IconPicker
                  value={item.icon}
                  onChange={(icon) => updateItem(groupIndex, itemIndex, "icon", icon)}
                  className="w-32 shrink-0 sm:w-36"
                />
                <Input
                  value={item.name}
                  onChange={(e) =>
                    updateItem(groupIndex, itemIndex, "name", e.target.value)
                  }
                  placeholder="Skill name"
                  className="min-w-[8rem] flex-1"
                />
                <Select
                  value={item.level}
                  onChange={(e) =>
                    updateItem(groupIndex, itemIndex, "level", e.target.value)
                  }
                  className="w-36 flex-1 sm:flex-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
                <button
                  type="button"
                  onClick={() => removeItem(groupIndex, itemIndex)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  aria-label="Remove skill"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(groupIndex)}
              className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-foreground-secondary hover:bg-foreground/5"
            >
              <Plus className="size-3.5" /> Add skill
            </button>
          </div>
        </Card>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="glass relative flex items-center justify-center gap-1.5 rounded-2xl p-4 text-sm font-medium text-foreground-secondary"
      >
        <Plus className="size-4" /> Add category
      </button>

      <div>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
