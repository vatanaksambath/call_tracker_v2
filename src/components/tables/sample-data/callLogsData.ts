export interface CallLog {
  call_log_id: string;
  created_by_name: string;
  created_date: string;
  fail_reason: string | null;
  follow_up_date: string;
  is_active: boolean;
  is_follow_up: boolean;
  last_update: string;
  lead_id: string;
  lead_name: string;
  property_profile_id: number;
  property_profile_name: string | null;
  purpose: string;
  status_id: number;
  total_call: number;
  total_site_visit: number;
  updated_by_name: string;
}

// Mock data for call logs - used for development and testing
export const callLogsData: CallLog[] = [
  {
    id: 1,
    caller: {
      image: "/images/user/user-17.jpg",
      name: "John Smith",
      phone: "+1 234-567-8901",
    },
    lead: {
      name: "Sarah Johnson",
      company: "Tech Solutions Inc.",
    },
    Property: {
      name: "Sunset Boulevard Apartments",
      Location: "Los Angeles"
    },
    number_of_call: 5,
    number_of_site_visit: 2,
    last_status: "Interested",
    last_status_date: "2025-06-30",
    followUpRequired: true,
    followupDate: "2025-07-02",
    register_date: "2025-06-15",
  },
  {
    id: 2,
    caller: {
      image: "/images/user/user-18.jpg",
      name: "Mike Wilson",
      phone: "+1 234-567-8902",
    },
    lead: {
      name: "David Brown",
      company: "Marketing Corp",
    },
    Property: {
      name: "Downtown Business Center",
      Location: "New York"
    },
    number_of_call: 3,
    number_of_site_visit: 1,
    last_status: "Hot Lead",
    last_status_date: "2025-06-28",
    followUpRequired: true,
    followupDate: "2025-07-01",
    register_date: "2025-06-20",
  },
  {
    id: 3,
    caller: {
      image: "/images/user/user-19.jpg",
      name: "Lisa Davis",
      phone: "+1 234-567-8903",
    },
    lead: {
      name: "Emma Wilson",
      company: "Media Solutions",
    },
    Property: {
      name: "Lakeside Villas",
      Location: "Miami"
    },
    number_of_call: 7,
    number_of_site_visit: 3,
    last_status: "In Progress",
    last_status_date: "2025-06-29",
    followUpRequired: true,
    followupDate: "2025-07-03",
    register_date: "2025-06-10",
  },
  {
    id: 4,
    caller: {
      image: "/images/user/user-20.jpg",
      name: "Alex Thompson",
      phone: "+1 234-567-8904",
    },
    lead: {
      name: "Robert Taylor",
      company: "Finance Group",
    },
    Property: {
      name: "Mountain View Condos",
      Location: "Denver"
    },
    number_of_call: 2,
    number_of_site_visit: 1,
    last_status: "Follow Up",
    last_status_date: "2025-06-27",
    followUpRequired: true,
    followupDate: "2025-07-05",
    register_date: "2025-06-22",
  },
  {
    id: 5,
    caller: {
      image: "/images/user/user-21.jpg",
      name: "Jennifer Lee",
      phone: "+1 234-567-8905",
    },
    lead: {
      name: "Michael Davis",
      company: "Consulting Inc",
    },
    Property: {
      name: "Harbor Point Towers",
      Location: "Seattle"
    },
    number_of_call: 4,
    number_of_site_visit: 0,
    last_status: "Cold Lead",
    last_status_date: "2025-06-25",
    followUpRequired: false,
    followupDate: "2025-07-10",
    register_date: "2025-06-18",
  },
  {
    id: 6,
    caller: {
      image: "/images/user/user-22.jpg",
      name: "Rachel Green",
      phone: "+1 234-567-8906",
    },
    lead: {
      name: "James Miller",
      company: "Design Studio",
    },
    Property: {
      name: "Creative Arts District",
      Location: "Austin"
    },
    number_of_call: 6,
    number_of_site_visit: 2,
    last_status: "Interested",
    last_status_date: "2025-06-30",
    followUpRequired: true,
    followupDate: "2025-07-04",
    register_date: "2025-06-12",
  },
  {
    id: 7,
    caller: {
      image: "/images/user/user-23.jpg",
      name: "Tom Anderson",
      phone: "+1 234-567-8907",
    },
    lead: {
      name: "Lisa Parker",
      company: "Software Solutions",
    },
    Property: {
      name: "Tech Park Plaza",
      Location: "San Francisco"
    },
    number_of_call: 8,
    number_of_site_visit: 4,
    last_status: "Closed Won",
    last_status_date: "2025-06-30",
    followUpRequired: false,
    followupDate: "2025-07-15",
    register_date: "2025-06-05",
  },
  {
    id: 8,
    caller: {
      image: "/images/user/user-24.jpg",
      name: "Sarah Mitchell",
      phone: "+1 234-567-8908",
    },
    lead: {
      name: "Kevin White",
      company: "Health Services",
    },
    Property: {
      name: "Medical Center Complex",
      Location: "Chicago"
    },
    number_of_call: 3,
    number_of_site_visit: 1,
    last_status: "Hot Lead",
    last_status_date: "2025-06-29",
    followUpRequired: true,
    followupDate: "2025-07-01",
    register_date: "2025-06-24",
  },
  {
    id: 9,
    caller: {
      image: "/images/user/user-25.jpg",
      name: "Mark Stevens",
      phone: "+1 234-567-8909",
    },
    lead: {
      name: "Amanda Clark",
      company: "Education Services",
    },
    Property: {
      name: "University Heights",
      Location: "Boston"
    },
    number_of_call: 1,
    number_of_site_visit: 0,
    last_status: "Not Interested",
    last_status_date: "2025-06-26",
    followUpRequired: false,
    followupDate: "2025-08-01",
    register_date: "2025-06-25",
  },
  {
    id: 10,
    caller: {
      image: "/images/user/user-26.jpg",
      name: "Emily Carter",
      phone: "+1 234-567-8910",
    },
    lead: {
      name: "Daniel Lewis",
      company: "Real Estate Group",
    },
    Property: {
      name: "Riverside Gardens",
      Location: "Portland"
    },
    number_of_call: 5,
    number_of_site_visit: 3,
    last_status: "Interested",
    last_status_date: "2025-06-30",
    followUpRequired: true,
    followupDate: "2025-07-02",
    register_date: "2025-06-14",
  },
  {
    id: 11,
    caller: {
      image: "/images/user/user-27.jpg",
      name: "Chris Martinez",
      phone: "+1 234-567-8911",
    },
    lead: {
      name: "Sophie Anderson",
      company: "Creative Agency",
    },
    Property: {
      name: "Artisan Quarter",
      Location: "Nashville"
    },
    number_of_call: 9,
    number_of_site_visit: 2,
    last_status: "In Progress",
    last_status_date: "2025-06-29",
    followUpRequired: true,
    followupDate: "2025-07-03",
    register_date: "2025-06-08",
  },
  {
    id: 12,
    caller: {
      image: "/images/user/user-28.jpg",
      name: "Anna Williams",
      phone: "+1 234-567-8912",
    },
    lead: {
      name: "Tyler Scott",
      company: "Technology Firm",
    },
    Property: {
      name: "Innovation Hub",
      Location: "San Jose"
    },
    number_of_call: 4,
    number_of_site_visit: 1,
    last_status: "Follow Up",
    last_status_date: "2025-06-28",
    followUpRequired: true,
    followupDate: "2025-07-05",
    register_date: "2025-06-21",
  },
  {
    id: 13,
    caller: {
      image: "/images/user/user-29.jpg",
      name: "Kevin Rodriguez",
      phone: "+1 234-567-8913",
    },
    lead: {
      name: "Maria Garcia",
      company: "Legal Services",
    },
    Property: {
      name: "Justice Plaza",
      Location: "Phoenix"
    },
    number_of_call: 2,
    number_of_site_visit: 0,
    last_status: "Cold Lead",
    last_status_date: "2025-06-24",
    followUpRequired: false,
    followupDate: "2025-07-20",
    register_date: "2025-06-19",
  },
  {
    id: 14,
    caller: {
      image: "/images/user/user-30.jpg",
      name: "Jessica Brown",
      phone: "+1 234-567-8914",
    },
    lead: {
      name: "Paul Johnson",
      company: "Manufacturing Co",
    },
    Property: {
      name: "Industrial Park West",
      Location: "Detroit"
    },
    number_of_call: 6,
    number_of_site_visit: 2,
    last_status: "Hot Lead",
    last_status_date: "2025-06-30",
    followUpRequired: true,
    followupDate: "2025-07-01",
    register_date: "2025-06-16",
  },
  {
    id: 15,
    caller: {
      image: "/images/user/user-31.jpg",
      name: "Ryan Taylor",
      phone: "+1 234-567-8915",
    },
    lead: {
      name: "Linda Martinez",
      company: "Retail Chain",
    },
    Property: {
      name: "Shopping District Central",
      Location: "Atlanta"
    },
    number_of_call: 7,
    number_of_site_visit: 4,
    last_status: "Closed Won",
    last_status_date: "2025-06-30",
    followUpRequired: false,
    followupDate: "2025-07-12",
    register_date: "2025-06-07",
  },
  {
    id: 16,
    caller: {
      image: "/images/user/user-32.jpg",
      name: "Michelle Davis",
      phone: "+1 234-567-8916",
    },
    lead: {
      name: "Andrew Wilson",
      company: "Logistics Group",
    },
    Property: {
      name: "Transport Hub Complex",
      Location: "Dallas"
    },
    number_of_call: 3,
    number_of_site_visit: 1,
    last_status: "Interested",
    last_status_date: "2025-06-29",
    followUpRequired: true,
    followupDate: "2025-07-04",
    register_date: "2025-06-23",
  },
  {
    id: 17,
    caller: {
      image: "/images/user/user-33.jpg",
      name: "Brandon Lee",
      phone: "+1 234-567-8917",
    },
    lead: {
      name: "Rachel Thompson",
      company: "Insurance Services",
    },
    Property: {
      name: "Financial District Tower",
      Location: "Houston"
    },
    number_of_call: 5,
    number_of_site_visit: 2,
    last_status: "In Progress",
    last_status_date: "2025-06-28",
    followUpRequired: true,
    followupDate: "2025-07-02",
    register_date: "2025-06-17",
  },
  {
    id: 18,
    caller: {
      image: "/images/user/user-34.jpg",
      name: "Nicole White",
      phone: "+1 234-567-8918",
    },
    lead: {
      name: "Steven Clark",
      company: "Energy Solutions",
    },
    Property: {
      name: "Green Energy Campus",
      Location: "Sacramento"
    },
    number_of_call: 4,
    number_of_site_visit: 3,
    last_status: "Hot Lead",
    last_status_date: "2025-06-30",
    followUpRequired: true,
    followupDate: "2025-07-01",
    register_date: "2025-06-26",
  },
  {
    id: 19,
    caller: {
      image: "/images/user/user-35.jpg",
      name: "Jonathan Miller",
      phone: "+1 234-567-8919",
    },
    lead: {
      name: "Catherine Lewis",
      company: "Food Services",
    },
    Property: {
      name: "Culinary Arts Center",
      Location: "New Orleans"
    },
    number_of_call: 8,
    number_of_site_visit: 1,
    last_status: "Follow Up",
    last_status_date: "2025-06-27",
    followUpRequired: true,
    followupDate: "2025-07-06",
    register_date: "2025-06-11",
  },
  {
    id: 20,
    caller: {
      image: "/images/user/user-36.jpg",
      name: "Stephanie Garcia",
      phone: "+1 234-567-8920",
    },
    lead: {
      name: "Benjamin Harris",
      company: "Transportation Inc",
    },
    Property: {
      name: "Metro Station Plaza",
      Location: "Philadelphia"
    },
    number_of_call: 2,
    number_of_site_visit: 0,
    last_status: "Not Interested",
    last_status_date: "2025-06-25",
    followUpRequired: false,
    followupDate: "2025-08-15",
    register_date: "2025-06-24",
  },
  {
    id: 21,
    caller: {
      image: "/images/user/user-37.jpg",
      name: "Andrew Foster",
      phone: "+1 234-567-8921",
    },
    lead: {
      name: "Victoria Moore",
      company: "Hospitality Group",
    },
    Property: {
      name: "Luxury Resort Villas",
      Location: "Orlando"
    },
    number_of_call: 6,
    number_of_site_visit: 3,
    last_status: "Interested",
    last_status_date: "2025-06-30",
    followUpRequired: true,
    followupDate: "2025-07-03",
    register_date: "2025-06-13",
  },
  {
    id: 22,
    caller: {
      image: "/images/user/user-38.jpg",
      name: "Diana Cooper",
      phone: "+1 234-567-8922",
    },
    lead: {
      name: "Gregory Adams",
      company: "Sports Management",
    },
    Property: {
      name: "Athletic Training Complex",
      Location: "Charlotte"
    },
    number_of_call: 9,
    number_of_site_visit: 5,
    last_status: "Closed Won",
    last_status_date: "2025-06-29",
    followUpRequired: false,
    followupDate: "2025-07-10",
    register_date: "2025-06-06",
  },
  {
    id: 23,
    caller: {
      image: "/images/user/user-39.jpg",
      name: "Marcus Bell",
      phone: "+1 234-567-8923",
    },
    lead: {
      name: "Angela Rivera",
      company: "Entertainment Corp",
    },
    Property: {
      name: "Theater District Lofts",
      Location: "Las Vegas"
    },
    number_of_call: 4,
    number_of_site_visit: 2,
    last_status: "Hot Lead",
    last_status_date: "2025-06-28",
    followUpRequired: true,
    followupDate: "2025-07-02",
    register_date: "2025-06-25",
  },
  {
    id: 24,
    caller: {
      image: "/images/user/user-40.jpg",
      name: "Samantha Price",
      phone: "+1 234-567-8924",
    },
    lead: {
      name: "Richard Collins",
      company: "Investment Firm",
    },
    Property: {
      name: "Capital Square Offices",
      Location: "Washington DC"
    },
    number_of_call: 12,
    number_of_site_visit: 6,
    last_status: "Closed Lost",
    last_status_date: "2025-06-26",
    followUpRequired: false,
    followupDate: "2025-09-01",
    register_date: "2025-06-01",
  },
];
