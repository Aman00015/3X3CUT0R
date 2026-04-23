"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { CopyIcon, DownloadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type StructuredNodeOutput,
  outputToRawText,
  outputPreview,
} from "@/features/executions/lib/structured-output";
import { JsonTreeViewer } from "./json-tree-viewer";

const WEEKDAY_HEADER = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(\b|:)/i;
const SECTION_HEADER = /^(the ground rules|rules of the road|trainer'?s tips for success|focus)(\b|:)/i;
const EXERCISE_LINE = /^[A-Za-z].*:\s*\d+\s*(set|sets|x|rep|reps)/i;

const normalizeMarkdownForDisplay = (content: string): string => {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  const normalized = lines.map((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return "";
    }

    if (trimmed.startsWith("#") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      return trimmed;
    }

    if (WEEKDAY_HEADER.test(trimmed)) {
      return `## ${trimmed}`;
    }

    if (SECTION_HEADER.test(trimmed)) {
      return `### ${trimmed}`;
    }

    if (EXERCISE_LINE.test(trimmed)) {
      return `- ${trimmed}`;
    }

    return trimmed;
  });

  return normalized.join("\n");
};

const getFileExtension = (output: StructuredNodeOutput) => {
  if (output.type === "json") {
    return "json";
  }

  if (output.type === "markdown") {
    return "md";
  }

  return "txt";
};

const renderPreview = (output: StructuredNodeOutput) => {
  if (output.type === "json") {
    return <JsonTreeViewer value={output.content} />;
  }

  if (output.type === "markdown") {
    const normalizedContent = normalizeMarkdownForDisplay(outputToRawText(output));

    return (
      <div className="rounded-md border bg-background p-4 max-h-[60vh] overflow-auto prose prose-sm max-w-none leading-7">
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {normalizedContent}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <pre className="rounded-md border bg-background p-4 max-h-[60vh] overflow-auto text-sm whitespace-pre-wrap">
      {outputToRawText(output)}
    </pre>
  );
};

interface OutputViewerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string | null;
  output: StructuredNodeOutput | null;
}

export const OutputViewerDrawer = ({
  open,
  onOpenChange,
  nodeId,
  output,
}: OutputViewerDrawerProps) => {
  const raw = useMemo(() => {
    if (!output) {
      return "";
    }

    return outputToRawText(output);
  }, [output]);

  const handleCopy = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(raw);
    toast.success("Output copied");
  };

  const handleDownload = () => {
    if (!output) {
      return;
    }

    const blob = new Blob([raw], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `output-${nodeId ?? "node"}.${getFileExtension(output)}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <SheetTitle>Output Viewer</SheetTitle>
              <SheetDescription>
                {output
                  ? `Node ${nodeId} • ${output.type.toUpperCase()} • ${outputPreview(output, 120)}`
                  : "No output available for this node yet."}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <XIcon className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {output ? (
            <>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <CopyIcon className="size-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <DownloadIcon className="size-4 mr-1" />
                  Download
                </Button>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-3">
                  {renderPreview(output)}
                </TabsContent>
                <TabsContent value="raw" className="mt-3">
                  <pre className="rounded-md border bg-background p-4 max-h-[60vh] overflow-auto text-xs">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              Run this workflow at least once so the Output node can display structured results.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
