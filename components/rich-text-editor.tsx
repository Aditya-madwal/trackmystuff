"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
} from "lucide-react";
import { useEffect } from "react";

// Lightweight markdown → HTML (covers bold, italic, headings, lists, code blocks, inline code)
function mdToHtml(md: string): string {
  if (!md) return "";
  let html = md
    // code blocks (fenced)
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // headings
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // bold & italic combined
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    // bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // underline (non-standard, use __text__)
    .replace(/__(.+?)__/g, "<u>$1</u>");

  // unordered lists
  html = html.replace(/(?:^|\n)((?:- .+\n?)+)/g, (_match, block: string) => {
    const items = block
      .trim()
      .split("\n")
      .map((l: string) => `<li>${l.replace(/^- /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // ordered lists
  html = html.replace(
    /(?:^|\n)((?:\d+\. .+\n?)+)/g,
    (_match, block: string) => {
      const items = block
        .trim()
        .split("\n")
        .map((l: string) => `<li>${l.replace(/^\d+\. /, "")}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    },
  );

  // paragraphs: wrap remaining plain lines
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^<(h[12]|ul|ol|li|pre|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("");

  return html;
}

// Lightweight HTML → markdown
function htmlToMd(html: string): string {
  if (!html) return "";
  let md = html
    // code blocks
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, "```\n$1\n```")
    // headings
    .replace(/<h1>(.*?)<\/h1>/g, "# $1")
    .replace(/<h2>(.*?)<\/h2>/g, "## $1")
    // bold
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    // italic
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    // underline
    .replace(/<u>(.*?)<\/u>/g, "__$1__")
    // inline code
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    // unordered list
    .replace(
      /<ul>([\s\S]*?)<\/ul>/g,
      (_m, inner: string) =>
        inner.replace(/<li>(.*?)<\/li>/g, "- $1").trim() + "\n",
    )
    // ordered list
    .replace(/<ol>([\s\S]*?)<\/ol>/g, (_m, inner: string) => {
      let i = 0;
      return (
        inner
          .replace(/<li>(.*?)<\/li>/g, (_: string, c: string) => `${++i}. ${c}`)
          .trim() + "\n"
      );
    })
    // paragraphs & breaks
    .replace(/<p>(.*?)<\/p>/g, "$1\n")
    .replace(/<br\s*\/?>/g, "\n")
    // strip remaining tags
    .replace(/<[^>]+>/g, "")
    // collapse blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return md;
}

interface RichTextEditorProps {
  content: string; // markdown string
  onChange: (markdown: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? "bg-accent/15 text-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
    ],
    content: mdToHtml(content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-sm text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(htmlToMd(html));
    },
  });

  // Sync external content changes (e.g. when opening edit for a different note)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMd = htmlToMd(editor.getHTML());
      // Only update if the content is meaningfully different
      if (currentMd.trim() !== content.trim()) {
        editor.commands.setContent(mdToHtml(content));
      }
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/40 bg-muted/30 flex-wrap">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/40 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/40 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border/40 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
