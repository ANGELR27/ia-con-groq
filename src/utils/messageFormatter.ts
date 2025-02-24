interface CodeBlock {
  type: "code";
  language: string;
  content: string;
}

interface TextBlock {
  type: "text";
  content: string;
}

type MessageBlock = CodeBlock | TextBlock;

export const parseMessage = (message: string): MessageBlock[] => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: MessageBlock[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(message)) !== null) {
    // Añadir texto antes del bloque de código si existe
    if (match.index > lastIndex) {
      blocks.push({
        type: "text",
        content: message.slice(lastIndex, match.index).trim(),
      });
    }

    // Añadir el bloque de código
    blocks.push({
      type: "code",
      language: match[1] || "plaintext",
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Añadir el texto restante después del último bloque de código
  if (lastIndex < message.length) {
    blocks.push({
      type: "text",
      content: message.slice(lastIndex).trim(),
    });
  }

  return blocks;
};
