/* One-shot deep link from the Dashboard into a specific Study Kit tool.

   The Dashboard "Flashcards" tile (and later others) can set a pending tool
   before navigating; Study Kit reads (and clears) it once on mount so it opens
   straight into that tool, then returns to the normal tool list afterwards. */

let pending = null

export function setStudyKitTool(tool) {
  pending = tool || null
}

export function takeStudyKitTool() {
  const t = pending
  pending = null
  return t
}