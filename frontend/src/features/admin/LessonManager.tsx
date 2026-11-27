import { useState, type FormEvent } from "react";
import { adminApi, type Chapter, type Lesson } from "./adminApi";

type LessonManagerProps = {
  chapters: Chapter[];
  lessons: Lesson[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

export default function LessonManager({
  chapters,
  lessons,
  loading,
  onRefresh,
}: LessonManagerProps) {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const filteredLessons = lessons.filter((lesson) =>
    `${lesson.title} ${lesson.chapter_title}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !chapterId) {
      setFormError("Enter a lesson title and select a chapter.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess("");

    try {
      // New lessons are always drafts. Publication will be handled by
      // a separate validated workflow once page editing is complete.
      await adminApi.lessons.create({
        title: title.trim(),
        chapter: Number(chapterId),
        published: false,
      });

      setTitle("");
      setChapterId("");
      setSuccess("Draft lesson created successfully.");

      await onRefresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to create lesson."
      );
    } finally {
      setSaving(false);
    }
  }


  // Update publication status through the existing admin API.
  // Django remains responsible for checking staff permissions.
  async function togglePublish(lesson: Lesson) {
    setPublishingId(lesson.id);
    setFormError("");
    setSuccess("");

    try {
      await adminApi.lessons.update(lesson.id, {
        published: !lesson.published,
      });

      await onRefresh();

      setSuccess(
        lesson.published
          ? "Lesson unpublished successfully."
          : "Lesson published successfully."
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to update lesson publication status."
      );
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <section id="lessons" className="admin-lessons">
      <div className="admin-section-heading">
        <h2>Lesson Management</h2>
        <span>Database connected</span>
      </div>

      <form onSubmit={createLesson}>
        <h3>Create Draft Lesson</h3>

        <input
          type="text"
          placeholder="Lesson title"
          aria-label="Lesson title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={saving || loading}
          required
        />

        <select
          aria-label="Select chapter"
          value={chapterId}
          onChange={(event) => setChapterId(event.target.value)}
          disabled={saving || loading || chapters.length === 0}
          required
        >
          <option value="">Select a chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
              {!chapter.published ? " (Draft)" : ""}
            </option>
          ))}
        </select>

        {chapters.length === 0 && !loading && (
          <p>No chapters available. Create a chapter first.</p>
        )}

        <button
          type="submit"
          disabled={saving || loading || chapters.length === 0}
        >
          {saving ? "Saving..." : "Create Lesson"}
        </button>

        {formError && <p role="alert" className="admin-error-text">{formError}</p>}
        {success && <p role="status" className="admin-success-text">{success}</p>}
      </form>

      <input
        type="search"
        placeholder="Search lessons..."
        aria-label="Search lessons"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {/* Publication feedback is visible even below the search field. */}
      {formError && <p role="alert" className="admin-error-text">{formError}</p>}
      {success && <p role="status" className="admin-success-text">{success}</p>}

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Chapter</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading lessons...</td>
              </tr>
            ) : filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  {lessons.length === 0
                    ? "No lessons created yet."
                    : "No matching lessons found."}
                </td>
              </tr>
            ) : (
              filteredLessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td>{lesson.title}</td>
                  <td>{lesson.chapter_title}</td>
                  <td>
                    <span
                      className={`admin-status ${
                        lesson.published ? "published" : "draft"
                      }`}
                    >
                      {lesson.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    {/* Toggle publication without changing lesson content. */}
                    <button
                      type="button"
                      className="admin-action admin-action-edit"
                      disabled={publishingId !== null || loading}
                      onClick={() => void togglePublish(lesson)}
                    >
                      {publishingId === lesson.id
                        ? "Saving..."
                        : lesson.published
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
