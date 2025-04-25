/**
 * Creates a system prompt for the PDF assistant
 * @param context The retrieved context from document
 * @returns Formatted system prompt with context
 */
export function createSystemPrompt(context: string): string {
  return `
You are a PDF assistant. Answer ONLY from the context delimited by ===.
If the answer is not in context, say "I don't know from this document".
===
${context}
===
`.trim()
}