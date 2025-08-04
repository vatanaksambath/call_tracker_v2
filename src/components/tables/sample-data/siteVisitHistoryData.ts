export interface SiteVisitHistory {
  visitPipelineID: number;
  visitLogOrderID: number;
  visitDate: string;
  visitStartTime: string;
  visitEndTime: string;
  visitStatus: "Completed" | "No Show" | "Cancelled" | "Postponed" | "In Progress" | "Scheduled";
  visitType: "Initial Tour" | "Follow-up Visit" | "Final Inspection" | "Property Viewing" | "Documentation" | "Other";
  attendees: string;
  notes: string;
  createdAt: string;
}

// Mock data for site visit history - each pipeline can have multiple site visit entries
export const siteVisitHistoryData: SiteVisitHistory[] = [
  // Pipeline 1 - Multiple site visits
  {
    visitPipelineID: 1,
    visitLogOrderID: 1,
    visitDate: "2025-07-01",
    visitStartTime: "10:00",
    visitEndTime: "11:30",
    visitStatus: "Completed",
    visitType: "Initial Tour",
    attendees: "Client, John Smith (Sales Rep)",
    notes: "Client very impressed with the property layout and amenities. Showed interest in the master bedroom and kitchen features. Discussed pricing and financing options.",
    createdAt: "2025-07-01T11:30:00Z"
  },
  {
    visitPipelineID: 1,
    visitLogOrderID: 2,
    visitDate: "2025-07-03",
    visitStartTime: "14:00",
    visitEndTime: "15:15",
    visitStatus: "Completed",
    visitType: "Follow-up Visit",
    attendees: "Client + Spouse, John Smith (Sales Rep)",
    notes: "Brought spouse for second opinion. Both very positive about the property. Discussed customization options and move-in timeline. Ready to proceed with paperwork.",
    createdAt: "2025-07-03T15:15:00Z"
  },
  {
    visitPipelineID: 1,
    visitLogOrderID: 3,
    visitDate: "2025-07-05",
    visitStartTime: "09:30",
    visitEndTime: "10:00",
    visitStatus: "Completed",
    visitType: "Final Inspection",
    attendees: "Client, John Smith (Sales Rep), Property Manager",
    notes: "Final walkthrough before contract signing. All amenities demonstrated. Client satisfied with property condition. Contract signed.",
    createdAt: "2025-07-05T10:00:00Z"
  },

  // Pipeline 2 - Some visits with different statuses
  {
    visitPipelineID: 2,
    visitLogOrderID: 1,
    visitDate: "2025-06-28",
    visitStartTime: "11:00",
    visitEndTime: "12:00",
    visitStatus: "Completed",
    visitType: "Property Viewing",
    attendees: "Client, Alice Johnson (Sales Rep)",
    notes: "Initial property tour. Client interested but needs time to consider. Provided detailed brochure and pricing information.",
    createdAt: "2025-06-28T12:00:00Z"
  },
  {
    visitPipelineID: 2,
    visitLogOrderID: 2,
    visitDate: "2025-07-02",
    visitStartTime: "15:30",
    visitEndTime: "",
    visitStatus: "No Show",
    visitType: "Follow-up Visit",
    attendees: "Alice Johnson (Sales Rep)",
    notes: "Client did not show up for scheduled appointment. Attempted to contact but no response. Will try reaching out again tomorrow.",
    createdAt: "2025-07-02T16:00:00Z"
  },
  {
    visitPipelineID: 2,
    visitLogOrderID: 3,
    visitDate: "2025-07-04",
    visitStartTime: "10:30",
    visitEndTime: "11:45",
    visitStatus: "Completed",
    visitType: "Follow-up Visit",
    attendees: "Client, Alice Johnson (Sales Rep)",
    notes: "Rescheduled visit. Client apologized for missing previous appointment. Still very interested. Discussed payment plans and timeline.",
    createdAt: "2025-07-04T11:45:00Z"
  },

  // Pipeline 3 - Recent visits
  {
    visitPipelineID: 3,
    visitLogOrderID: 1,
    visitDate: "2025-07-06",
    visitStartTime: "13:00",
    visitEndTime: "14:30",
    visitStatus: "Completed",
    visitType: "Initial Tour",
    attendees: "Client Family (4 members), Bob Wilson (Sales Rep)",
    notes: "Family tour including teenage children. Parents liked the property but children had concerns about distance from school. Provided school district information.",
    createdAt: "2025-07-06T14:30:00Z"
  },
  {
    visitPipelineID: 3,
    visitLogOrderID: 2,
    visitDate: "2025-07-08",
    visitStartTime: "16:00",
    visitEndTime: "",
    visitStatus: "Scheduled",
    visitType: "Follow-up Visit",
    attendees: "Client Family, Bob Wilson (Sales Rep)",
    notes: "Scheduled follow-up to address school concerns and show neighborhood amenities. Will include visit to nearby school and recreational facilities.",
    createdAt: "2025-07-06T14:35:00Z"
  },

  // Pipeline 4 - Cancelled visits
  {
    visitPipelineID: 4,
    visitLogOrderID: 1,
    visitDate: "2025-06-30",
    visitStartTime: "09:00",
    visitEndTime: "",
    visitStatus: "Cancelled",
    visitType: "Property Viewing",
    attendees: "Client, Carol Brown (Sales Rep)",
    notes: "Client called to cancel due to family emergency. Offered to reschedule but client needs time to resolve personal matters first.",
    createdAt: "2025-06-30T08:30:00Z"
  },
  {
    visitPipelineID: 4,
    visitLogOrderID: 2,
    visitDate: "2025-07-07",
    visitStartTime: "14:00",
    visitEndTime: "15:15",
    visitStatus: "Completed",
    visitType: "Property Viewing",
    attendees: "Client, Carol Brown (Sales Rep)",
    notes: "Rescheduled visit after client resolved personal matters. Very positive response to property. Interested in moving forward with application process.",
    createdAt: "2025-07-07T15:15:00Z"
  },

  // Pipeline 5 - Postponed visit
  {
    visitPipelineID: 5,
    visitLogOrderID: 1,
    visitDate: "2025-07-05",
    visitStartTime: "11:00",
    visitEndTime: "",
    visitStatus: "Postponed",
    visitType: "Initial Tour",
    attendees: "Client, Mike Davis (Sales Rep)",
    notes: "Visit postponed due to bad weather conditions. Client preferred to wait for better weather to properly assess outdoor amenities. Rescheduled for next week.",
    createdAt: "2025-07-05T10:30:00Z"
  },

  // Pipeline 6 - In Progress visit
  {
    visitPipelineID: 6,
    visitLogOrderID: 1,
    visitDate: "2025-07-08",
    visitStartTime: "10:00",
    visitEndTime: "",
    visitStatus: "In Progress",
    visitType: "Property Viewing",
    attendees: "Client Couple, Sarah Chen (Sales Rep)",
    notes: "Currently conducting property tour. Clients very engaged and asking detailed questions about amenities and HOA policies.",
    createdAt: "2025-07-08T10:00:00Z"
  },

  // Pipeline 7 - Multiple documentation visits
  {
    visitPipelineID: 7,
    visitLogOrderID: 1,
    visitDate: "2025-06-25",
    visitStartTime: "15:00",
    visitEndTime: "16:00",
    visitStatus: "Completed",
    visitType: "Property Viewing",
    attendees: "Client, David Martinez (Sales Rep)",
    notes: "Initial property viewing. Client is a real estate investor interested in rental potential. Discussed ROI and property management options.",
    createdAt: "2025-06-25T16:00:00Z"
  },
  {
    visitPipelineID: 7,
    visitLogOrderID: 2,
    visitDate: "2025-06-27",
    visitStartTime: "10:00",
    visitEndTime: "11:30",
    visitStatus: "Completed",
    visitType: "Documentation",
    attendees: "Client, David Martinez (Sales Rep), Property Inspector",
    notes: "Detailed inspection for investment purposes. Inspector provided comprehensive report. Client satisfied with property condition and investment potential.",
    createdAt: "2025-06-27T11:30:00Z"
  },
  {
    visitPipelineID: 7,
    visitLogOrderID: 3,
    visitDate: "2025-06-29",
    visitStartTime: "14:30",
    visitEndTime: "15:00",
    visitStatus: "Completed",
    visitType: "Final Inspection",
    attendees: "Client, David Martinez (Sales Rep), Legal Representative",
    notes: "Final legal review and documentation signing. Investment purchase completed successfully. Client expressed interest in similar properties.",
    createdAt: "2025-06-29T15:00:00Z"
  },

  // Pipeline 8 - Future scheduled visits
  {
    visitPipelineID: 8,
    visitLogOrderID: 1,
    visitDate: "2025-07-09",
    visitStartTime: "09:00",
    visitEndTime: "",
    visitStatus: "Scheduled",
    visitType: "Initial Tour",
    attendees: "Client, Lisa Rodriguez (Sales Rep)",
    notes: "First-time homebuyer scheduled for comprehensive property tour. Will include explanation of home buying process and financing options.",
    createdAt: "2025-07-07T16:00:00Z"
  },

  // Pipeline 9 - Mixed visit types
  {
    visitPipelineID: 9,
    visitLogOrderID: 1,
    visitDate: "2025-06-26",
    visitStartTime: "11:30",
    visitEndTime: "12:45",
    visitStatus: "Completed",
    visitType: "Property Viewing",
    attendees: "Client, Emma Wilson (Sales Rep)",
    notes: "Corporate relocation client. Needs quick decision due to job start date. Very organized and decisive. Liked property location relative to new workplace.",
    createdAt: "2025-06-26T12:45:00Z"
  },
  {
    visitPipelineID: 9,
    visitLogOrderID: 2,
    visitDate: "2025-06-28",
    visitStartTime: "13:00",
    visitEndTime: "13:30",
    visitStatus: "Completed",
    visitType: "Documentation",
    attendees: "Client, Emma Wilson (Sales Rep), HR Representative",
    notes: "Corporate housing documentation review. All corporate requirements met. HR representative approved property for relocation package.",
    createdAt: "2025-06-28T13:30:00Z"
  },

  // Pipeline 10 - Recent and upcoming
  {
    visitPipelineID: 10,
    visitLogOrderID: 1,
    visitDate: "2025-07-07",
    visitStartTime: "10:30",
    visitEndTime: "12:00",
    visitStatus: "Completed",
    visitType: "Initial Tour",
    attendees: "Client + Parents, Robert Kim (Sales Rep)",
    notes: "Young professional with parents as co-signers. Parents very involved in decision process. All parties impressed with property and neighborhood safety.",
    createdAt: "2025-07-07T12:00:00Z"
  },
  {
    visitPipelineID: 10,
    visitLogOrderID: 2,
    visitDate: "2025-07-09",
    visitStartTime: "15:00",
    visitEndTime: "",
    visitStatus: "Scheduled",
    visitType: "Follow-up Visit",
    attendees: "Client + Parents, Robert Kim (Sales Rep), Loan Officer",
    notes: "Scheduled follow-up with loan officer to finalize financing. All parties ready to move forward pending final approval.",
    createdAt: "2025-07-07T12:05:00Z"
  }
];
