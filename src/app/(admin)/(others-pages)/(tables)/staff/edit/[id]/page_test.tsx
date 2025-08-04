"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function TestStaffEdit() {
  const params = useParams();
  const staffId = params.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Staff Edit Page - Test</h1>
      <p>Staff ID: {staffId}</p>
      <p>This is a minimal test version to check if the route works.</p>
    </div>
  );
}
