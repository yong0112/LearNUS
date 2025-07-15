export interface CourseOption {
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
  firstName: string;
  lastName: string;
  profilePicture?: string;
  ratings?: number;
}

export interface UpvoteStatus {
  upvoteCount: number;
  hasUpvoted: boolean;
}

export interface Class {
    id: string;
    course: string;
    startTime: string;
    endTime: string;
    date: number; 
}

export interface Tutor {
  id: string;
  tutor: string; 
  course: string;
  location: string;
  description: string;
  availability: string;
  rate: number;
}