import { getStoredUser } from "@/lib/api-client"
import { MOCK_STUDENT } from "@/lib/mock-data"
import type { StudentProfile } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

// Student profile comes from the Auth service (not LaunchPad scope).
// Mock-backed until Auth integration is added; real userId is read from localStorage or cookie.
export function useStudent() {
  const { data, isLoading, error } = useQuery<StudentProfile>({
    queryKey: ["student"],
    queryFn: () => {
      const user = getStoredUser()
      return Promise.resolve({
        ...MOCK_STUDENT,
        id: user?.userId ?? MOCK_STUDENT.id,
      })
    },
    staleTime: Infinity,
  })
  return { data: data ?? null, isLoading, error }
}
