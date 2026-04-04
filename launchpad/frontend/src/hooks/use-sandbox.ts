import { apiFetch } from "@/lib/api-client"
import type { Sandbox, SandboxTool } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export function useSandbox(sandboxId: string) {
  const sandboxQuery = useQuery<Sandbox>({
    queryKey: ["sandbox", sandboxId],
    queryFn: () => apiFetch<Sandbox>(`/sandboxes/${sandboxId}`),
    enabled: !!sandboxId,
  })

  const toolsQuery = useQuery<SandboxTool[]>({
    queryKey: ["sandbox-tools", sandboxId],
    queryFn: () => apiFetch<SandboxTool[]>(`/sandboxes/${sandboxId}/tools`),
    enabled: !!sandboxId,
  })

  return {
    sandbox: sandboxQuery.data ?? null,
    tools: toolsQuery.data ?? [],
    isLoading: sandboxQuery.isLoading || toolsQuery.isLoading,
    error: sandboxQuery.error ?? toolsQuery.error,
  }
}
