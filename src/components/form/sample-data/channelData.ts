// Channel interface with required fields
export interface ChannelType {
  channel_type_id: string;
  channel_type_name: string;
  channel_type_description: string;
  is_active: boolean;
  created_date: string;
  updated_date: string;
  status: 'Active' | 'Inactive' | 'Pending';
  // Additional fields for UI
  icon?: string;
  properties?: number;
  category?: string;
}

// Function to generate random created date
function getRandomCreatedDate(): string {
  const start = new Date(2018, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toLocaleDateString();
}

// Function to generate random updated date (after created date)
function getRandomUpdatedDate(): string {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toLocaleDateString();
}

// Function to get random status
function getRandomStatus(): 'Active' | 'Inactive' | 'Pending' {
  const statuses: ('Active' | 'Inactive' | 'Pending')[] = ['Active', 'Inactive', 'Pending'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Mock data for channels
export const channelData: ChannelType[] = [
  {
    channel_type_id: "CH001",
    channel_type_name: "Instagram",
    channel_type_description: "create instagram",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-01.jpg",
    properties: 0,
    category: "Social Media"
  },
  {
    channel_type_id: "CH002",
    channel_type_name: "Facebook",
    channel_type_description: "create facebook",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-02.jpg",
    properties: 2,
    category: "Social Media"
  },
  {
    channel_type_id: "CH003",
    channel_type_name: "Telegram",
    channel_type_description: "create telegram",
    is_active: false,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-03.jpg",
    properties: 1,
    category: "Messaging"
  },
  {
    channel_type_id: "CH004",
    channel_type_name: "WhatsApp",
    channel_type_description: "create whatsapp",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-04.jpg",
    properties: 3,
    category: "Messaging"
  },
  {
    channel_type_id: "CH005",
    channel_type_name: "Line",
    channel_type_description: "create line",
    is_active: false,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-05.jpg",
    properties: 0,
    category: "Messaging"
  },
  {
    channel_type_id: "CH006",
    channel_type_name: "WeChat",
    channel_type_description: "create wechat",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-06.jpg",
    properties: 2,
    category: "Messaging"
  },
  {
    channel_type_id: "CH007",
    channel_type_name: "Viber",
    channel_type_description: "create viber",
    is_active: false,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-07.jpg",
    properties: 1,
    category: "Messaging"
  },
  {
    channel_type_id: "CH008",
    channel_type_name: "Twitter",
    channel_type_description: "create twitter",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-08.jpg",
    properties: 4,
    category: "Social Media"
  },
  {
    channel_type_id: "CH009",
    channel_type_name: "YouTube",
    channel_type_description: "create youtube",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-09.jpg",
    properties: 5,
    category: "Video"
  },
  {
    channel_type_id: "CH010",
    channel_type_name: "TikTok",
    channel_type_description: "create tiktok",
    is_active: false,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-10.jpg",
    properties: 2,
    category: "Video"
  },
  {
    channel_type_id: "CH011",
    channel_type_name: "Snapchat",
    channel_type_description: "create snapchat",
    is_active: true,
    created_date: getRandomCreatedDate(),
    updated_date: getRandomUpdatedDate(),
    status: getRandomStatus(),
    icon: "/images/user/user-11.jpg",
    properties: 1,
    category: "Social Media"
  }
];
