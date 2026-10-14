import { useSearchParams } from 'react-router-dom'

/**
 * Hook to auto-fill component inputs from URL query parameters.
 * Implements Blueprint Requirement 2.4 (Level 1: L1 Deep Linking).
 * Enables seamless transition from AI Assistant chat into full interactive tools.
 *
 * @param {Object} defaultValues - Map of param names to their default values
 * @returns {Object} Object containing initial values (either from URL params or defaults)
 */
export function useAutoFillParams(defaultValues = {}) {
  try {
    const [searchParams] = useSearchParams()
    const resolved = {}

    for (const [key, fallback] of Object.entries(defaultValues)) {
      const val = searchParams.get(key)
      resolved[key] = val !== null && val !== undefined && val !== '' ? val : fallback
    }

    return resolved
  } catch {
    // Graceful fallback for non-browser or non-Router environments (e.g. testing)
    return defaultValues
  }
}

export default useAutoFillParams
