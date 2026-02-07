"use client";

import { Header } from "@/components/header";
import { Widget } from "@/components/widget";

export default function ExplorerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Data Explorer</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated interactive data exploration with filters, tables,
              and charts
            </p>
          </div>
          <div className="aspect-auto min-h-[600px]">
            <Widget
              key="explorer"
              autoGenerate
              skipSave
              initialPrompt="Build an interactive data explorer with: 1) A control bar at the top with buttons to load different datasets - 'Load Customers' button (viewCustomers action), 'Load Invoices' button (viewInvoices action), 'Load Expenses' button (viewExpenses action), and 'Load Accounts' button (viewAccounts action). 2) A two-column layout below: left side (wider) has a data table showing customer records with columns for name, email, and status using dataPath 'customers.data', right side has a bar chart visualizing invoice amounts with dataPath 'invoices.data'. 3) Below that, another two-column layout: left side has a line chart showing expense trends with dataPath 'expenses.data', right side has a summary card with key metrics displayed as badge components. 4) Use cards with clear headings for each section. Add a 'Refresh All' heading at the top."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
