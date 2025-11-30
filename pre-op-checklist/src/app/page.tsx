import { PreOpChecklistForm } from "@/components/pre-op-checklist-form";

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PreOpChecklistForm />
      </div>
    </main>
  );
}
