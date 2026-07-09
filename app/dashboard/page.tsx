import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_WORKSPACE } from "@/lib/types";
import type { WorkspaceState } from "@/lib/types";
import { ToastProvider } from "@/context/ToastContext";
import { PlannerProvider } from "@/context/PlannerContext";
import PlannerApp from "@/components/PlannerApp";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("workspace_state")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let workspace: WorkspaceState;

  if (row) {
    workspace = {
      details: { ...DEFAULT_WORKSPACE.details, ...(row.details as object) },
      rundown: (row.rundown as WorkspaceState["rundown"]) || [],
      checklist: (row.checklist as WorkspaceState["checklist"]) || {},
      checklistCustom: (row.checklist_custom as WorkspaceState["checklistCustom"]) || {},
      checklistCustomCategories:
        (row.checklist_custom_categories as WorkspaceState["checklistCustomCategories"]) || {},
    };
  } else {
    workspace = DEFAULT_WORKSPACE;
    await supabase.from("workspace_state").insert({
      user_id: user.id,
      details: DEFAULT_WORKSPACE.details,
      rundown: DEFAULT_WORKSPACE.rundown,
      checklist: DEFAULT_WORKSPACE.checklist,
      checklist_custom: DEFAULT_WORKSPACE.checklistCustom,
      checklist_custom_categories: DEFAULT_WORKSPACE.checklistCustomCategories,
    });
  }

  return (
    <ToastProvider>
      <PlannerProvider userId={user.id} initialWorkspace={workspace}>
        <PlannerApp />
      </PlannerProvider>
    </ToastProvider>
  );
}
