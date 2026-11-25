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
  // Store the new page details and track the save request.
  const [newTitle, setNewTitle] = useState("");
  const [newPosition, setNewPosition] = useState(1);
  const [newPublished, setNewPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  // Keep the selected page and its editable values in component state.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPosition, setEditPosition] = useState(1);
  const [editPublished, setEditPublished] = useState(false);
  const [updating, setUpdating] = useState(false);



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

  // Create a page for the selected lesson using the existing admin API.
  async function handleCreatePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTitle.trim();
    if (!lessonId || !title || !Number.isInteger(newPosition) || newPosition < 1) {
      setError("Choose a lesson and enter a valid title and position.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const created = await adminApi.pages.create({
        lesson: Number(lessonId),
        title,
        position: newPosition,
        published: newPublished,
      });

      // Keep the visible list sorted without requesting all pages again.
      setPages((current) =>
        [...current, created].sort((a, b) => a.position - b.position)
      );

      setNewTitle("");
      setNewPosition(1);
      setNewPublished(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create page.");
    } finally {
      setSaving(false);
    }
  }



  // Delete a page only after the administrator confirms the action.
  async function handleDeletePage(page: LessonPage) {
    const confirmed = window.confirm(
      `Delete "${page.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    try {
      // Reuse the existing Django management API.
      await adminApi.pages.remove(page.id);

      // Remove the deleted page from the visible list.
      setPages((current) => current.filter((item) => item.id !== page.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete page.");
    }
  }

  // Load the selected page's current values into the edit form.
  function handleStartEdit(page: LessonPage) {
    setEditingId(page.id);
    setEditTitle(page.title);
    setEditPosition(page.position);
    setEditPublished(page.published);
    setError("");
  }

  // Close the edit form without changing the saved page.
  function handleCancelEdit() {
    setEditingId(null);
  }

  // Save page changes through the existing Django management API.
  async function handleUpdatePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null || !editTitle.trim()) {
      setError("Please enter a page title.");
      return;
    }

    if (!Number.isInteger(editPosition) || editPosition < 1) {
      setError("Page position must be a positive whole number.");
      return;
    }

    setUpdating(true);
    setError("");

    try {
      const updated = await adminApi.pages.update(editingId, {
        title: editTitle.trim(),
        position: editPosition,
        published: editPublished,
      });

      // Update the existing list without requiring a page reload.
      setPages((current) =>
        current
          .map((page) => (page.id === updated.id ? updated : page))
          .sort((a, b) => a.position - b.position)
      );

      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update page.");
    } finally {
      setUpdating(false);
    }
  }

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

      {/* Create a page inside the currently selected lesson. */}
      {lessonId && (
        <form className="admin-page-create-form" onSubmit={handleCreatePage}>
          <h3>Create New Page</h3>

          <label htmlFor="new-page-title">Page title</label>
          <input
            id="new-page-title"
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            required
            maxLength={200}
            disabled={saving}
          />

          <label htmlFor="new-page-position">Page position</label>
          <input
            id="new-page-position"
            type="number"
            min={1}
            step={1}
            value={newPosition}
            onChange={(event) => setNewPosition(Number(event.target.value))}
            required
            disabled={saving}
          />

          <label>
            <input
              type="checkbox"
              checked={newPublished}
              onChange={(event) => setNewPublished(event.target.checked)}
              disabled={saving}
            />
            Publish immediately
          </label>

          <button type="submit" disabled={saving || loading}>
            {saving ? "Creating..." : "Create Page"}
          </button>
        </form>
      )}

      {loading && <p role="status">Loading pages...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && lessonId && (
        <div className="admin-page-list">
          {pages.length === 0 ? (
            <p>No pages found for this lesson.</p>
          ) : (
            pages.map((page) => (
              <article key={page.id} className="admin-page-card">
                {editingId === page.id ? (
                  // Show editable fields only for the selected page.
                  <form onSubmit={handleUpdatePage}>
                    <label>
                      Page title
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Page position
                      <input
                        type="number"
                        min="1"
                        value={editPosition}
                        onChange={(event) =>
                          setEditPosition(Number(event.target.value))
                        }
                        required
                      />
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={editPublished}
                        onChange={(event) =>
                          setEditPublished(event.target.checked)
                        }
                      />
                      Published
                    </label>

                    <button type="submit" disabled={updating}>
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updating}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  // Keep the existing page information visible normally.
                  <>
                    <div>
                      <h3>{page.title}</h3>
                      <p>Page {page.position}</p>
                    </div>
                    <span>{page.published ? "Published" : "Draft"}</span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(page)}
                    >
                      Edit
                    </button>

                    {/* Delete uses the existing API and asks for confirmation. */}
                    <button
                      type="button"
                      onClick={() => void handleDeletePage(page)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
