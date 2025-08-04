export interface CallLogHistory {
  callPipelineID: number;
  callLogOrderID: number;
  callDate: string;
  callStartTime: string;
  callEndTime: string;
  callStatus: "Completed" | "No Answer" | "Busy" | "Voicemail" | "Cancelled" | "Failed";
  notes: string;
  createdAt: string;
}

// Mock data for call log history - each pipeline can have multiple call log entries
export const callLogHistoryData: CallLogHistory[] = [
  // Pipeline 1 - Multiple call attempts
  {
    callPipelineID: 1,
    callLogOrderID: 1,
    callDate: "2025-06-25",
    callStartTime: "09:15",
    callEndTime: "09:32",
    callStatus: "Completed",
    notes: "Initial contact. Client interested in property details. Scheduled follow-up call.",
    createdAt: "2025-06-25T09:32:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 2,
    callDate: "2025-06-28",
    callStartTime: "14:20",
    callEndTime: "14:35",
    callStatus: "Completed",
    notes: "Follow-up call. Provided pricing information. Client requested site visit.",
    createdAt: "2025-06-28T14:35:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 3,
    callDate: "2025-06-30",
    callStartTime: "11:10",
    callEndTime: "11:15",
    callStatus: "Completed",
    notes: "Confirmed site visit appointment for tomorrow. Very interested prospect.",
    createdAt: "2025-06-30T11:15:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 4,
    callDate: "2025-07-01",
    callStartTime: "16:00",
    callEndTime: "16:20",
    callStatus: "Completed",
    notes: "Post site visit call. Client loved the property. Discussing financing options.",
    createdAt: "2025-07-01T16:20:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 5,
    callDate: "2025-07-02",
    callStartTime: "10:30",
    callEndTime: "",
    callStatus: "No Answer",
    notes: "Attempted to call regarding loan pre-approval. Left voicemail.",
    createdAt: "2025-07-02T10:31:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 6,
    callDate: "2025-07-02",
    callStartTime: "15:45",
    callEndTime: "16:05",
    callStatus: "Completed",
    notes: "Client called back. Loan approved! Proceeding with purchase agreement.",
    createdAt: "2025-07-02T16:05:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 7,
    callDate: "2025-07-03",
    callStartTime: "09:00",
    callEndTime: "09:25",
    callStatus: "Completed",
    notes: "Contract review call. Went through all terms and conditions. Client satisfied.",
    createdAt: "2025-07-03T09:25:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 8,
    callDate: "2025-07-04",
    callStartTime: "14:15",
    callEndTime: "",
    callStatus: "Busy",
    notes: "Client was in meeting. Will call back later today.",
    createdAt: "2025-07-04T14:16:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 9,
    callDate: "2025-07-04",
    callStartTime: "17:30",
    callEndTime: "17:40",
    callStatus: "Completed",
    notes: "Final confirmation call. Closing scheduled for next week. All documents ready.",
    createdAt: "2025-07-04T17:40:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 10,
    callDate: "2025-07-05",
    callStartTime: "11:20",
    callEndTime: "11:35",
    callStatus: "Completed",
    notes: "Pre-closing call. Answered final questions about move-in procedures and keys.",
    createdAt: "2025-07-05T11:35:00Z"
  },
  {
    callPipelineID: 1,
    callLogOrderID: 11,
    callDate: "2025-07-06",
    callStartTime: "13:00",
    callEndTime: "13:10",
    callStatus: "Completed",
    notes: "Congratulations call! Sale completed successfully. Client very happy with service.",
    createdAt: "2025-07-06T13:10:00Z"
  },

  // Pipeline 2 - Two attempts
  {
    callPipelineID: 2,
    callLogOrderID: 1,
    callDate: "2025-06-26",
    callStartTime: "10:30",
    callEndTime: "",
    callStatus: "No Answer",
    notes: "No answer, left voicemail with contact details.",
    createdAt: "2025-06-26T10:31:00Z"
  },
  {
    callPipelineID: 2,
    callLogOrderID: 2,
    callDate: "2025-06-27",
    callStartTime: "15:45",
    callEndTime: "16:02",
    callStatus: "Completed",
    notes: "Client returned call. Discussed business center requirements. Sending brochure.",
    createdAt: "2025-06-27T16:02:00Z"
  },

  // Pipeline 3 - Multiple detailed calls
  {
    callPipelineID: 3,
    callLogOrderID: 1,
    callDate: "2025-06-22",
    callStartTime: "13:00",
    callEndTime: "13:25",
    callStatus: "Completed",
    notes: "Detailed discussion about lakeside villa features. Client very interested in premium units.",
    createdAt: "2025-06-22T13:25:00Z"
  },
  {
    callPipelineID: 3,
    callLogOrderID: 2,
    callDate: "2025-06-25",
    callStartTime: "16:30",
    callEndTime: "16:45",
    callStatus: "Completed",
    notes: "Provided financial options and payment plans. Client considering options.",
    createdAt: "2025-06-25T16:45:00Z"
  },
  {
    callPipelineID: 3,
    callLogOrderID: 3,
    callDate: "2025-06-29",
    callStartTime: "10:15",
    callEndTime: "10:45",
    callStatus: "Completed",
    notes: "Final negotiations. Client ready to proceed with purchase. Preparing contracts.",
    createdAt: "2025-06-29T10:45:00Z"
  },

  // Pipeline 4 - Single call attempt
  {
    callPipelineID: 4,
    callLogOrderID: 1,
    callDate: "2025-06-24",
    callStartTime: "12:00",
    callEndTime: "12:18",
    callStatus: "Completed",
    notes: "Initial inquiry about mountain view condos. Collecting requirements for follow-up.",
    createdAt: "2025-06-24T12:18:00Z"
  },

  // Pipeline 5 - Failed attempts
  {
    callPipelineID: 5,
    callLogOrderID: 1,
    callDate: "2025-06-20",
    callStartTime: "09:45",
    callEndTime: "",
    callStatus: "No Answer",
    notes: "No answer, will try again later.",
    createdAt: "2025-06-20T09:46:00Z"
  },
  {
    callPipelineID: 5,
    callLogOrderID: 2,
    callDate: "2025-06-23",
    callStartTime: "14:15",
    callEndTime: "",
    callStatus: "Busy",
    notes: "Line busy, will attempt contact tomorrow.",
    createdAt: "2025-06-23T14:16:00Z"
  },
  {
    callPipelineID: 5,
    callLogOrderID: 3,
    callDate: "2025-06-25",
    callStartTime: "11:30",
    callEndTime: "11:34",
    callStatus: "Completed",
    notes: "Brief call. Client not interested in harbor towers at this time.",
    createdAt: "2025-06-25T11:34:00Z"
  },

  // Pipeline 6 - Creative arts district follow-ups
  {
    callPipelineID: 6,
    callLogOrderID: 1,
    callDate: "2025-06-28",
    callStartTime: "16:00",
    callEndTime: "16:20",
    callStatus: "Completed",
    notes: "Discussed creative spaces and studio features. Client interested in artist community.",
    createdAt: "2025-06-28T16:20:00Z"
  },
  {
    callPipelineID: 6,
    callLogOrderID: 2,
    callDate: "2025-06-30",
    callStartTime: "10:30",
    callEndTime: "10:50",
    callStatus: "Completed",
    notes: "Arranged viewing of artist studios. Client excited about community amenities.",
    createdAt: "2025-06-30T10:50:00Z"
  },

  // Pipeline 7 - Tech park successful conversion
  {
    callPipelineID: 7,
    callLogOrderID: 1,
    callDate: "2025-06-18",
    callStartTime: "09:00",
    callEndTime: "09:30",
    callStatus: "Completed",
    notes: "Initial tech park presentation. Client very interested in modern facilities.",
    createdAt: "2025-06-18T09:30:00Z"
  },
  {
    callPipelineID: 7,
    callLogOrderID: 2,
    callDate: "2025-06-22",
    callStartTime: "14:00",
    callEndTime: "14:45",
    callStatus: "Completed",
    notes: "Detailed walkthrough of tech amenities. Client ready to make decision.",
    createdAt: "2025-06-22T14:45:00Z"
  },
  {
    callPipelineID: 7,
    callLogOrderID: 3,
    callDate: "2025-06-26",
    callStartTime: "11:00",
    callEndTime: "11:20",
    callStatus: "Completed",
    notes: "Finalized lease agreement. Client signed contract for tech park space.",
    createdAt: "2025-06-26T11:20:00Z"
  },
  {
    callPipelineID: 7,
    callLogOrderID: 4,
    callDate: "2025-06-30",
    callStartTime: "15:30",
    callEndTime: "15:40",
    callStatus: "Completed",
    notes: "Post-signing follow-up. Confirmed move-in date and next steps.",
    createdAt: "2025-06-30T15:40:00Z"
  },

  // Pipeline 8 - Medical center inquiry
  {
    callPipelineID: 8,
    callLogOrderID: 1,
    callDate: "2025-06-27",
    callStartTime: "13:30",
    callEndTime: "13:50",
    callStatus: "Completed",
    notes: "Healthcare facility requirements discussion. Client needs specialized medical spaces.",
    createdAt: "2025-06-27T13:50:00Z"
  },
  {
    callPipelineID: 8,
    callLogOrderID: 2,
    callDate: "2025-06-29",
    callStartTime: "10:00",
    callEndTime: "10:25",
    callStatus: "Completed",
    notes: "Reviewed medical compliance requirements. Preparing specialized proposal.",
    createdAt: "2025-06-29T10:25:00Z"
  },

  // Pipeline 9 - Single attempt, not interested
  {
    callPipelineID: 9,
    callLogOrderID: 1,
    callDate: "2025-06-26",
    callStartTime: "12:30",
    callEndTime: "12:35",
    callStatus: "Completed",
    notes: "Brief call. Client not currently interested in university heights properties.",
    createdAt: "2025-06-26T12:35:00Z"
  },

  // Pipeline 10 - Riverside gardens progression
  {
    callPipelineID: 10,
    callLogOrderID: 1,
    callDate: "2025-06-25",
    callStartTime: "15:00",
    callEndTime: "15:30",
    callStatus: "Completed",
    notes: "Riverside location discussion. Client loves waterfront properties.",
    createdAt: "2025-06-25T15:30:00Z"
  },
  {
    callPipelineID: 10,
    callLogOrderID: 2,
    callDate: "2025-06-28",
    callStartTime: "11:45",
    callEndTime: "12:15",
    callStatus: "Completed",
    notes: "Detailed pricing and river view options. Client comparing with other properties.",
    createdAt: "2025-06-28T12:15:00Z"
  },
  {
    callPipelineID: 10,
    callLogOrderID: 3,
    callDate: "2025-06-30",
    callStartTime: "14:20",
    callEndTime: "14:35",
    callStatus: "Completed",
    notes: "Final decision pending. Client will confirm by end of week.",
    createdAt: "2025-06-30T14:35:00Z"
  }
];
