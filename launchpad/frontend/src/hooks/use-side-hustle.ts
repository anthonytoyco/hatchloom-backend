import { apiFetch } from "@/lib/api-client"
import type {
  BusinessModelCanvas,
  Position,
  SideHustle,
  TeamMember,
} from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export function useSideHustle(sideHustleId: string) {
  const shQuery = useQuery<SideHustle>({
    queryKey: ["sidehustle", sideHustleId],
    queryFn: () => apiFetch<SideHustle>(`/sidehustles/${sideHustleId}`),
    enabled: !!sideHustleId,
  })

  const bmcQuery = useQuery<BusinessModelCanvas>({
    queryKey: ["bmc", sideHustleId],
    queryFn: () =>
      apiFetch<BusinessModelCanvas>(`/sidehustles/${sideHustleId}/bmc`),
    enabled: !!sideHustleId,
  })

  const teamQuery = useQuery<TeamMember[]>({
    queryKey: ["team", sideHustleId],
    queryFn: () =>
      apiFetch<TeamMember[]>(`/sidehustles/${sideHustleId}/team/members`),
    enabled: !!sideHustleId,
  })

  const positionsQuery = useQuery<Position[]>({
    queryKey: ["positions", sideHustleId],
    queryFn: () =>
      apiFetch<Position[]>(`/sidehustles/${sideHustleId}/positions`),
    enabled: !!sideHustleId,
  })

  return {
    sideHustle: shQuery.data ?? null,
    bmc: bmcQuery.data ?? null,
    team: teamQuery.data ?? [],
    positions: positionsQuery.data ?? [],
    isLoading:
      shQuery.isLoading ||
      bmcQuery.isLoading ||
      teamQuery.isLoading ||
      positionsQuery.isLoading,
    error:
      shQuery.error ??
      bmcQuery.error ??
      teamQuery.error ??
      positionsQuery.error,
  }
}
