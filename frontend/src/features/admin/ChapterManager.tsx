import { useState, type FormEvent } from "react";
import { adminApi, type Chapter } from "./adminApi";

type ChapterManagerProps = {
  chapters: Chapter[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

export default function ChapterManager({
  chapters,
  loading,
  onRefresh,
}: ChapterManagerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function createChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Chapter title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Chapters start unpublished so incomplete course structures
      // never become visible to students accidentally.
      await adminApi.chapters.create({
        title: title.trim(),
        description: description.trim(),
        position: chapters.length + 1,
        published: false,
      });

      setTitle("");
      setDescription("");
      setSuccess("Draft chapter created successfully.");

      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create chapter."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="chapters" className="admin-lessons admin-chapters">
      <div className="admin-section-heading">
        <h2>Chapter Management</h2>
        <span>{chapters.length} chapters</span>
      </div>

      <form onSubmit={createChapter}>
        <h3>Create Draft Chapter</h3>

        <input
          type="text"
          placeholder="Chapter title"
          aria-label="Chapter title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={saving || loading}
          required
        />

        <textarea
          placeholder="Chapter description (optional)"
          aria-label="Chapter description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={saving || loading}
          rows={3}
        />

        <button type="submit" disabled={saving || loading}>
          {saving ? "Saving..." : "Create Chapter"}
        </button>

        {error && <p role="alert" className="admin-error-text">{error}</p>}
        {success && <p role="status" className="admin-success-text">{success}</p>}
      </form>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Position</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3}>Loading chapters...</td>
              </tr>
            ) : chapters.length === 0 ? (
              <tr>
                <td colSpan={3}>No chapters created yet.</td>
              </tr>
            ) : (
              chapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td>{chapter.title}</td>
                  <td>{chapter.position}</td>
                  <td>
                    <span
                      className={`admin-status ${
                        chapter.published ? "published" : "draft"
                      }`}
                    >
                      {chapter.published ? "Published" : "Draft"}
                    </span>
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
