import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CallHistoryTable from "@/components/tables/CallHistoryTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

const breadcrumbs = [
        { name: "Home", href: "/" },
        { name: "Lead", href: "/calllog-tables" }
    ];

export default function CallHistoryTables() {
  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Call History Table">
          <CallHistoryTable />
        </ComponentCard>
      </div>
    </div>
  );
}
