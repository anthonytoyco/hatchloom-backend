import { apiFetch } from "@/lib/api-client"
import type {
  BusinessModelCanvas,
  CreateSideHustleRequest,
  EditBMCRequest,
  Position,
  Sandbox,
  SandboxTool,
  SideHustle,
  TeamMember,
} from "@/lib/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

// ── Sandbox ───────────────────────────────────────────────────────────────────

export function useCreateSandbox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      studentId: string
      title: string
      description?: string
    }) =>
      apiFetch<Sandbox>("/launchpad/sandboxes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: ["launchpad-home", variables.studentId],
      })
    },
  })
}

export function useUpdateSandbox(sandboxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; description?: string }) =>
      apiFetch<Sandbox>(`/launchpad/sandboxes/${sandboxId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sandbox", sandboxId] })
    },
  })
}

export function useDeleteSandbox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sandboxId: string) =>
      apiFetch<void>(`/launchpad/sandboxes/${sandboxId}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["launchpad-home"] })
    },
  })
}

// ── Sandbox Tools ─────────────────────────────────────────────────────────────

export function useAddTool(sandboxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { toolType: string; data?: string }) =>
      apiFetch<SandboxTool>(`/launchpad/sandboxes/${sandboxId}/tools`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sandbox-tools", sandboxId] })
    },
  })
}

export function useUpdateTool(sandboxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { toolId: string; data: string }) =>
      apiFetch<SandboxTool>(
        `/launchpad/sandboxes/${sandboxId}/tools/${payload.toolId}`,
        { method: "PUT", body: JSON.stringify({ data: payload.data }) }
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sandbox-tools", sandboxId] })
    },
  })
}

export function useDeleteTool(sandboxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (toolId: string) =>
      apiFetch<void>(`/launchpad/sandboxes/${sandboxId}/tools/${toolId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sandbox-tools", sandboxId] })
    },
  })
}

// ── SideHustle ────────────────────────────────────────────────────────────────

export function useCreateSideHustle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSideHustleRequest) =>
      apiFetch<SideHustle>("/launchpad/sidehustles", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: ["launchpad-home", variables.studentId],
      })
    },
  })
}

export function useUpdateSideHustle(sideHustleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; description?: string }) =>
      apiFetch<SideHustle>(`/launchpad/sidehustles/${sideHustleId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sidehustle", sideHustleId] })
    },
  })
}

export function useDeleteSideHustle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sideHustleId: string) =>
      apiFetch<void>(`/launchpad/sidehustles/${sideHustleId}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, sideHustleId) => {
      qc.removeQueries({ queryKey: ["sidehustle", sideHustleId] })
      void qc.invalidateQueries({ queryKey: ["launchpad-home"] })
    },
  })
}

// ── BMC ───────────────────────────────────────────────────────────────────────

export function usePatchBMC(sideHustleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EditBMCRequest) =>
      apiFetch<BusinessModelCanvas>(
        `/launchpad/sidehustles/${sideHustleId}/bmc`,
        { method: "PATCH", body: JSON.stringify(payload) }
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bmc", sideHustleId] })
    },
  })
}

// ── Team ──────────────────────────────────────────────────────────────────────

export function useAddTeamMember(sideHustleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string; role?: string }) =>
      apiFetch<TeamMember>(
        `/launchpad/sidehustles/${sideHustleId}/team/members`,
        { method: "POST", body: JSON.stringify(payload) }
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["team", sideHustleId] })
    },
  })
}

export function useRemoveTeamMember(sideHustleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<void>(
        `/launchpad/sidehustles/${sideHustleId}/team/members/${userId}`,
        { method: "DELETE" }
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["team", sideHustleId] })
    },
  })
}

// ── Positions ─────────────────────────────────────────────────────────────────

export function useCreatePosition(sideHustleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; description?: string }) =>
      apiFetch<Position>(`/launchpad/sidehustles/${sideHustleId}/positions`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["positions", sideHustleId] })
    },
  })
}

export function useUpdatePositionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      positionId: string
      status: string
      sideHustleId: string
    }) =>
      apiFetch<Position>(
        `/launchpad/sidehustles/${payload.sideHustleId}/positions/${payload.positionId}/status`,
        { method: "PUT", body: JSON.stringify({ status: payload.status }) }
      ),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: ["positions", variables.sideHustleId],
      })
    },
  })
}
