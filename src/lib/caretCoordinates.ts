// Computes the viewport-relative pixel position of a character offset inside
// a <textarea>. There's no native browser API for this — the standard trick
// (used by libraries like textarea-caret-position) is to mirror the
// textarea's text and computed style into a hidden div, insert a marker
// span at the target offset, then measure the marker's position.
const MIRRORED_PROPERTIES = [
  "box-sizing",
  "width",
  "height",
  "overflow-x",
  "overflow-y",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-style",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "font-style",
  "font-variant",
  "font-weight",
  "font-stretch",
  "font-size",
  "font-size-adjust",
  "line-height",
  "font-family",
  "text-align",
  "text-transform",
  "text-indent",
  "text-decoration",
  "letter-spacing",
  "word-spacing",
  "tab-size",
  "white-space",
  "word-wrap",
  "word-break",
];

export function getSelectionCoords(
  textarea: HTMLTextAreaElement,
  position: number,
): { top: number; left: number; height: number } {
  const mirror = document.createElement("div");
  document.body.appendChild(mirror);

  const computed = window.getComputedStyle(textarea);
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";

  for (const prop of MIRRORED_PROPERTIES) {
    mirror.style.setProperty(prop, computed.getPropertyValue(prop));
  }
  mirror.style.setProperty("height", "auto");

  mirror.textContent = textarea.value.slice(0, position);
  const marker = document.createElement("span");
  marker.textContent = textarea.value.slice(position) || ".";
  mirror.appendChild(marker);

  const textareaRect = textarea.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();

  const top = textareaRect.top + (markerRect.top - mirrorRect.top) - textarea.scrollTop;
  const left = textareaRect.left + (markerRect.left - mirrorRect.left) - textarea.scrollLeft;
  const height = markerRect.height;

  document.body.removeChild(mirror);

  return { top, left, height };
}
