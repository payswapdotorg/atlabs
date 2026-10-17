import { useEffect } from 'react'

/**
 * Sets the browser tab title while the calling page is mounted,
 * restoring nothing on unmount (each page sets its own title).
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
