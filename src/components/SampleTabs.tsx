
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SampleCsvCard from "./SampleCsvCard";
import { Button } from "@/components/ui/button";

type SampleTabsProps = {
  onFillSample: () => void;
  onFillExample: () => void;
};

const SAMPLE_NODES_CSV = `node_id,node_type,label,color,is_active
user1,entity,Alice,blue,true
user2,entity,Bob,green,false
app,external-system,My App,gray,true
event1,event,Login,,true
db,data-store,Users DB,,true
`;
const SAMPLE_EDGES_CSV = `source,target,edge_type,label
user1,event1,triggered,User Login
event1,app,initiated,
app,db,reads,App fetches user
user2,event1,triggered,
`;
const SAMPLE_NODES_DESC = `Required columns: node_id, node_type. Optional: label, plus custom attributes (e.g. color, is_active).
Each node_id must be unique.`;
const SAMPLE_EDGES_DESC = `Required columns: source, target. Optional: edge_type, label.
source/target must match node_id from nodes.csv.`;

const EXAMPLE_NODES_CSV = `node_id,node_type,label,color,is_active
user1,entity,Alice,blue,true
user2,entity,Bob,green,false
user3,entity,Carol,orange,true
user4,entity,Dan,purple,true
user5,entity,Eve,cyan,false
user6,entity,Frank,teal,true
app,external-system,My App,gray,true
svc_api,external-system,Auth API,lightgray,true
event1,event,Login,,true
event2,event,Purchase,,true
event3,event,Logout,,true
db,data-store,Users DB,,true
log_store,data-store,Logs DB,,true
`;
const EXAMPLE_EDGES_CSV = `source,target,edge_type,label
user1,event1,triggered,User1 Login
event1,app,initiated,App processes login
app,db,reads,App fetches user
user1,event2,triggered,User1 Purchase
event2,svc_api,initiated,Auth call for purchase
svc_api,log_store,writes,Write auth log
user2,event1,triggered,User2 Login
user3,event1,triggered,User3 Login
user3,event3,triggered,User3 Logout
event3,log_store,writes,Log logout
user4,app,uses,App interaction
user4,event2,triggered,User4 Purchase
app,svc_api,calls,Service call
user5,event1,triggered,User5 Login
user5,event2,triggered,User5 Purchase
user6,event3,triggered,User6 Logout
user6,app,uses,App request
user6,log_store,writes,Write request log
event2,db,reads,Read purchase details
event2,log_store,writes,Log purchase
`;
const EXAMPLE_NODES_DESC = SAMPLE_NODES_DESC;
const EXAMPLE_EDGES_DESC = SAMPLE_EDGES_DESC;

export function SampleTabs({ onFillSample, onFillExample }: SampleTabsProps) {
  const [tab, setTab] = React.useState<"sample" | "example">("sample");
  return (
    <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full">
      <TabsList className="w-full mb-2">
        <TabsTrigger value="sample" className="flex-1">Sample Data</TabsTrigger>
        <TabsTrigger value="example" className="flex-1">Example Data</TabsTrigger>
      </TabsList>
      <TabsContent value="sample">
        <div className="flex flex-col gap-4">
          <SampleCsvCard title="Sample nodes.csv" description={SAMPLE_NODES_DESC} csv={SAMPLE_NODES_CSV} />
          <SampleCsvCard title="Sample edges.csv" description={SAMPLE_EDGES_DESC} csv={SAMPLE_EDGES_CSV} />
          <Button variant="secondary" onClick={onFillSample}>Fill Sample</Button>
        </div>
      </TabsContent>
      <TabsContent value="example">
        <div className="flex flex-col gap-4">
          <SampleCsvCard title="Example nodes.csv" description={EXAMPLE_NODES_DESC} csv={EXAMPLE_NODES_CSV} />
          <SampleCsvCard title="Example edges.csv" description={EXAMPLE_EDGES_DESC} csv={EXAMPLE_EDGES_CSV} />
          <Button variant="secondary" onClick={onFillExample}>Fill Example</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Export CSVs and descriptions for easy reuse
export const SAMPLE_TAB_CSVS = {
  sample: { nodes: SAMPLE_NODES_CSV, edges: SAMPLE_EDGES_CSV },
  example: { nodes: EXAMPLE_NODES_CSV, edges: EXAMPLE_EDGES_CSV }
};
