
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
const EXAMPLE_EDGES_CSV = `source,target,edge_type,label,timestamp
user1,event1,triggered,User1 Login,2024-05-01T10:00:00Z
event1,app,initiated,App processes login,2024-05-01T10:00:05Z
app,db,reads,App fetches user,2024-05-01T10:00:10Z
user1,event2,triggered,User1 Purchase,2024-05-01T11:30:00Z
event2,svc_api,initiated,Auth call for purchase,2024-05-01T11:30:05Z
svc_api,log_store,writes,Write auth log,2024-05-01T11:30:10Z
user2,event1,triggered,User2 Login,2024-05-01T10:05:00Z
user3,event1,triggered,User3 Login,2024-05-01T10:10:00Z
user3,event3,triggered,User3 Logout,2024-05-01T12:00:00Z
event3,log_store,writes,Log logout,2024-05-01T12:00:05Z
user4,app,uses,App interaction,2024-05-01T14:00:00Z
user4,event2,triggered,User4 Purchase,2024-05-01T14:05:00Z
app,svc_api,calls,Service call,2024-05-01T14:05:05Z
user5,event1,triggered,User5 Login,2024-05-01T09:55:00Z
user5,event2,triggered,User5 Purchase,2024-05-01T15:00:00Z
user6,event3,triggered,User6 Logout,2024-05-01T18:00:00Z
user6,app,uses,App request,2024-05-01T18:00:05Z
user6,log_store,writes,Write request log,2024-05-01T18:00:10Z
event2,db,reads,Read purchase details,2024-05-01T11:30:15Z
event2,log_store,writes,Log purchase,2024-05-01T11:30:20Z
`;
const EXAMPLE_NODES_DESC = `Required columns: node_id, node_type. Optional: label, plus custom attributes (e.g. color, is_active).
Each node_id must be unique.`;
const EXAMPLE_EDGES_DESC = `Required columns: source, target. Optional: edge_type, label, timestamp.
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

