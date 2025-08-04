"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeveloperOwnerTable from "@/components/tables/DeveloperOwnerTable";
import React from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Developer Owner", href: "/developer-owner" }
];

export default function DeveloperOwnerPage() {
  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Developer Owners">
          <div className="flex items-center gap-3">
            <Link href="/developer-owner/create">
              <Button size="md" variant="primary">
                Add Developer Owner +
              </Button>
            </Link>
          </div>
          <DeveloperOwnerTable />
        </ComponentCard>
      </div>
    </div>
  );
}
