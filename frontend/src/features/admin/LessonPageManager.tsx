import { useEffect, useState } from "react";
import { adminApi, type Lesson, type LessonPage } from "./adminApi";

type Props = {
  lessons: Lesson[];
};

export default function LessonPageManager({ lessons }: Props) {
  const [lessonId, setLessonId] = useState("");
  const [pages, setPages] = useState<LessonPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lessonId) {
      setPages([]);
      return;
    }

    let active = true;

    async function loadPages() {
      setLoading(true);
      setError("");

      try {
        const result = await adminApi.pages.list();

        if (active) {
          setPages(
            result
              .filter((page) => page.lesson === Number(lessonId))
              .sort((a, b) => a.position - b.position)
          );
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load pages.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPages();

    return () => {
      active = false;
    };
  }, [lessonId]);

  return (
    <section className="admin-content-section">
      <div className="admin-section-heading">
        <div>
          <h2>Lesson Pages</h2>
          <p>Select a lesson to view its pages.</p>
        </div>
      </div>

      <label htmlFor="admin-page-lesson">Choose lesson</label>
      <select
        id="admin-page-lesson"
        value={lessonId}
        onChange={(event) => setLessonId(event.target.value)}
      >
        <option value="">Select a lesson</option>
        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.title}
          </option>
        ))}
      </select>

      {loading && <p role="status">Loading pages...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && lessonId && (
        <div className="admin-page-list">
          {pages.length === 0 ? (
            <p>No pages found for this lesson.</p>
          ) : (
            pages.map((page) => (
              <article key={page.id} className="admin-page-card">
                <div>
                  <h3>{page.title}</h3>
                  <p>Page {page.position}</p>
                </div>
                <span>{page.published ? "Published" : "Draft"}</span>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
