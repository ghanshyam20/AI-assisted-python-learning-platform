import { useEffect, useState } from "react";
import { adminApi, type PageBlock } from "./adminApi";
import BlockContentField from "./BlockContentField";

type Props = {
  pageId: number;
  pageTitle: string;
  onBack: () => void;
};

// Friendly labels for the block types stored in Django.
const blockLabels: Record<PageBlock["block_type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  bullets: "Bullet list",
  numbered: "Numbered list",
  code: "Python code",
  output: "Example output",
  tip: "Learning tip",
  note: "Important note",
};

export default function LessonContentEditor({
  pageId,
  pageTitle,
  onBack,
}: Props) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Store the content being written by the administrator.
  const [blockType, setBlockType] =
    useState<PageBlock["block_type"]>("paragraph");
  const [content, setContent] = useState("");
  const [position, setPosition] = useState(1);
  const [saving, setSaving] = useState(false);

  // Load content belonging only to the selected lesson page.
  useEffect(() => {
    let active = true;

    async function loadBlocks() {
      setLoading(true);
      setError("");

      try {
        const result = await adminApi.blocks.list();

        if (active) {
          setBlocks(
            result
              .filter((block) => block.page === pageId)
              .sort((a, b) => a.position - b.position || a.id - b.id)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load page content."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBlocks();

    return () => {
      active = false;
    };
  }, [pageId]);

  // Save a new content block through the existing Django API.
  async function handleCreateBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() || !Number.isInteger(position) || position < 1) {
      setError("Enter content and a valid position.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const created = await adminApi.blocks.create({
        page: pageId,
        block_type: blockType,
        content: content.trim(),
        position,
      });

      // Show the saved block immediately without refreshing the page.
      setBlocks((current) =>
        [...current, created].sort(
          (a, b) => a.position - b.position || a.id - b.id
        )
      );

      setContent("");
      setPosition((current) => current + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-content-section">
      <button type="button" onClick={onBack}>
        ← Back to Lesson Pages
      </button>

      <div className="admin-section-heading">
        <div>
          <h2>Manage Content</h2>
          <p>{pageTitle}</p>
        </div>
      </div>

      {/* Create content for the selected lesson page. */}
      <form className="admin-block-create-form" onSubmit={handleCreateBlock}>
        <h3>Add Content Block</h3>

        <label htmlFor="block-type">Content type</label>
        <select
          id="block-type"
          value={blockType}
          onChange={(event) =>
            setBlockType(event.target.value as PageBlock["block_type"])
          }
          disabled={saving}
        >
          {Object.entries(blockLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Show editing controls that match the selected content type. */}
        <BlockContentField
          type={blockType}
          value={content}
          onChange={setContent}
          disabled={saving}
        />

        <label htmlFor="block-position">Position</label>
        <input
          id="block-position"
          type="number"
          min={1}
          step={1}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          required
          disabled={saving}
        />

        <button type="submit" disabled={saving || loading}>
          {saving ? "Saving..." : "Add Block"}
        </button>
      </form>

      {loading && <p role="status">Loading content...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <div className="admin-page-list">
          {blocks.length === 0 ? (
            <p>No content blocks yet. You can add them next.</p>
          ) : (
            blocks.map((block) => (
              <article key={block.id} className="admin-page-card">
                <div>
                  <h3>{blockLabels[block.block_type]}</h3>
                  <p>Position {block.position}</p>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      fontFamily: "inherit",
                    }}
                  >
                    {block.content}
                  </pre>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
