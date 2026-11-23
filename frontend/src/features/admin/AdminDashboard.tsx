import { useCallback, useEffect, useState } from "react";
import ChapterManager from "./ChapterManager";
import LessonManager from "./LessonManager";
import { adminApi, type Chapter, type Lesson } from "./adminApi";
import "./AdminDashboard.css";

export default function AdminDashboard() {
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
      setError(
        err instanceof Error ? err.message : "Unable to load content."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const publishedCount = lessons.filter(
    (lesson) => lesson.published
  ).length;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>PyLearn Admin</h2>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#chapters">Chapters</a>
          <a href="#lessons">Lessons</a>
        </nav>
        <p>Content Management</p>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your Python learning content.</p>
          </div>
                    <button type="button" onClick={() => void loadContent()} disabled={loading}>{loading ? "Refreshing..." : "Refresh Content"}</button>
<span className="admin-role">Administrator</span>
        </header>

        <section id="overview" className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Lessons</span>
            <strong>{loading ? "—" : lessons.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Published</span>
            <strong>{loading ? "—" : publishedCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Drafts</span>
            <strong>
              {loading ? "—" : lessons.length - publishedCount}
            </strong>
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

        <ChapterManager
          chapters={chapters}
          loading={loading}
          onRefresh={loadContent}
        />

        <LessonManager
          chapters={chapters}
          lessons={lessons}
          loading={loading}
          onRefresh={loadContent}
        />
      </main>
    </div>
  );
}
