"use client";

import { Header } from "@/components/header";
import { Widget } from "@/components/widget";

export default function ReportsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Sales Reports & Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated P&L overview with charts, revenue breakdown, and
              expense summary
            </p>
          </div>
          <div className="aspect-auto min-h-[600px]">
            <Widget
              key="reports"
              autoGenerate
              skipSave
              initialPrompt="Build a sales analytics dashboard with: 1) A top row of 4 metric cards showing: Total Revenue, Total Expenses, Net Profit, and Outstanding Invoices - each with a heading and a large text value. 2) A bar chart showing revenue by month with a button to load invoice data (use viewInvoices action). 3) Below the chart, a two-column grid: left column has an expense breakdown table with a button to load expenses (use viewExpenses action), right column has a line chart for revenue trends over time. 4) At the bottom, an accounts summary table with a button to load accounts (use viewAccounts action). Use cards to wrap each section with clear headings."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
