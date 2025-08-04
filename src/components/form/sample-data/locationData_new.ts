// Location interface with required fields
export interface Location {
  location_id: string;
  location_name: string;
  location_description: string;
  is_active: boolean;
  created_date: string;
  // Address fields from address modal
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  homeAddress?: string;
  streetAddress?: string;
  // Additional fields for UI
  avatar?: string;
  properties?: number;
}

// Function to generate random created date
function getRandomCreatedDate(): string {
  const start = new Date(2018, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toLocaleDateString();
}

// Mock data for locations
export const locationData: Location[] = [
  {
    location_id: "LOC001",
    location_name: "Downtown Business District",
    location_description: "Prime commercial and residential area in the heart of the city with excellent infrastructure and accessibility.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-01.jpg",
    properties: 25,
    province: "Phnom Penh",
    district: "Chamkar Mon",
    commune: "Boeung Keng Kang 1",
    village: "Phum 1",
    homeAddress: "Street 240",
    streetAddress: "Building 15, Floor 5"
  },
  {
    location_id: "LOC002",
    location_name: "Riverside Gardens",
    location_description: "Luxury residential development along the river with beautiful views and modern amenities.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-02.jpg",
    properties: 18,
    province: "Siem Reap",
    district: "Siem Reap",
    commune: "Siem Reap",
    village: "Phum 2",
    homeAddress: "Riverside Road",
    streetAddress: "Garden Complex A"
  },
  {
    location_id: "LOC003",
    location_name: "Tech Hub Center",
    location_description: "Modern office complex designed for technology companies and startups with co-working spaces.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-03.jpg",
    properties: 12,
    province: "Battambang",
    district: "Battambang",
    commune: "Rattanak",
    village: "Phum 3",
    homeAddress: "Tech Street",
    streetAddress: "Innovation Building"
  },
  {
    location_id: "LOC004",
    location_name: "Cultural Heritage Site",
    location_description: "Historic area with traditional architecture and cultural significance for tourism development.",
    is_active: false,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-04.jpg",
    properties: 8,
    province: "Kampong Cham",
    district: "Kampong Cham",
    commune: "Kampong Cham",
    village: "Phum 4",
    homeAddress: "Heritage Lane",
    streetAddress: "Cultural Center"
  },
  {
    location_id: "LOC005",
    location_name: "Eco-Resort Valley",
    location_description: "Sustainable tourism development area with eco-friendly accommodations and natural attractions.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-05.jpg",
    properties: 15,
    province: "Phnom Penh",
    district: "Toul Kork",
    commune: "Boeung Kak 1",
    village: "Phum 5",
    homeAddress: "Eco Valley Road",
    streetAddress: "Resort Complex"
  },
  {
    location_id: "LOC006",
    location_name: "Industrial Park Zone",
    location_description: "Manufacturing and logistics hub with modern facilities and transportation infrastructure.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-06.jpg",
    properties: 20,
    province: "Preah Sihanouk",
    district: "Mittapheap",
    commune: "Ream",
    village: "Phum 6",
    homeAddress: "Industrial Road",
    streetAddress: "Factory Zone A"
  },
  {
    location_id: "LOC007",
    location_name: "Beachfront Resort Area",
    location_description: "Coastal development with luxury resorts and recreational facilities for international tourism.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-07.jpg",
    properties: 10,
    province: "Siem Reap",
    district: "Angkor Chum",
    commune: "Nokor Thum",
    village: "Phum 7",
    homeAddress: "Beach Boulevard",
    streetAddress: "Oceanview Resort"
  },
  {
    location_id: "LOC008",
    location_name: "Mountain Resort Development",
    location_description: "Highland area with cool climate and scenic views, ideal for eco-tourism and wellness retreats.",
    is_active: false,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-08.jpg",
    properties: 6,
    province: "Kampong Speu",
    district: "Chbar Mon",
    commune: "Damnak Reang",
    village: "Phum 8",
    homeAddress: "Mountain View Road",
    streetAddress: "Highland Resort"
  },
  {
    location_id: "LOC009",
    location_name: "Urban Mixed-Use Complex",
    location_description: "Contemporary development combining residential, commercial, and office spaces in prime location.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-09.jpg",
    properties: 30,
    province: "Phnom Penh",
    district: "Daun Penh",
    commune: "Phsar Thmei 1",
    village: "Phum 9",
    homeAddress: "Central Avenue",
    streetAddress: "Mixed-Use Tower"
  },
  {
    location_id: "LOC010",
    location_name: "Waterfront Community",
    location_description: "Exclusive residential community along the waterfront with marina and recreational facilities.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-10.jpg",
    properties: 14,
    province: "Kep",
    district: "Kep",
    commune: "Kep",
    village: "Phum 10",
    homeAddress: "Marina Road",
    streetAddress: "Waterfront Villa"
  },
  {
    location_id: "LOC011",
    location_name: "Business Park Campus",
    location_description: "Modern business park with office buildings, conference facilities, and corporate amenities.",
    is_active: true,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-11.jpg",
    properties: 22,
    province: "Phnom Penh",
    district: "Sen Sok",
    commune: "Phnom Penh Thmei",
    village: "Phum 11",
    homeAddress: "Business Park Road",
    streetAddress: "Corporate Center"
  },
  {
    location_id: "LOC012",
    location_name: "Historic Town Center",
    location_description: "Preserved colonial architecture area with boutique shops, cafes, and cultural attractions.",
    is_active: false,
    created_date: getRandomCreatedDate(),
    avatar: "/images/user/user-12.jpg",
    properties: 9,
    province: "Kampot",
    district: "Kampot",
    commune: "Kampot",
    village: "Phum 12",
    homeAddress: "Historic Main Street",
    streetAddress: "Colonial Building"
  }
];
