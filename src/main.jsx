import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Lenis from '@studio-freight/lenis'
import './index.css'
import App from './App.jsx'

function Root() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1,
    })

    let frameId = 0
    const root = document.documentElement
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function handlePointerMove(event) {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      targetX = nx * 14
      targetY = ny * 12
    }

    function handlePointerLeave() {
      targetX = 0
      targetY = 0
    }

    function raf(time) {
      lenis.raf(time)
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      const scrollOffset = Math.max(-20, -window.scrollY * 0.03)
      root.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`)
      root.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`)
      root.style.setProperty('--parallax-scroll', `${scrollOffset.toFixed(2)}px`)

      frameId = requestAnimationFrame(raf)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true })

    frameId = requestAnimationFrame(raf)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      cancelAnimationFrame(frameId)
      lenis.destroy()
      root.style.removeProperty('--parallax-x')
      root.style.removeProperty('--parallax-y')
      root.style.removeProperty('--parallax-scroll')
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
