"use client";

import { Header } from "@/components/header";
import { Widget } from "@/components/widget";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Customer Support Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated troubleshooting form with customer lookup and
              diagnostic steps
            </p>
          </div>
          <div className="aspect-auto min-h-[600px]">
            <Widget
              key="support"
              autoGenerate
              skipSave
              initialPrompt="Build a customer support portal with: 1) A customer lookup section with a search input to find customers by name or email, with a table showing matching results from the customer database. 2) Below that, an issue reporting form with fields for: issue category (dropdown with options: Billing, Technical, Account Access, Feature Request, Other), priority level (radio group: Low, Medium, High, Critical), subject line (text input), and detailed description (textarea). 3) A diagnostic steps accordion with expandable sections for: Check Account Status, Verify Payment History, Review Recent Activity. 4) A submit button to create the support ticket. Use cards to separate each section."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
