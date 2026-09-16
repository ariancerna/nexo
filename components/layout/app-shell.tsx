import { NexoWorkspace } from "@/components/workspace/nexo-workspace";

export type WorkspaceUser = {
  name: string;
  email: string;
};

export function AppShell({ user }: { user: WorkspaceUser }) {
  return <NexoWorkspace user={user} />;
}
