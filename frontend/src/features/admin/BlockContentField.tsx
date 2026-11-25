import { useId } from "react";
import type { PageBlock } from "./adminApi";
import RichTextEditor from "./RichTextEditor";

type Props = {
  type: PageBlock["block_type"];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function BlockContentField({
  type,
  value,
  onChange,
  disabled = false,
}: Props) {
  const fieldId = useId();
  const isCode = type === "code" || type === "output";

  // Python code and output must remain plain text.
  if (isCode) {
    return (
      <div className="admin-rich-field">
        <label htmlFor={fieldId}>
          {type === "code" ? "Python code" : "Expected output"}
        </label>

        <textarea
          id={fieldId}
          rows={9}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            type === "code"
              ? 'print("Hello, World!")'
              : "Hello, World!"
          }
          spellCheck={false}
          className="admin-rich-code-input"
          disabled={disabled}
        />
      </div>
    );
  }

  // Written lesson content uses the TipTap rich-text editor.
  return (
    <div className="admin-rich-field">
      <label>Lesson content</label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
