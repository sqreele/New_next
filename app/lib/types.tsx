import { DateRange } from "react-day-picker";

// Profile-related types
export interface ProfileImage {
  profile_image: string;
  positions: string;
  username: string;
 
  properties: Property[];
}

// Job-related types
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'waiting_sparepart';
export type JobPriority = 'low' | 'medium' | 'high';

export interface JobImage {
  id: number;
  image_url: string; // Changed from image to image_url for clarity
  uploaded_by: number;
  uploaded_at: string;
}

export interface Topic {
  id?: number;
  title: string;
  description: string;
}

export interface Room {
  room_id: number;
  name: string;
  room_type: string;
  properties: string[];
  is_active: boolean;
  created_at: string;
  property: number;
}

export interface Job {
  job_id: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user: string;
  profile_image: ProfileImage | null;
  images: JobImage[];
  topics: Topic[];
  rooms: Room[];
  properties: number[];
  property_id: string;
  remarks: string;
  is_defective: boolean;
}

// Property-related types
export interface Property {
  id?: number;
  name: string;
  description: string;
  property_id: string;
  users: number[];
  created_at: string;
  rooms: Room[];
  properties: Property[];
 
}

// User-related types
export interface UserProfile {
  id: number;
  username: string;
  profile_image: string;
  positions: string;
  properties: Property[];
  email?: string | null;
  created_at: string;
 }

export interface UserContextType {
  userProfile: UserProfile | null;
  selectedProperty: string;
  setSelectedProperty: (propertyId: string) => void;
  loading: boolean;
}

// Component prop types
export interface JobCardProps {
  job: Job;
}

export interface JobListProps {
  jobs: Job[];
}

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export interface UserFilterProps {
  users: string[];
  selectedUser: string | null;
  onSelectUser: (user: string | null) => void;
}

// Filters and Sorting
export type TabValue = 'all' | 'waiting_sparepart' | 'pending' | 'completed' | 'cancelled' | 'defect';
export type SortOrder = 'Newest first' | 'Oldest first';

export interface FilterState {
  user: string | null;
  status: JobStatus | null;
  priority: JobPriority | null;
  topic: string | null;
  room: string | null;
  dateRange?: DateRange;
}

export interface SortState {
  field: 'created_at' | 'updated_at' | 'completed_at' | 'priority';
  direction: 'asc' | 'desc';
}

// API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export interface JobsApiResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
  filters: Partial<FilterState>;
}

export interface JobsPDFProps {
  jobs: Job[];
  filter: TabValue;
}

// Constants for UI
export const STATUS_COLORS: Record<JobStatus, string> = {
  pending: '#FFA500',
  waiting_sparepart: '#0000FF',
  completed: '#008000',
  cancelled: '#FF0000',
  in_progress: '#9B59B6',
};

export const FILTER_TITLES: Record<TabValue, string> = {
  all: 'All Jobs Report',
  waiting_sparepart: 'Active Jobs Report',
  pending: 'Pending Jobs Report',
  completed: 'Completed Jobs Report',
  cancelled: 'Cancelled Jobs Report',
  defect: 'Defective Jobs Report',
};

export const PRIORITY_COLORS: Record<JobPriority, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

 export interface TopicFromAPI {
  id: number;
  title: string;
  description: string;
}
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
 }
 
 export interface ErrorState {
  message: string;
  field?: string;
 }
 // Search types
export interface SearchResponse {
  jobs: Job[];
  properties: Property[];
}
