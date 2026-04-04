import { apiFetch } from "@/lib/api-client"
import type { LaunchPadHomeView } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export function useLaunchPadHome(studentId: string) {
  const { data, isLoading, error } = useQuery<LaunchPadHomeView>({
    queryKey: ["launchpad-home", studentId],
    queryFn: () => apiFetch<LaunchPadHomeView>(`/home/${studentId}`),
    enabled: !!studentId,
  })
  return { data: data ?? null, isLoading, error }
}
