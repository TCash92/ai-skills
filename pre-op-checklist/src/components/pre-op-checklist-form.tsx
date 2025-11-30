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
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🔧</span>
            Pre-Op Equipment Checklist
          </CardTitle>
          <CardDescription className="text-sm">
            Part XV - Materials Handling Equipment and Personnel Carrying Equipment
            <br />
            Sections 229.2 & 230.5 - Daily Safety Device Check
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status Indicators */}
      <div className="flex gap-2 flex-wrap">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOnline
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {isOnline ? "● Online" : "○ Offline"}
        </div>
        {pendingSubmissions.length > 0 && (
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {pendingSubmissions.length} pending sync
          </div>
        )}
        {!isConfigured && (
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
            Demo Mode
          </div>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeName">
                Employee Initials or Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="employeeName"
                placeholder="Enter your name or initials"
                value={formData.employeeName}
                onChange={(e) => handleInputChange("employeeName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID Number</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => handleInputChange("employeeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID or 'I Don't Know'" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_IDS.map((id) => (
                    <SelectItem key={id.value} value={id.value}>
                      {id.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetMake">
                Asset Make and Equipment Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assetMake"
                placeholder="Describe as best as you can if unknown"
                value={formData.assetMake}
                onChange={(e) => handleInputChange("assetMake", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetId">Asset ID Number</Label>
              <Input
                id="assetId"
                placeholder="Model number if unknown"
                value={formData.assetId}
                onChange={(e) => handleInputChange("assetId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                placeholder="Equipment hours"
                value={formData.hours}
                onChange={(e) => handleInputChange("hours", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometers">Kilometers</Label>
              <Input
                id="kilometers"
                type="number"
                placeholder="Vehicle kilometers"
                value={formData.kilometers}
                onChange={(e) => handleInputChange("kilometers", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Inspected */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items Inspected</CardTitle>
          <CardDescription>Uncheck items that were not inspected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INSPECTION_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`inspected-${item.id}`}
                  checked={formData.itemsInspected.includes(item.id)}
                  onCheckedChange={(checked) =>
                    handleInspectedToggle(item.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`inspected-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Requiring Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warning flex items-center gap-2">
            ⚠️ Check Items That Require Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INSPECTION_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`attention-${item.id}`}
                  checked={formData.itemsRequiringAttention.includes(item.id)}
                  onCheckedChange={(checked) =>
                    handleAttentionToggle(item.id, checked as boolean)
                  }
                  className="border-warning data-[state=checked]:bg-warning data-[state=checked]:border-warning"
                />
                <Label
                  htmlFor={`attention-${item.id}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          {/* Show details for items requiring attention */}
          {showAttentionDetails && formData.itemsRequiringAttention.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Inspection Guidelines for Selected Items:
                </h4>
                {formData.itemsRequiringAttention.map((itemId) => {
                  const item = INSPECTION_ITEMS.find((i) => i.id === itemId);
                  if (!item) return null;
                  return (
                    <div
                      key={itemId}
                      className="p-3 rounded-md bg-warning/10 border border-warning/20"
                    >
                      <h5 className="font-medium text-warning">{item.label}</h5>
                      <p className="text-sm text-muted-foreground mt-1">
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

      {/* Equipment Condition & Action */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>
              Condition of Equipment <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.equipmentCondition}
              onValueChange={(value) =>
                handleInputChange("equipmentCondition", value as "ok" | "requires_attention")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ok" id="condition-ok" />
                <Label htmlFor="condition-ok" className="cursor-pointer font-normal">
                  ✓ OK
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="requires_attention" id="condition-attention" />
                <Label htmlFor="condition-attention" className="cursor-pointer font-normal">
                  ⚠ Requires Attention
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments/Observations</Label>
            <Textarea
              id="comments"
              placeholder="Additional items requiring attention. Note routine maintenance."
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>
              Action Taken <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.actionTaken}
              onValueChange={(value) =>
                handleInputChange("actionTaken", value as "cleared" | "reported")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cleared" id="action-cleared" />
                <Label htmlFor="action-cleared" className="cursor-pointer font-normal">
                  ✓ Equipment Cleared
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reported" id="action-reported" />
                <Label htmlFor="action-reported" className="cursor-pointer font-normal">
                  🔧 Reported for Maintenance
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 h-12 text-lg font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
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
          className="h-12"
        >
          Clear
        </Button>
      </div>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Do not submit passwords through this form.
      </p>
    </form>
  );
}
