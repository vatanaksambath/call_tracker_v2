"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadsTable from "@/components/tables/LeadsTable";
import React from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Site Visit", href: "/sitevisit" }
  ];

export default function SiteVisitPage() {
  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Site Visit">
          <div className="flex items-center gap-3">
            <Link href="/sitevisit/create">
              <Button size="md" variant="primary">
                Add Site Visit +
              </Button>
            </Link>
            {/* <Button size="md" variant="outline">
              Edit Lead
            </Button> */}
          </div>
          <LeadsTable />
        </ComponentCard>
      </div>
    </div>
  );
}