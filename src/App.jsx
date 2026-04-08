import { useEffect, useRef } from 'react'

function App() {
  const mapaRef = useRef(null)

  useEffect(() => {
    const stage = mapaRef.current
    if (!stage) return undefined

    const points = Array.from(stage.querySelectorAll('.mapa-point'))
    const lines = Array.from(stage.querySelectorAll('.mapa-line'))
    if (!points.length) return undefined

    const coarseQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    let rafId = 0
    let pointerX = 0
    let pointerY = 0
    const baseNear = (point) => (point.classList.contains('is-primary') ? 0.56 : 0.14)

    const clearActive = () => {
      stage.classList.remove('is-active')
      stage.removeAttribute('data-active-node')
      lines.forEach((line) => line.classList.remove('is-related'))
      points.forEach((point) => {
        point.classList.remove('is-active')
        point.style.setProperty('--near', String(baseNear(point)))
      })
    }

    const setStaticState = () => {
      stage.classList.add('mapa-static')
      clearActive()
    }

    const setInteractiveState = () => {
      stage.classList.remove('mapa-static')
      points.forEach((point) => point.style.setProperty('--near', String(baseNear(point))))
    }

    const updateByPointer = () => {
      rafId = 0
      if (stage.classList.contains('mapa-static')) return

      const radius = 260
      let nearestPoint = null
      let nearestDistance = Number.POSITIVE_INFINITY

      points.forEach((point) => {
        const rect = point.getBoundingClientRect()
        const cx = rect.left + rect.width * 0.5
        const cy = rect.top + rect.height * 0.5
        const distance = Math.hypot(pointerX - cx, pointerY - cy)
        const near = Math.max(0, 1 - distance / radius)

        point.style.setProperty('--near', near.toFixed(3))

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestPoint = point
        }
      })

      points.forEach((point) => point.classList.remove('is-active'))
      lines.forEach((line) => line.classList.remove('is-related'))

      if (nearestPoint && nearestDistance < radius) {
        nearestPoint.classList.add('is-active')
        stage.classList.add('is-active')
        const nodeId = nearestPoint.dataset.node || ''
        if (nodeId) stage.setAttribute('data-active-node', nodeId)
        const related = (nearestPoint.dataset.links || '')
          .split(' ')
          .map((item) => item.trim())
          .filter(Boolean)

        if (related.length) {
          lines.forEach((line) => {
            const isRelated = related.some((token) => line.classList.contains(token))
            line.classList.toggle('is-related', isRelated)
          })
        }
      } else {
        stage.classList.remove('is-active')
        stage.removeAttribute('data-active-node')
      }
    }

    const scheduleUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(updateByPointer)
    }

    const handlePointerMove = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      scheduleUpdate()
    }

    const handlePointerEnter = (event) => {
      if (stage.classList.contains('mapa-static')) return
      pointerX = event.clientX
      pointerY = event.clientY
      scheduleUpdate()
    }

    const handlePointerLeave = () => {
      clearActive()
    }

    const handleQueryChange = (event) => {
      if (event.matches) {
        setStaticState()
      } else {
        setInteractiveState()
      }
    }

    if (coarseQuery.matches) {
      setStaticState()
    } else {
      setInteractiveState()
    }

    stage.addEventListener('pointermove', handlePointerMove, { passive: true })
    stage.addEventListener('pointerenter', handlePointerEnter, { passive: true })
    stage.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    coarseQuery.addEventListener('change', handleQueryChange)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      stage.removeEventListener('pointermove', handlePointerMove)
      stage.removeEventListener('pointerenter', handlePointerEnter)
      stage.removeEventListener('pointerleave', handlePointerLeave)
      coarseQuery.removeEventListener('change', handleQueryChange)
    }
  }, [])

  return (
    <main className="temple">
      <section className="hero-stage" aria-label="Abertura do site">
        <span className="hero-orbit orbit-a" aria-hidden="true"></span>
        <span className="hero-orbit orbit-b" aria-hidden="true"></span>
        <span className="hero-trace trace-a" aria-hidden="true"></span>
        <span className="hero-trace trace-b" aria-hidden="true"></span>

        <section className="hero">
          <h1 className="hero-title">
            <img
              className="hero-title-image"
              src="/images/hero/hero-title.png"
              alt="alguns ESPAÇOS se VISITAM OUTROS se ATRAVESSAM"
            />
          </h1>
        </section>
      </section>

      <section className="mapa-stage" ref={mapaRef} aria-label="mapa da travessia">
        <header className="mapa-header">
          <h2 className="mapa-title">mapa da travessia</h2>
          <p className="mapa-subtitle">
            coordenadas de visão, mundos e sistema
          </p>
        </header>

        <div className="mapa-canvas">
          <span className="mapa-line line-1" aria-hidden="true"></span>
          <span className="mapa-line line-2" aria-hidden="true"></span>
          <span className="mapa-line line-3" aria-hidden="true"></span>
          <span className="mapa-line line-4" aria-hidden="true"></span>

          <article className="mapa-point p-1" data-node="p1" data-links="line-1">
            <h3>Visão</h3>
            <p>a tese que orienta tudo</p>
          </article>
          <article className="mapa-point p-2" data-node="p2" data-links="line-1 line-2">
            <h3>Mundos</h3>
            <p>universos em órbita</p>
          </article>
          <article className="mapa-point p-3 is-primary" data-node="p3" data-links="line-2">
            <h3>Rupture World</h3>
            <p>núcleo de linguagem</p>
          </article>
          <article className="mapa-point p-4" data-node="p4" data-links="line-3">
            <h3>Processo</h3>
            <p>onde a ideia ganha forma</p>
          </article>
          <article className="mapa-point p-5" data-node="p5" data-links="line-3 line-4">
            <h3>LINEA</h3>
            <p>camada de leitura do sistema</p>
          </article>
          <article className="mapa-point p-6" data-node="p6" data-links="line-4">
            <h3>Contato</h3>
            <p>ponto de aproximação</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
