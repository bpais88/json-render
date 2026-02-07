"use client";

import { Header } from "@/components/header";
import { Widget } from "@/components/widget";

export default function FormsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dynamic Form Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated intake form with conditional fields, validation, and
              submission
            </p>
          </div>
          <div className="aspect-auto min-h-[600px]">
            <Widget
              key="forms"
              autoGenerate
              skipSave
              initialPrompt="Create a comprehensive customer intake form inside a card with the heading 'New Customer Registration'. The form should have: 1) Personal Information section - inputs for first name, last name, email (with validation), phone number. 2) Account Type section - a radio group to select between Individual, Business, or Enterprise. 3) Business Details section (only visible when account type is Business or Enterprise) - inputs for company name, tax ID, and number of employees (select: 1-10, 11-50, 51-200, 200+). 4) Preferences section - checkbox group for communication preferences (Email, Phone, Mail), a select dropdown for preferred contact time (Morning, Afternoon, Evening), and a switch for 'Subscribe to newsletter'. 5) Additional Notes textarea. 6) A divider, then a submit row with a 'Create Customer' button using the createCustomer action and a 'Reset' button. Use proper form validation with required fields marked."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
