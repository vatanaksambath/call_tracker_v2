// Developer interface with required fields
export interface Developer {
  developer_id: string;
  developer_name: string;
  developer_description: string;
  is_active: boolean;
  created_date: string;
  // Additional fields for UI
  avatar?: string;
  projects?: number;
  location?: string;
}

// Function to generate random created date
function getRandomCreatedDate(): string {
  const start = new Date(2018, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toLocaleDateString();
}

// Mock data for developers
export const developerData: Developer[] = [
  {
    developer_id: "DEV001",
    developer_name: "Sunset Properties Ltd.",
    developer_description: "Leading residential developer specializing in luxury condominiums and modern townhouses in prime locations.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-01.jpg",
    projects: 12,
    location: "Phnom Penh"
  },
  {
    developer_id: "DEV002",
    developer_name: "Golden Tower Development",
    developer_description: "Commercial and mixed-use property developer with focus on high-rise buildings and shopping complexes.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-02.jpg",
    projects: 8,
    location: "Siem Reap"
  },
  {
    developer_id: "DEV003",
    developer_name: "Green Valley Homes",
    developer_description: "Eco-friendly residential developer creating sustainable housing solutions with modern amenities.",
    is_active: false,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-03.jpg",
    projects: 5,
    location: "Battambang"
  },
  {
    developer_id: "DEV004",
    developer_name: "Metropolitan Builders",
    developer_description: "Urban development company specializing in office buildings, residential towers, and infrastructure projects.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-04.jpg",
    projects: 15,
    location: "Phnom Penh"
  },
  {
    developer_id: "DEV005",
    developer_name: "Riverside Developments",
    developer_description: "Waterfront property specialist developing luxury resorts, hotels, and residential communities along rivers and lakes.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-05.jpg",
    projects: 7,
    location: "Kampot"
  },
  {
    developer_id: "DEV006",
    developer_name: "Heritage Construction Co.",
    developer_description: "Traditional and modern construction company with expertise in both heritage restoration and new developments.",
    is_active: false,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-06.jpg",
    projects: 3,
    location: "Siem Reap"
  },
  {
    developer_id: "DEV007",
    developer_name: "Smart City Developers",
    developer_description: "Innovative developer focusing on smart technology integration in residential and commercial properties.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-07.jpg",
    projects: 9,
    location: "Phnom Penh"
  },
  {
    developer_id: "DEV008",
    developer_name: "Coastal Resort Group",
    developer_description: "Beach and coastal property developer specializing in vacation homes, resorts, and hospitality infrastructure.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-08.jpg",
    projects: 6,
    location: "Sihanoukville"
  },
  {
    developer_id: "DEV009",
    developer_name: "Urban Living Solutions",
    developer_description: "Affordable housing developer creating modern, accessible living spaces for middle-income families.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-09.jpg",
    projects: 11,
    location: "Kandal"
  },
  {
    developer_id: "DEV010",
    developer_name: "Elite Properties International",
    developer_description: "High-end luxury developer specializing in premium residential and commercial properties for international clientele.",
    is_active: false,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-10.jpg",
    projects: 4,
    location: "Phnom Penh"
  },
  {
    developer_id: "DEV011",
    developer_name: "Mekong Valley Estates",
    developer_description: "Rural and suburban property developer focusing on family homes and community developments.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-11.jpg",
    projects: 13,
    location: "Kratie"
  },
  {
    developer_id: "DEV012",
    developer_name: "Capital Heights Development",
    developer_description: "Premium high-rise developer specializing in luxury apartments and penthouses in urban centers.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-12.jpg",
    projects: 18,
    location: "Phnom Penh"
  }
];
