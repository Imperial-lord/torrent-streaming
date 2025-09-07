import { useState, useEffect } from 'react'

/**
 * Custom hook for managing fullscreen state and controls
 * @param {React.RefObject} elementRef - Ref to the element to make fullscreen
 * @returns {object} - { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen }
 */
export default function useFullscreen(elementRef) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = async () => {
    if (!elementRef.current) return
    try {
      if (elementRef.current.requestFullscreen) {
        await elementRef.current.requestFullscreen()
      } else if (elementRef.current.webkitRequestFullscreen) {
        await elementRef.current.webkitRequestFullscreen()
      } else if (elementRef.current.msRequestFullscreen) {
        await elementRef.current.msRequestFullscreen()
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  // Listen for fullscreen changes (user pressing ESC, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
