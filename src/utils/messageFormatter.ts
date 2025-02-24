interface MessageBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}

export function parseMessage(message: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const boldTextRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(message)) !== null) {
    // Añadir texto antes del bloque de código
    if (match.index > lastIndex) {
      let textContent = message.slice(lastIndex, match.index);
      // Procesar texto en negrita
      textContent = textContent.replace(boldTextRegex, "<strong>$1</strong>");
      blocks.push({ type: "text", content: textContent });
    }

    // Añadir bloque de código
    blocks.push({
      type: "code",
      content: match[2],
      language: match[1] || "plaintext",
    });

    lastIndex = match.index + match[0].length;
  }

  // Añadir el texto restante después del último bloque de código
  if (lastIndex < message.length) {
    let remainingText = message.slice(lastIndex);
    // Procesar texto en negrita en el texto restante
    remainingText = remainingText.replace(boldTextRegex, "<strong>$1</strong>");
    blocks.push({ type: "text", content: remainingText });
  }

  return blocks;
}
