
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

type SampleCsvCardProps = {
  title: string;
  description: string;
  csv: string;
};

const SampleCsvCard = ({ title, description, csv }: SampleCsvCardProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(csv.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="rounded-lg border shadow-sm bg-background/70 p-4 w-full max-w-[420px]">
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="font-semibold text-primary">{title}</span>
        <Button size="sm" variant="outline" className="gap-1" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{description}</div>
      <pre className="bg-card rounded font-mono text-xs p-2 overflow-x-auto border mb-0">{csv.trim()}</pre>
    </div>
  );
};

export default SampleCsvCard;
