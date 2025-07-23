export interface CourseOption {
  label: string;
  value: string;
}

export interface LocationOption {
  label: string;
  value: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  courseTag?: string;
  author: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  upvoteCount: number;
}

export interface UserProfile {
  favourites: string[];
  firstName: string;
  lastName: string;
  profilePicture?: string;
  ratings?: number;
  QR: string;
  email: string;
  major: string;
  teachingMode: string;
  budgetCap: number;
}

export interface UpvoteStatus {
  upvoteCount: number;
  hasUpvoted: boolean;
}

export interface Class {
  id: string;
  course: string;
  date: number;
  role: string;
  startTime: string;
  endTime: string;
  people: string;
  rate: string;
  status: string;
  paymentProof: string;
  updatedAt: string;
  profileId: string;
  createdAt: string;
  endedAt: string;
}

export interface Tutor {
  id: string;
  tutor: string;
  course: string;
  location: string;
  description: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  rate: number;
  booked: boolean;
}

export interface Session {
  tutor: string;
  course: string;
  description: string;
  location: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  rate: number;
  profileId: string;
}

export interface Day {
  label: string;
  value: number;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  upvoteCount: number;
}

export interface Review {
  id: string;
  student: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Favourite {
  session: string;
}

export interface FAQ {
  title: string;
  ans: string;
}
