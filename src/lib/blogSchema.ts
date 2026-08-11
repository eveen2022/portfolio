import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";

// Extends GitHub's default sanitize schema with the inline formatting the
// blog body editor's selection toolbar can produce: <u> for underline (no
// native Markdown syntax exists for it), and a font-size-only `style` on
// <span> (restricted by regex so arbitrary CSS can't be injected through it).
export const blogSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["style", /^font-size:\s*[\d.]+(em|px|%|rem)\s*;?$/],
    ],
  },
};
