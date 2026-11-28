import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import {
  Bold, Italic, Heading2, List, ListOrdered,
  Link2, Undo2, Redo2, Highlighter,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
}: Props) {
  // TipTap manages formatting and sends updated HTML to the parent form.
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Highlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Load saved content when the selected block changes.
  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  // Disable editing while the form is saving.
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  function addLink() {
    if (!editor) return;

    // Use the current URL when editing an existing link.
    const currentUrl = editor.getAttributes("link").href || "";
    const entered = window.prompt(
      "Enter a website URL (leave empty to remove an existing link):",
      currentUrl || "https://",
    );

    if (entered === null) return;

    const input = entered.trim();

    // An empty URL removes the link formatting.
    if (!input) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Allow users to enter a domain without typing https://.
    const url = /^https?:\/\//i.test(input)
      ? input
      : `https://${input}`;

    try {
      const parsed = new URL(url);

      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        !parsed.hostname.includes(".")
      ) {
        throw new Error("Invalid website address");
      }
    } catch {
      window.alert("Please enter a valid website URL.");
      return;
    }

    // Apply the URL to selected text or update an existing link.
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return <p>Loading editor...</p>;

  return (
    <div className="admin-tiptap-editor">
      {/* These buttons format the selected text in the editor. */}
      <div className="admin-tiptap-toolbar" role="toolbar" aria-label="Text formatting">
        <select
          aria-label="Font family"
          title="Font family"
          defaultValue=""
          onChange={(event) => {
            const font = event.target.value;
            if (font) editor.chain().focus().setFontFamily(font).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
        >
          <option value="">Default font</option>
          <option value="Arial">Arial</option>
          <option value="Calibri">Calibri</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="monospace">Monospace</option>
        </select>

        <input
          type="number"
          aria-label="Font size"
          title="Font size in pixels"
          min={8}
          max={72}
          step={1}
          placeholder="16"
          className="admin-tiptap-font-size"
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (!event.target.value) {
              editor.chain().focus().unsetFontSize().run();
            } else if (Number.isInteger(value) && value >= 8 && value <= 72) {
              editor.chain().focus().setFontSize(`${value}px`).run();
            }
          }}
        />
        <button
          type="button"
          title="Highlight text"
          aria-label="Highlight text"
          aria-pressed={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter size={17} />
        </button>
        <button type="button" title="Bold" aria-label="Bold" aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={17} />
        </button>

        <button type="button" title="Italic" aria-label="Italic" aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={17} />
        </button>

        <button type="button" title="Heading" aria-label="Heading" aria-pressed={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={17} />
        </button>

        <button type="button" title="Bullet list" aria-label="Bullet list" aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={17} />
        </button>

        <button type="button" title="Numbered list" aria-label="Numbered list" aria-pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={17} />
        </button>

        <button type="button" title="Add or edit link" aria-label="Add or edit link" aria-pressed={editor.isActive("link")}
          onClick={addLink}>
          <Link2 size={17} />
        </button>

        <button type="button" title="Undo" aria-label="Undo"
          onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={17} />
        </button>

        <button type="button" title="Redo" aria-label="Redo"
          onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={17} />
        </button>
      </div>

      {/* TipTap renders its editable document here. */}
      <EditorContent editor={editor} />
    </div>
  );
}

