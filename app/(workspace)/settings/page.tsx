import { Card, CardHeader } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader
          eyebrow="Configuration"
          title="Environment contracts"
          body="Supabase, storage, email, and database settings are documented in .env.example and README."
        />
      </Card>
      <Card>
        <CardHeader
          eyebrow="Security"
          title="Role boundaries"
          body="Client viewers are intentionally filtered away from internal roadmap, notes, blockers, and time detail."
        />
      </Card>
    </div>
  );
}
