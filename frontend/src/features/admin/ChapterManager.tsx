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

  // Keep editing separate from chapter creation so unsaved changes
  // cannot accidentally modify another chapter.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPosition, setEditPosition] = useState(0);

  function startEditing(chapter: Chapter) {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
    setEditDescription(chapter.description);
    setEditPosition(chapter.position);
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function saveChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null || saving) return;

    if (!editTitle.trim() || !Number.isInteger(editPosition) || editPosition < 0) {
      setError("Enter a chapter title and a valid position.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // PATCH updates only the fields being edited and preserves
      // the chapter's existing publication status.
      await adminApi.chapters.update(editingId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        position: editPosition,
      });

      setEditingId(null);
      await onRefresh();
      setSuccess("Chapter updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update chapter."
      );
    } finally {
      setSaving(false);
    }
  }

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

      {editingId !== null && (
        <form className="admin-edit-form" onSubmit={saveChapter}>
          <h3>Edit Chapter</h3>

          <label htmlFor="edit-chapter-title">Chapter title</label>
          <input
            id="edit-chapter-title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            disabled={saving}
            required
          />

          <label htmlFor="edit-chapter-description">Description</label>
          <textarea
            id="edit-chapter-description"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            disabled={saving}
            rows={3}
          />

          <label htmlFor="edit-chapter-position">Position</label>
          <input
            id="edit-chapter-position"
            type="number"
            min="0"
            step="1"
            value={editPosition}
            onChange={(event) => setEditPosition(Number(event.target.value))}
            disabled={saving}
            required
          />

          <div className="admin-edit-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={cancelEditing} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading chapters...</td>
              </tr>
            ) : chapters.length === 0 ? (
              <tr>
                <td colSpan={4}>No chapters created yet.</td>
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
                  <td>
                    <button
                      type="button"
                      onClick={() => startEditing(chapter)}
                      disabled={saving}
                    >
                      Edit
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
