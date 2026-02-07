"use client";

import { Header } from "@/components/header";
import { Widget } from "@/components/widget";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Onboarding Flow</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated multi-step setup wizard with profile, preferences,
              and confirmation
            </p>
          </div>
          <div className="aspect-auto min-h-[600px]">
            <Widget
              key="onboarding"
              autoGenerate
              skipSave
              initialPrompt="Create a multi-step onboarding wizard using tabs with 3 steps: Tab 1 'Profile Setup' - contains a form with inputs for full name, email address, company name, job title (select dropdown with options: Developer, Designer, Manager, Executive, Other), and a profile bio textarea. Tab 2 'Preferences' - contains settings with: notification preferences (checkbox group with Email Alerts, SMS Alerts, In-App Notifications), preferred dashboard theme (radio group: Light, Dark, System), default currency (select: USD, EUR, GBP, JPY), and a switch toggle for 'Enable weekly reports'. Tab 3 'Confirmation' - shows a summary card with an alert saying 'Review your settings before completing setup', a text summary of what was configured, and a 'Complete Setup' button. Each tab should be clearly labeled with step numbers."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
