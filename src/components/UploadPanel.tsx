import React from "react";
import { useGraphStore } from "@/state/useGraphStore";
import { SAMPLE_TAB_CSVS } from "./SampleTabs";
import UploadCsvSection from "./UploadCsvSection";
import MainSettingsSection from "./MainSettingsSection";
import { ScrollArea } from "./ui/scroll-area";
import { parseCsvData } from "@/utils/csvParser";

const UploadPanel = () => {
  const { setNodes, setEdges } = useGraphStore();

  // Always fill Example data on mount
  React.useEffect(() => {
    const { nodes: defaultNodes, edges: defaultEdges } = parseCsvData(
      SAMPLE_TAB_CSVS.example.nodes,
      SAMPLE_TAB_CSVS.example.edges
    );
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for filling example data
  const handleFillExample = () => {
    const { nodes, edges } = parseCsvData(SAMPLE_TAB_CSVS.example.nodes, SAMPLE_TAB_CSVS.example.edges);
    setNodes(nodes);
    setEdges(edges);
  };

  // --- Show Upload/Examples and Settings SIDE BY SIDE, responsive layout ---
  // Updated to allow main div to use full available size
  return (
    <div className="flex flex-col gap-8 md:gap-10 md:flex-row flex-1 items-stretch h-full">
      {/* Upload & Examples section */}
      <div className="flex-shrink-0 w-full md:w-[420px]">
        <ScrollArea className="h-[340px] md:h-[calc(80vh-60px)]">
          <UploadCsvSection onExample={handleFillExample} />
        </ScrollArea>
      </div>
      {/* Main Settings section */}
      <div className="flex-1">
        <ScrollArea className="h-[340px] md:h-[calc(80vh-60px)]">
          <MainSettingsSection onFillExample={handleFillExample} />
        </ScrollArea>
      </div>
    </div>
  );
};

export default UploadPanel;
