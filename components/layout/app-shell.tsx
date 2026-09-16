import { NexoWorkspace } from "@/components/workspace/nexo-workspace";

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  timezone: string;
  avatarPath: string | null;
  avatarUrl: string | null;
  usernameChangedAt: string | null;
};

export function AppShell({ user }: { user: WorkspaceUser }) {
  return <NexoWorkspace user={user} />;
}
