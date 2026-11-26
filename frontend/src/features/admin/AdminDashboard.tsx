import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, Library, BookOpen, Users } from "lucide-react";
import UserManagement from "./UserManagement";
import ChapterManager from "./ChapterManager";
import LessonManager from "./LessonManager";
import LessonPageManager from "./LessonPageManager";
import { adminApi, type Chapter, type Lesson } from "./adminApi";
import "./AdminDashboard.css";

// Keep navigation limited to supported admin sections.
type AdminSection = "overview" | "chapters" | "lessons" | "pages" | "users";

// Manage shared content data and dashboard navigation.
export default function AdminDashboard() {
  // Track the currently selected management section.
  // Restore the last selected section after a browser refresh.
  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    const saved = sessionStorage.getItem("pylearn-admin-section");

    if (
      saved === "overview" ||
      saved === "chapters" ||
      saved === "lessons" ||
      saved === "pages" ||
      saved === "users"
    ) {
      return saved;
    }

    return "overview";
  });

  // Remember navigation changes for this browser tab.
  useEffect(() => {
    sessionStorage.setItem("pylearn-admin-section", activeSection);
  }, [activeSection]);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep dashboard statistics and the lesson table synchronized with
  // the same database-backed response rather than separate local copies.
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [chapterData, lessonData] = await Promise.all([
        adminApi.chapters.list(),
        adminApi.lessons.list(),
      ]);

      setChapters(chapterData);
      setLessons(lessonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const publishedCount = lessons.filter((lesson) => lesson.published).length;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>PyLearn Admin</h2>
        {/* Switch sections without reloading dashboard data. */}
        <nav aria-label="Admin navigation">
          <button
            type="button"
            className={activeSection === "overview" ? "active" : ""}
            onClick={() => setActiveSection("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={activeSection === "chapters" ? "active" : ""}
            onClick={() => setActiveSection("chapters")}
          >
            <Library size={18} />
            <span>Chapters</span>
          </button>

          <button
            type="button"
            className={activeSection === "lessons" ? "active" : ""}
            onClick={() => setActiveSection("lessons")}
          >
            <BookOpen size={18} />
            <span>Lessons</span>
          </button>
          <button
            type="button"
            className={activeSection === "pages" ? "active" : ""}
            onClick={() => setActiveSection("pages")}
          >
            <BookOpen size={18} />
            <span>Lesson Pages</span>
          </button>
          {/* User Management navigation */}
          <button
            type="button"
            className={activeSection === "users" ? "active" : ""}
            onClick={() => setActiveSection("users")}
          >
            <Users size={18} />
            <span>User Management</span>
          </button>
        </nav>
        <p>Content Management</p>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your Python learning content.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadContent()}
            disabled={loading}
          >
            {loading ? "-" : "Refresh Content"}
          </button>
          <span className="admin-role">Administrator</span>
        </header>

        {/* Show content statistics on the overview page. */}
        <section
          id="overview"
          className="admin-stats"
          hidden={activeSection !== "overview"}
          style={activeSection !== "overview" ? { display: "none" } : undefined}
        >
          <div className="admin-stat-card">
            <span>Total Chapters</span>
            <strong>{loading ? "-" : chapters.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Total Lessons</span>
            <strong>{loading ? "-" : lessons.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Published</span>
            <strong>{loading ? "-" : publishedCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Drafts</span>
            <strong>{loading ? "-" : lessons.length - publishedCount}</strong>
          </div>
        </section>

        {error && (
          <div className="admin-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadContent()}>
              Try Again
            </button>
          </div>
        )}

        {/* Display chapter management in its own section. */}
        {activeSection === "chapters" && (
          <ChapterManager
            chapters={chapters}
            loading={loading}
            onRefresh={loadContent}
          />
        )}

        {/* Display lessons with their assigned chapters. */}
        {activeSection === "lessons" && (
          <LessonManager
            chapters={chapters}
            lessons={lessons}
            loading={loading}
            onRefresh={loadContent}
          />
        )}
        {activeSection === "pages" && <LessonPageManager lessons={lessons} />}
        {/* Render the user management page when selected. */}
        {activeSection === "users" && <UserManagement />}
      </main>
    </div>
  );
}
