
import React from "react";
import SampleCsvCard from "./SampleCsvCard";
import { Button } from "@/components/ui/button";

type SampleTabsProps = {
  onFillExample: () => void;
};

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
const EXAMPLE_NODES_DESC = `Required columns: node_id, node_type. Optional: label, plus custom attributes (e.g. color, is_active).
Each node_id must be unique.`;
const EXAMPLE_EDGES_DESC = `Required columns: source, target. Optional: edge_type, label.
source/target must match node_id from nodes.csv.`;

export function SampleTabs({ onFillExample }: SampleTabsProps) {
  return (
    <div className="flex flex-col gap-4">
      <SampleCsvCard title="Example nodes.csv" description={EXAMPLE_NODES_DESC} csv={EXAMPLE_NODES_CSV} />
      <SampleCsvCard title="Example edges.csv" description={EXAMPLE_EDGES_DESC} csv={EXAMPLE_EDGES_CSV} />
      <Button variant="secondary" onClick={onFillExample}>Fill Example</Button>
    </div>
  );
}

// Export CSVs and descriptions for easy reuse
export const SAMPLE_TAB_CSVS = {
  example: { nodes: EXAMPLE_NODES_CSV, edges: EXAMPLE_EDGES_CSV }
};

