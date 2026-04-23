"use client";

import { memo } from "react";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

const isObject = (value: JsonValue): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isArray = (value: JsonValue): value is JsonArray => {
  return Array.isArray(value);
};

const PrimitiveValue = ({ value }: { value: JsonValue }) => {
  if (typeof value === "string") {
    return <span className="text-emerald-600">"{value}"</span>;
  }

  if (typeof value === "number") {
    return <span className="text-blue-600">{value}</span>;
  }

  if (typeof value === "boolean") {
    return <span className="text-purple-600">{String(value)}</span>;
  }

  return <span className="text-muted-foreground">null</span>;
};

const JsonNode = ({
  value,
  depth,
  label,
}: {
  value: JsonValue;
  depth: number;
  label?: string;
}) => {
  const openByDefault = depth < 2;

  if (!isObject(value) && !isArray(value)) {
    return (
      <div className="font-mono text-xs leading-5">
        {label ? <span className="text-muted-foreground">{label}: </span> : null}
        <PrimitiveValue value={value} />
      </div>
    );
  }

  const entries = isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);

  return (
    <details open={openByDefault} className="font-mono text-xs leading-5">
      <summary className="cursor-pointer select-none text-muted-foreground">
        {label ? `${label}: ` : ""}
        {isArray(value) ? `Array(${value.length})` : `Object(${entries.length})`}
      </summary>
      <div className="pl-4 border-l mt-1 space-y-1">
        {entries.map(([key, childValue]) => (
          <JsonNode
            key={`${depth}-${key}`}
            value={childValue as JsonValue}
            depth={depth + 1}
            label={key}
          />
        ))}
      </div>
    </details>
  );
};

export const JsonTreeViewer = memo(({ value }: { value: unknown }) => {
  const safeValue = (value ?? null) as JsonValue;

  return (
    <div className="rounded-md border bg-background p-3 max-h-[60vh] overflow-auto">
      <JsonNode value={safeValue} depth={0} />
    </div>
  );
});

JsonTreeViewer.displayName = "JsonTreeViewer";
