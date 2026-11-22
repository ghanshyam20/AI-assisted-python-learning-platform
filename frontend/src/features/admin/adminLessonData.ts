/**
 * Represents a Python lesson displayed in the admin dashboard.
 * The backend will provide this data when API integration is added.
 */
export type AdminLesson = {
  id: number;
  title: string;
  chapter: string;
  status: "Published" | "Draft";
};

/**
 * Temporary sample lessons for frontend development.
 * These will be replaced with lessons from the Django API later.
 */
export const initialLessons: AdminLesson[] = [
  {
    id: 1,
    title: "Introduction to Variables",
    chapter: "Python Basics",
    status: "Published",
  },
  {
    id: 2,
    title: "Python Data Types",
    chapter: "Python Basics",
    status: "Draft",
  },
  {
    id: 3,
    title: "Input and Output",
    chapter: "Python Basics",
    status: "Draft",
  },
];
