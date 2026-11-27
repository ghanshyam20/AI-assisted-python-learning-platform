import { useEffect, useState } from "react";
import { adminApi, type PageBlock } from "./adminApi";
import BlockContentField from "./BlockContentField";
import "./LessonContentEditor.cms.css";

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
  const [preview, setPreview] = useState(false);
  // tracks which content block is being edited 
  const [editingId, setEditingId]=useState<number | null>(null);

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
      const saved =
        editingId !== null
          ? await adminApi.blocks.update(editingId, {
              page: pageId,
              block_type: blockType,
              content: content.trim(),
              position,
            })
          : await adminApi.blocks.create({
              page: pageId,
              block_type: blockType,
              content: content.trim(),
              position,
            });

      setBlocks((current) =>
        [...current.filter((block) => block.id !== saved.id), saved].sort(
          (a, b) => a.position - b.position || a.id - b.id
        )
      );
      setContent("");
      setPosition((current) => current + 1);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save content.");
    } finally {
      setSaving(false);
    }
  }


  // Load an existing block into the editor.
  function handleEditBlock(block: PageBlock) {
    setEditingId(block.id);
    setBlockType(block.block_type);
    setContent(block.content);
    setPosition(block.position);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Clear the form without changing saved content.
  function handleCancelEdit() {
    setEditingId(null);
    setContent("");
    setPosition(blocks.length + 1);
    setError("");
  }

  // Delete a block only after administrator confirmation.
  async function handleDeleteBlock(block: PageBlock) {
    if (!window.confirm("Delete this content block?")) return;

    setSaving(true);
    setError("");

    try {
      await adminApi.blocks.remove(block.id);
      setBlocks((current) => current.filter((item) => item.id !== block.id));

      if (editingId === block.id) {
        setEditingId(null);
        setContent("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete block.");
    } finally {
      setSaving(false);
    }
  }

  // Sandbox has no script execution or same-origin access. This preview is
  // isolated from the admin application, including any untrusted HTML.
  const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const previewBlock = (block: PageBlock) => {
    if (block.block_type === "code" || block.block_type === "output") {
      return `<pre><code>${escapeHtml(block.content)}</code></pre>`;
    }
    const html = block.content;
    if (block.block_type === "heading") return `<h2>${html}</h2>`;
    if (block.block_type === "tip" || block.block_type === "note") return `<aside><strong>${block.block_type === "tip" ? "Tip" : "Note"}</strong>${html}</aside>`;
    return `<div class="content">${html}</div>`;
  };
  const previewBlocks = [...blocks];
  if (editingId !== null) {
    const index = previewBlocks.findIndex((block) => block.id === editingId);
    if (index !== -1) previewBlocks[index] = { ...previewBlocks[index], block_type: blockType, content, position };
  } else if (content.trim()) {
    previewBlocks.push({ id: -1, page: pageId, block_type: blockType, content, position });
  }
  previewBlocks.sort((a, b) => a.position - b.position || a.id - b.id);
  const previewHtml = `<!doctype html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box}body{margin:0;padding:28px;font:15px/1.75 system-ui,Arial;color:#1b2b45;background:#fff}
    h1{font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:0 0 24px}h2{font-size:20px;margin:20px 0 10px}
    p{margin:0 0 14px}ul,ol{padding-left:26px}li{margin:5px 0}pre{background:#111c35;color:#f1f5ff;padding:18px;border-radius:12px;overflow:auto}
    aside{border-left:4px solid #3b6ef5;background:#eef4ff;padding:16px;border-radius:10px;margin:16px 0}aside strong{display:block}
    .content{margin:14px 0}a{color:#2458d8}
  </style></head><body><h1>${escapeHtml(pageTitle)}</h1>${previewBlocks.map(previewBlock).join("\n")}</body></html>`;

  return (
    <section className="admin-content-section cms-workspace">
      <button type="button" onClick={onBack}>
        ← Back to Lesson Pages
      </button>

      <div className="admin-section-heading">
        <div>
          <h2>Page content studio</h2>
          <p>{pageTitle} · {blocks.length} saved blocks</p>
        </div>
      </div>

      <div className="cms-toolbar">
        <div>
          <strong>Compose your lesson</strong>
          <p>Arrange blocks, write content and preview before publishing.</p>
        </div>
        <button type="button" onClick={() => setPreview((value) => !value)} aria-pressed={preview}>
          {preview ? "Hide student preview" : "Preview student page"}
        </button>
      </div>
      {preview && (
        <div className="cms-preview-panel">
          <div className="cms-preview-title"><strong>Student preview</strong><span>Unsaved edits included · preview only</span></div>
          <iframe title="Student page preview" sandbox="" srcDoc={previewHtml} />
        </div>
      )}
      {/* Create content for the selected lesson page. */}
      <form className="admin-block-create-form" onSubmit={handleCreateBlock}>
        <h3>{editingId !== null ? "Edit content block" : "Add content block"}</h3>

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
          {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Add Block"}
        </button>
        {editingId !== null && (
          <button type="button" onClick={handleCancelEdit} disabled={saving}>
            Cancel Editing
          </button>
        )}
      </form>

      {loading && <p role="status">Loading content...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && (
        <div className="admin-page-list cms-block-list">
          {blocks.length === 0 ? (
            <p>No content blocks yet. You can add them next.</p>
          ) : (
            blocks.map((block) => (
              <article key={block.id} className="admin-page-card">
                <div>
                  <h3>{blockLabels[block.block_type]}</h3>
                  <p>Position {block.position}</p>
                  <p className="cms-block-excerpt">{block.block_type === "code" || block.block_type === "output" ? block.content : block.content.replace(/<[^>]*>/g, " ")}</p>
                </div>
                {/* Existing blocks can be edited or removed. */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => handleEditBlock(block)}
                    disabled={saving}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteBlock(block)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
