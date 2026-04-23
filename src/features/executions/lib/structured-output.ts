export type StructuredOutputType = "json" | "markdown" | "text";

export type StructuredNodeOutput = {
  type: StructuredOutputType;
  content: unknown;
  meta?: {
    model?: string;
    timestamp?: string;
  };
};

const MARKDOWN_HINTS = ["#", "```", "\n- ", "\n* ", "\n1. "];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isStructuredNodeOutput = (value: unknown): value is StructuredNodeOutput => {
  if (!isRecord(value)) {
    return false;
  }

  const outputType = value.type;
  return outputType === "json" || outputType === "markdown" || outputType === "text";
};

const detectStringFormat = (content: string): StructuredNodeOutput => {
  const trimmed = content.trim();

  try {
    const parsed = JSON.parse(trimmed);
    return {
      type: "json",
      content: parsed,
    };
  } catch {
    const looksLikeMarkdown = MARKDOWN_HINTS.some((hint) => trimmed.includes(hint));

    if (looksLikeMarkdown) {
      return {
        type: "markdown",
        content,
      };
    }

    return {
      type: "text",
      content,
    };
  }
};

export const detectFormat = (content: unknown): StructuredNodeOutput => {
  if (isStructuredNodeOutput(content)) {
    return content;
  }

  if (typeof content === "string") {
    return detectStringFormat(content);
  }

  if (isRecord(content) || Array.isArray(content)) {
    return {
      type: "json",
      content,
    };
  }

  return {
    type: "text",
    content: content == null ? "" : String(content),
  };
};

export const toStructuredNodeOutput = (
  content: unknown,
  meta?: StructuredNodeOutput["meta"],
): StructuredNodeOutput => {
  const detected = detectFormat(content);

  if (!meta) {
    return detected;
  }

  return {
    ...detected,
    meta: {
      ...detected.meta,
      ...meta,
    },
  };
};

export const outputToRawText = (output: StructuredNodeOutput): string => {
  if (output.type === "json") {
    return JSON.stringify(output.content, null, 2);
  }

  if (typeof output.content === "string") {
    return output.content;
  }

  return String(output.content ?? "");
};

export const outputPreview = (output: StructuredNodeOutput, limit = 100): string => {
  const raw = outputToRawText(output).replace(/\s+/g, " ").trim();

  if (raw.length <= limit) {
    return raw;
  }

  return `${raw.slice(0, limit)}...`;
};
