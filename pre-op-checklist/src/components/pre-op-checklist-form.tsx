"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useAirtable } from "@/lib/hooks/use-airtable";
import { INSPECTION_ITEMS, EMPLOYEE_IDS, type ChecklistFormData } from "@/lib/types";

const initialFormData: ChecklistFormData = {
  date: new Date().toISOString().split("T")[0],
  employeeName: "",
  employeeId: "",
  assetMake: "",
  assetId: "",
  hours: "",
  kilometers: "",
  itemsInspected: INSPECTION_ITEMS.map((item) => item.id),
  itemsRequiringAttention: [],
  equipmentCondition: "",
  comments: "",
  actionTaken: "",
};

export function PreOpChecklistForm() {
  const [formData, setFormData] = useState<ChecklistFormData>(initialFormData);
  const [showAttentionDetails, setShowAttentionDetails] = useState(false);
  const { isOnline, saveForLater, pendingSubmissions } = useLocalStorage();
  const { submitToAirtable, isSubmitting, isConfigured } = useAirtable();

  // Automatically show attention details if any items require attention
  useEffect(() => {
    if (formData.itemsRequiringAttention.length > 0) {
      setShowAttentionDetails(true);
    }
  }, [formData.itemsRequiringAttention]);

  const handleInputChange = (field: keyof ChecklistFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInspectedToggle = (itemId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      itemsInspected: checked
        ? [...prev.itemsInspected, itemId]
        : prev.itemsInspected.filter((id) => id !== itemId),
    }));
  };

  const handleAttentionToggle = (itemId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      itemsRequiringAttention: checked
        ? [...prev.itemsRequiringAttention, itemId]
        : prev.itemsRequiringAttention.filter((id) => id !== itemId),
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.employeeName.trim()) {
      return "Employee Name is required";
    }
    if (!formData.assetMake.trim()) {
      return "Asset Make and Equipment Type is required";
    }
    if (!formData.equipmentCondition) {
      return "Please select the equipment condition";
    }
    if (!formData.actionTaken) {
      return "Please select the action taken";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!isOnline) {
      saveForLater(formData);
      toast.info("Saved offline", {
        description: "Your checklist will be submitted when you're back online.",
      });
      resetForm();
      return;
    }

    if (!isConfigured) {
      // Demo mode - just show success
      toast.success("Checklist Submitted (Demo Mode)", {
        description: "Configure Airtable API keys for real submissions.",
      });
      resetForm();
      return;
    }

    const result = await submitToAirtable(formData);

    if (result.success) {
      toast.success("Checklist Submitted", {
        description: `Record ID: ${result.recordId}`,
      });
      resetForm();
    } else {
      // Save locally if submission fails
      saveForLater(formData);
      toast.error("Submission failed", {
        description: `${result.error}. Saved locally for retry.`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      date: new Date().toISOString().split("T")[0],
    });
    setShowAttentionDetails(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">🔧</span>
            Pre-Op Equipment Checklist
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Part XV - Materials Handling Equipment
            <br />
            Sections 229.2 & 230.5 - Daily Safety Check
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status Indicators - Larger for gloves */}
      <div className="flex gap-3 flex-wrap">
        <div
          className={`px-4 py-2 rounded-full text-base font-medium ${
            isOnline
              ? "bg-green-500/20 text-green-400 border-2 border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30"
          }`}
        >
          {isOnline ? "● Online" : "○ Offline"}
        </div>
        {pendingSubmissions.length > 0 && (
          <div className="px-4 py-2 rounded-full text-base font-medium bg-blue-500/20 text-blue-400 border-2 border-blue-500/30">
            {pendingSubmissions.length} pending sync
          </div>
        )}
        {!isConfigured && (
          <div className="px-4 py-2 rounded-full text-base font-medium bg-orange-500/20 text-orange-400 border-2 border-orange-500/30">
            Demo Mode
          </div>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label htmlFor="date" className="text-base font-semibold">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="h-14 text-lg px-4"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="employeeName" className="text-base font-semibold">
                Employee Initials or Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="employeeName"
                placeholder="Enter your name or initials"
                value={formData.employeeName}
                onChange={(e) => handleInputChange("employeeName", e.target.value)}
                required
                className="h-14 text-lg px-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label htmlFor="employeeId" className="text-base font-semibold">Employee ID Number</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => handleInputChange("employeeId", value)}
              >
                <SelectTrigger className="h-14 text-lg px-4">
                  <SelectValue placeholder="Select ID or 'I Don't Know'" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_IDS.map((id) => (
                    <SelectItem key={id.value} value={id.value} className="text-lg py-3">
                      {id.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="assetMake" className="text-base font-semibold">
                Asset Make and Equipment Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assetMake"
                placeholder="Describe as best as you can"
                value={formData.assetMake}
                onChange={(e) => handleInputChange("assetMake", e.target.value)}
                required
                className="h-14 text-lg px-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="assetId" className="text-base font-semibold">Asset ID Number</Label>
              <Input
                id="assetId"
                placeholder="Model # if unknown"
                value={formData.assetId}
                onChange={(e) => handleInputChange("assetId", e.target.value)}
                className="h-14 text-lg px-4"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="hours" className="text-base font-semibold">Hours</Label>
              <Input
                id="hours"
                type="number"
                placeholder="Equipment hours"
                value={formData.hours}
                onChange={(e) => handleInputChange("hours", e.target.value)}
                className="h-14 text-lg px-4"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="kilometers" className="text-base font-semibold">Kilometers</Label>
              <Input
                id="kilometers"
                type="number"
                placeholder="Vehicle km"
                value={formData.kilometers}
                onChange={(e) => handleInputChange("kilometers", e.target.value)}
                className="h-14 text-lg px-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Inspected - Large touch targets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Items Inspected</CardTitle>
          <CardDescription className="text-base">Uncheck items that were not inspected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INSPECTION_ITEMS.map((item) => (
              <label
                key={item.id}
                htmlFor={`inspected-${item.id}`}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  formData.itemsInspected.includes(item.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <Checkbox
                  id={`inspected-${item.id}`}
                  checked={formData.itemsInspected.includes(item.id)}
                  onCheckedChange={(checked) =>
                    handleInspectedToggle(item.id, checked as boolean)
                  }
                  className="h-7 w-7 rounded-md"
                />
                <span className="text-base font-medium flex-1">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Requiring Attention - Large touch targets */}
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="text-xl text-warning flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            Items Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INSPECTION_ITEMS.map((item) => (
              <label
                key={item.id}
                htmlFor={`attention-${item.id}`}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  formData.itemsRequiringAttention.includes(item.id)
                    ? "bg-warning/20 border-warning"
                    : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <Checkbox
                  id={`attention-${item.id}`}
                  checked={formData.itemsRequiringAttention.includes(item.id)}
                  onCheckedChange={(checked) =>
                    handleAttentionToggle(item.id, checked as boolean)
                  }
                  className="h-7 w-7 rounded-md border-warning data-[state=checked]:bg-warning data-[state=checked]:border-warning"
                />
                <span className="text-base font-medium flex-1">
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Show details for items requiring attention */}
          {showAttentionDetails && formData.itemsRequiringAttention.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold text-base text-muted-foreground">
                  Inspection Guidelines:
                </h4>
                {formData.itemsRequiringAttention.map((itemId) => {
                  const item = INSPECTION_ITEMS.find((i) => i.id === itemId);
                  if (!item) return null;
                  return (
                    <div
                      key={itemId}
                      className="p-4 rounded-lg bg-warning/10 border-2 border-warning/30"
                    >
                      <h5 className="font-semibold text-lg text-warning">{item.label}</h5>
                      <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Equipment Condition & Action - Large touch targets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Condition of Equipment <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.equipmentCondition}
              onValueChange={(value) =>
                handleInputChange("equipmentCondition", value as "ok" | "requires_attention")
              }
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <label
                htmlFor="condition-ok"
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  formData.equipmentCondition === "ok"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <RadioGroupItem value="ok" id="condition-ok" className="h-6 w-6" />
                <span className="text-lg font-medium">✓ OK</span>
              </label>
              <label
                htmlFor="condition-attention"
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  formData.equipmentCondition === "requires_attention"
                    ? "bg-warning/20 border-warning"
                    : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <RadioGroupItem value="requires_attention" id="condition-attention" className="h-6 w-6" />
                <span className="text-lg font-medium">⚠ Requires Attention</span>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comments" className="text-base font-semibold">Comments/Observations</Label>
            <Textarea
              id="comments"
              placeholder="Additional items requiring attention. Note routine maintenance."
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              rows={4}
              className="text-lg p-4 min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Action Taken <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.actionTaken}
              onValueChange={(value) =>
                handleInputChange("actionTaken", value as "cleared" | "reported")
              }
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <label
                htmlFor="action-cleared"
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  formData.actionTaken === "cleared"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <RadioGroupItem value="cleared" id="action-cleared" className="h-6 w-6" />
                <span className="text-lg font-medium">✓ Equipment Cleared</span>
              </label>
              <label
                htmlFor="action-reported"
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${
                  formData.actionTaken === "reported"
                    ? "bg-orange-500/20 border-orange-500"
                    : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <RadioGroupItem value="reported" id="action-reported" className="h-6 w-6" />
                <span className="text-lg font-medium">🔧 Reported for Maintenance</span>
              </label>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button - Extra large for gloved hands */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1 h-16 text-xl font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-3 text-2xl">⏳</span>
              Submitting...
            </>
          ) : (
            <>Submit Checklist</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="h-16 px-6 text-lg font-semibold"
        >
          Clear
        </Button>
      </div>

      {/* Footer */}
      <p className="text-sm text-center text-muted-foreground py-4">
        Do not submit passwords through this form.
      </p>
    </form>
  );
}
