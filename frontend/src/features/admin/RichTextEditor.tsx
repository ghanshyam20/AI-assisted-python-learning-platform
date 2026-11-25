import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, Heading2, List, ListOrdered,
  Link2, Undo2, Redo2,
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

    const url = window.prompt("Enter link URL (https://...)");
    if (!url) return;

    // Only allow ordinary web links.
    if (!/^https?:\/\//i.test(url)) {
      window.alert("Please enter a link starting with https:// or http://");
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return <p>Loading editor...</p>;

  return (
    <div className="admin-tiptap-editor">
      {/* These buttons format the selected text in the editor. */}
      <div className="admin-tiptap-toolbar" role="toolbar" aria-label="Text formatting">
        <button type="button" title="Bold" aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={17} />
        </button>

        <button type="button" title="Italic" aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={17} />
        </button>

        <button type="button" title="Heading" aria-label="Heading"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={17} />
        </button>

        <button type="button" title="Bullet list" aria-label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={17} />
        </button>

        <button type="button" title="Numbered list" aria-label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={17} />
        </button>

        <button type="button" title="Add link" aria-label="Add link"
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
