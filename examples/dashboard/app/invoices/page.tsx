"use client";

import { Header } from "@/components/header";
import { Widget } from "@/components/widget";

export default function InvoicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Invoice Generator</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated invoice creation workflow with customer selection,
              line items, and totals
            </p>
          </div>
          <div className="aspect-auto min-h-[600px]">
            <Widget
              key="invoices"
              autoGenerate
              skipSave
              initialPrompt="Build an invoice management workspace with: 1) A top section with a heading 'Invoice Manager' and two action buttons: 'View All Invoices' (viewInvoices action) and 'View Customers' (viewCustomers action). 2) An invoice list table showing all invoices with columns for invoice number, customer, amount, status, and due date, using dataPath 'invoices.data'. Include action buttons in the description to send invoice (sendInvoice action) and mark as paid (markInvoicePaid action). 3) A 'Create New Invoice' card with a form containing: customer selection (select dropdown), invoice date input, due date input, line items section with description input, quantity input, unit price input, and a notes textarea. 4) A summary card showing invoice totals with subtotal, tax, and total displayed as large text values. 5) A bottom row with 'Save Draft' and 'Send Invoice' buttons. Use cards to separate each section."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
