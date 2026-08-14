// Browser-supplied Content-Type / File.type is just a client-provided label —
// trivially spoofable by anyone posting directly to the API rather than
// through the UI. These check the actual file bytes match what was claimed,
// as defense-in-depth beyond the extension allowlist already enforced by the
// callers.
export function verifyFileSignature(buffer: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/png":
      return (
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        )
      );
    case "image/jpeg":
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    case "image/webp":
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );
    case "image/gif":
      return (
        buffer.length >= 6 &&
        ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))
      );
    case "image/svg+xml": {
      // SVG is XML text, not a fixed binary signature — just confirm it
      // actually looks like an SVG document rather than some arbitrary blob
      // wearing an SVG content-type.
      const head = buffer.subarray(0, 1024).toString("utf-8").trimStart().toLowerCase();
      return head.startsWith("<?xml") || head.startsWith("<svg") || head.includes("<svg");
    }
    case "application/pdf":
      return (
        buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-"
      );
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
      // ICO header: reserved (0x0000) + type 1 (icon).
      return (
        buffer.length >= 4 &&
        buffer[0] === 0x00 &&
        buffer[1] === 0x00 &&
        buffer[2] === 0x01 &&
        buffer[3] === 0x00
      );
    default:
      return false;
  }
}

// SVGs can carry inline <script>, event-handler attributes, and
// javascript: URIs — a well-known stored-XSS vector when the file is later
// opened directly (same-origin) rather than just embedded as an <img>.
// Strips that content before the file is written to disk.
export function sanitizeSvg(buffer: Buffer): Buffer {
  let text = buffer.toString("utf-8");
  // Matches a closing </script> when present, or runs to the end of the
  // document when it isn't — an unclosed <script> tag would otherwise pass
  // through untouched, since the old pattern required a matching close.
  text = text.replace(/<script[\s\S]*?(<\/script\s*>|$)/gi, "");
  text = text.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  text = text.replace(
    /((?:xlink:)?href)\s*=\s*("|')\s*javascript:[^"']*\2/gi,
    "",
  );
  return Buffer.from(text, "utf-8");
}
