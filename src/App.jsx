import { useEffect, useRef, useState } from 'react'

const ROUTES = {
  home: '/',
  worlds: '/mundos',
  applied: '/aplicados',
  contact: '/contato',
}

const KNOWN_ROUTES = new Set(Object.values(ROUTES))

const normalizePath = (rawPath = '/') => {
  const [withoutHash] = rawPath.split('#')
  const [withoutQuery] = withoutHash.split('?')
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '')
  return withoutTrailingSlash || '/'
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname || '/'))
  const mapaRef = useRef(null)
  const manifestoRef = useRef(null)
  const senseFieldRef = useRef(null)
  const [activeManifestoNode, setActiveManifestoNode] = useState('')
  const [manifestoUnlocked, setManifestoUnlocked] = useState([])
  const [manifestoSignals, setManifestoSignals] = useState({
    'balloons-main': 0,
    'balloons-fragment': 0,
    'silent-author': 0,
  })
  const [manifestoField, setManifestoField] = useState({
    x: 50,
    y: 50,
    presence: 0,
  })
  const manifestoRafRef = useRef(0)
  const manifestoPointerRef = useRef({ x: 0, y: 0 })
  const mapaInteractionRef = useRef({
    handlePointerMove: () => {},
    handlePointerEnter: () => {},
    handlePointerLeave: () => {},
  })
  const manifestoFragments = {
    'balloons-main':
      'Eu não começo um projeto pela forma.\nComeço pela sensação que ele precisa provocar.\n\nAntes do desenho, vêm a atmosfera, a luz, a cor, a matéria.\nA forma aparece depois, como consequência.',
    'balloons-fragment':
      'Não me interessa criar espaços que só sejam vistos.\nMe interessa criar experiências que mudem a percepção de quem entra.',
    'silent-author': 'Cada projeto nasce de um estado.\nDepois, esse estado vira matéria, contraste, escala, textura e vazio.\n\nPara mim, arquitetura não termina na função.\nEla começa no que consegue provocar.',
  }
  const manifestoNodeOrder = ['balloons-main', 'balloons-fragment', 'silent-author']
  const projectGroups = [
    {
      title: 'Mundos autorais',
      tone: 'worlds',
      items: [
        {
          name: 'Solaris',
          bridge: 'Cada projeto nasce de uma sensação.',
          words: ['Luz natural', 'Linhas geométricas', 'Início da expansão'],
          image: '/images/worlds/solaris/01_solaris_living_room.jpg.png',
          extraImage: '/images/worlds/solaris/02_solaris_gallery_wall.jpg.png',
        },
        {
          name: 'Sense',
          bridge: 'Perceber é aproximar.',
          entry: 'o espaço responde à presença',
          words: ['Proximidade', 'Tensão', 'Silêncio'],
          images: ['/images/worlds/sense/10%20sense.png', '/images/worlds/sense/11%20sense.png'],
        },
        {
          name: 'Isola',
          bridge: 'o espaço se recolhe em si',
          entry: 'Depois da explosão, tudo encontra um limite.',
          words: ['silêncio contido ⟶ matéria suspensa ⟶ presença isolada'],
          image: '/images/worlds/isola/isola%2001.png',
        },
      ],
    },
  ]
  const appliedProjectsGroup = {
    title: 'Arquitetura aplicada',
    tone: 'applied',
    items: [
      {
        name: 'Apê E-L',
        bridge: 'um espaço cotidiano atravessado por atmosfera',
        words: [
          'luz que acompanha o uso',
          'materiais que organizam o silêncio',
          'presença que se constrói no dia a dia',
        ],
        introVideo: '/images/applied/ape-el/ollie_att.mp4',
        images: [
          '/images/applied/ape-el/68.jpg',
          '/images/applied/ape-el/70.png.jpg',
          '/images/applied/ape-el/73.jpg',
          '/images/applied/ape-el/77.jpg',
          '/images/applied/ape-el/90.png',
        ],
      },
      {
        name: 'HOME OFFICE I-G',
        bridge: 'cor e superfície como estrutura',
        words: ['planos sobrepostos, ritmo visual intenso, identidade que ocupa o espaço'],
        images: [
          '/images/applied/home-office-ig/80.png',
          '/images/applied/home-office-ig/81.png',
          '/images/applied/home-office-ig/82.png',
          '/images/applied/home-office-ig/83.png',
          '/images/applied/home-office-ig/84.png',
          '/images/applied/home-office-ig/85.png',
        ],
      },
    ],
  }
  const isWorldsRoute = currentPath === ROUTES.worlds
  const isAppliedRoute = currentPath === ROUTES.applied
  const isContactRoute = currentPath === ROUTES.contact
  const isProjectsRoute = isWorldsRoute || isAppliedRoute

  const renderProjectTitle = (projectName) => {
    if (projectName !== 'HOME OFFICE I-G') return projectName
    return projectName.split('').map((char, index) => (
      <span key={`${projectName}-${index}`} className={`title-letter${char === ' ' ? ' is-space' : ''}`}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  const navigateTo = (path) => {
    const normalizedPath = normalizePath(path)
    const destination = KNOWN_ROUTES.has(normalizedPath) ? normalizedPath : ROUTES.home
    if (window.location.pathname === destination) return
    window.history.pushState({}, '', destination)
    setCurrentPath(destination)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToHomeMapa = () => {
    const scrollToMapa = () => {
      const mapaStage = document.querySelector('.mapa-stage')
      if (!mapaStage) return false
      mapaStage.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    }

    if (currentPath === ROUTES.home) {
      scrollToMapa()
      return
    }

    navigateTo(ROUTES.home)
    let attempts = 0
    const maxAttempts = 18
    const tick = () => {
      attempts += 1
      if (scrollToMapa() || attempts >= maxAttempts) return
      window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
  }
  const activateManifestoNode = (node) => {
    setActiveManifestoNode(node)
    setManifestoUnlocked((prev) => (prev.includes(node) ? prev : [...prev, node]))
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

  const updateManifestoSignals = () => {
    manifestoRafRef.current = 0
    const stage = manifestoRef.current
    if (!stage) return

    const rect = stage.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const { x, y } = manifestoPointerRef.current
    const relX = clamp(((x - rect.left) / rect.width) * 100, 0, 100)
    const relY = clamp(((y - rect.top) / rect.height) * 100, 0, 100)
    const nodes = Array.from(stage.querySelectorAll('.manifesto-point'))
    let strongest = 0
    const nextSignals = {
      'balloons-main': 0,
      'balloons-fragment': 0,
      'silent-author': 0,
    }

    nodes.forEach((node) => {
      const key = node.dataset.node
      if (!key) return
      const nodeRect = node.getBoundingClientRect()
      const cx = nodeRect.left + nodeRect.width * 0.5
      const cy = nodeRect.top + nodeRect.height * 0.5
      const dist = Math.hypot(x - cx, y - cy)
      const radius = Math.max(nodeRect.width, nodeRect.height) * 1.1 + 140
      const signal = clamp(1 - dist / radius, 0, 1)
      nextSignals[key] = Number(signal.toFixed(3))
      if (signal > strongest) strongest = signal
    })

    setManifestoSignals(nextSignals)
    setManifestoField({
      x: Number(relX.toFixed(2)),
      y: Number(relY.toFixed(2)),
      presence: Number(strongest.toFixed(3)),
    })
  }

  const handleManifestoMove = (event) => {
    manifestoPointerRef.current = { x: event.clientX, y: event.clientY }
    if (manifestoRafRef.current) return
    manifestoRafRef.current = window.requestAnimationFrame(updateManifestoSignals)
  }

  const handleManifestoLeave = () => {
    if (manifestoRafRef.current) {
      window.cancelAnimationFrame(manifestoRafRef.current)
      manifestoRafRef.current = 0
    }
    setManifestoSignals({
      'balloons-main': 0,
      'balloons-fragment': 0,
      'silent-author': 0,
    })
    setManifestoField({ x: 50, y: 50, presence: 0 })
  }

  useEffect(() => {
    const handlePopState = () => {
      const normalizedPath = normalizePath(window.location.pathname || '/')
      if (!KNOWN_ROUTES.has(normalizedPath)) {
        window.history.replaceState({}, '', ROUTES.home)
        setCurrentPath(ROUTES.home)
        return
      }
      if (window.location.pathname !== normalizedPath) {
        window.history.replaceState({}, '', normalizedPath)
      }
      setCurrentPath(normalizedPath)
    }

    handlePopState()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('is-worlds', isProjectsRoute)
    document.body.classList.toggle('is-contact', isContactRoute)
    return () => {
      document.body.classList.remove('is-worlds')
      document.body.classList.remove('is-contact')
    }
  }, [isProjectsRoute, isContactRoute])

  useEffect(() => {
    if (!isWorldsRoute) return undefined

    let rafId = 0
    let currentX = 0
    let currentY = 0
    let currentScroll = 0
    let targetX = 0
    let targetY = 0
    let targetScroll = 0

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

    const updateMouseTarget = (event) => {
      targetX = clamp(((event.clientX / window.innerWidth) - 0.5) * 2, -1, 1)
      targetY = clamp(((event.clientY / window.innerHeight) - 0.5) * 2, -1, 1)
    }

    const updateScrollTarget = () => {
      targetScroll = clamp(((window.scrollY / Math.max(window.innerHeight, 1)) - 0.45) * 0.9, -1, 1)
    }

    const tick = (time) => {
      currentX += (targetX - currentX) * 0.075
      currentY += (targetY - currentY) * 0.075
      currentScroll += (targetScroll - currentScroll) * 0.075
      const float = Math.sin(time * 0.0011)

      const node = senseFieldRef.current
      if (node) {
        node.style.setProperty('--sense-mouse-x', currentX.toFixed(3))
        node.style.setProperty('--sense-mouse-y', currentY.toFixed(3))
        node.style.setProperty('--sense-scroll', currentScroll.toFixed(3))
        node.style.setProperty('--sense-float', float.toFixed(3))
      }

      rafId = window.requestAnimationFrame(tick)
    }

    updateScrollTarget()
    window.addEventListener('mousemove', updateMouseTarget, { passive: true })
    window.addEventListener('scroll', updateScrollTarget, { passive: true })
    rafId = window.requestAnimationFrame(tick)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', updateMouseTarget)
      window.removeEventListener('scroll', updateScrollTarget)
    }
  }, [isWorldsRoute])

  useEffect(() => {
    if (isWorldsRoute) return undefined
    const stage = mapaRef.current
    if (!stage) return undefined

    const points = Array.from(stage.querySelectorAll('.mapa-point'))
    const lines = Array.from(stage.querySelectorAll('.mapa-line'))
    if (!points.length) return undefined

    const coarseQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    let rafId = 0
    let pointerX = 0
    let pointerY = 0
    let pointerInside = false
    let pointCenters = []
    let currentCursorX = 0
    let currentCursorY = 0
    let currentPresence = 0
    let targetCursorX = 0
    let targetCursorY = 0
    let targetPresence = 0

    const baseNear = (point) => (point.classList.contains('is-primary') ? 0.56 : 0.14)
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
    const nearByPoint = new Map(points.map((point) => [point, baseNear(point)]))

    const updateCursorField = () => {
      currentCursorX += (targetCursorX - currentCursorX) * 0.08
      currentCursorY += (targetCursorY - currentCursorY) * 0.08
      currentPresence += (targetPresence - currentPresence) * 0.1

      stage.style.setProperty('--cursor-x', currentCursorX.toFixed(3))
      stage.style.setProperty('--cursor-y', currentCursorY.toFixed(3))
      stage.style.setProperty('--cursor-presence', currentPresence.toFixed(3))
    }

    const updateCursorTargets = (presence = 0) => {
      const rect = stage.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const nx = clamp(((pointerX - rect.left) / rect.width - 0.5) * 2, -1, 1)
      const ny = clamp(((pointerY - rect.top) / rect.height - 0.5) * 2, -1, 1)

      targetCursorX = nx
      targetCursorY = ny
      targetPresence = presence
    }

    const resetCursorField = () => {
      targetCursorX = 0
      targetCursorY = 0
      targetPresence = 0
    }

    const measurePoints = () => {
      pointCenters = points.map((point) => {
        const rect = point.getBoundingClientRect()
        return {
          cx: rect.left + rect.width * 0.5,
          cy: rect.top + rect.height * 0.5,
        }
      })
    }

    const clearActive = () => {
      stage.classList.remove('is-active')
      stage.removeAttribute('data-active-node')
      lines.forEach((line) => line.classList.remove('is-related'))
      points.forEach((point) => {
        point.classList.remove('is-active')
        const base = baseNear(point)
        nearByPoint.set(point, base)
        point.style.setProperty('--near', String(base))
      })
      resetCursorField()
      updateCursorField()
    }

    const setStaticState = () => {
      stage.classList.add('mapa-static')
      clearActive()
    }

    const setInteractiveState = () => {
      stage.classList.remove('mapa-static')
      points.forEach((point) => {
        const base = baseNear(point)
        nearByPoint.set(point, base)
        point.style.setProperty('--near', String(base))
      })
      resetCursorField()
      updateCursorField()
      measurePoints()
    }

    const updateByPointer = () => {
      rafId = 0
      if (stage.classList.contains('mapa-static')) return

      const radius = 260
      let maxNearDelta = 0
      let nearestPoint = null
      let nearestDistance = Number.POSITIVE_INFINITY

      if (!pointCenters.length) {
        measurePoints()
      }

      points.forEach((point, index) => {
        const base = baseNear(point)
        let targetNear = base
        let distance = Number.POSITIVE_INFINITY

        if (pointerInside && pointCenters[index]) {
          const { cx, cy } = pointCenters[index]
          distance = Math.hypot(pointerX - cx, pointerY - cy)
          targetNear = Math.max(base, 1 - distance / radius)
        }

        const currentNear = nearByPoint.get(point) ?? base
        const nextNear = currentNear + (targetNear - currentNear) * 0.16
        nearByPoint.set(point, nextNear)
        point.style.setProperty('--near', nextNear.toFixed(3))
        maxNearDelta = Math.max(maxNearDelta, Math.abs(nextNear - targetNear))

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestPoint = point
        }
      })

      points.forEach((point) => point.classList.remove('is-active'))
      lines.forEach((line) => line.classList.remove('is-related'))

      if (pointerInside && nearestPoint && nearestDistance < radius) {
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

      if (pointerInside) {
        const presence = Number.isFinite(nearestDistance)
          ? Math.max(0, 1 - nearestDistance / (radius * 1.25))
          : 0
        updateCursorTargets(presence)
      } else {
        resetCursorField()
      }

      updateCursorField()

      const cursorSettled =
        Math.abs(currentCursorX - targetCursorX) < 0.002 &&
        Math.abs(currentCursorY - targetCursorY) < 0.002 &&
        Math.abs(currentPresence - targetPresence) < 0.002

      if (pointerInside || maxNearDelta > 0.002 || !cursorSettled) {
        rafId = requestAnimationFrame(updateByPointer)
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
      measurePoints()
      pointerInside = true
      pointerX = event.clientX
      pointerY = event.clientY
      scheduleUpdate()
    }

    const handlePointerLeave = () => {
      pointerInside = false
      scheduleUpdate()
    }

    const handleResize = () => {
      if (stage.classList.contains('mapa-static')) return
      measurePoints()
    }

    const handleQueryChange = (event) => {
      if (event.matches) {
        pointerInside = false
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
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

    mapaInteractionRef.current = {
      handlePointerMove,
      handlePointerEnter,
      handlePointerLeave,
    }

    window.addEventListener('resize', handleResize)
    coarseQuery.addEventListener('change', handleQueryChange)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      mapaInteractionRef.current = {
        handlePointerMove: () => {},
        handlePointerEnter: () => {},
        handlePointerLeave: () => {},
      }
      window.removeEventListener('resize', handleResize)
      coarseQuery.removeEventListener('change', handleQueryChange)
    }
  }, [isWorldsRoute])

  if (isContactRoute) {
    return (
      <main className="temple temple--contact">
        <section className="contact-epilogue" aria-label="Contato">
          <div className="contact-epilogue__symbol" aria-hidden="true" />
          <button
            type="button"
            className="page-back-btn"
            onClick={navigateToHomeMapa}
            aria-label="Voltar para o mapa"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="contact-epilogue__content">
            <p className="contact-epilogue__lead">
              Se você chegou até aqui, a gente pode construir algo juntos.
            </p>

            <ul className="contact-epilogue__links" aria-label="canais de contato">
              <li>
                <a href="mailto:eloisa.o.claudino@gmail.com">
                  <svg
                    className="contact-link__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M3.75 6.75h16.5a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-9a.75.75 0 0 1 .75-.75Zm.86 1.5L12 13.41l7.39-5.16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="contact-link__label">Email</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/arqeloisaottonicar/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    className="contact-link__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect
                      x="4.25"
                      y="4.25"
                      width="15.5"
                      height="15.5"
                      rx="4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="16.8" cy="7.2" r="0.95" fill="currentColor" />
                  </svg>
                  <span className="contact-link__label">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.link/al1qf2"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    className="contact-link__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M12 3.75a8.25 8.25 0 0 0-7.06 12.5L4 20.25l4.17-.87A8.25 8.25 0 1 0 12 3.75Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.35 9.12c.22-.5.45-.52.66-.52h.56c.1 0 .26.04.39.3.13.26.44 1.08.48 1.16.04.09.07.2.01.31-.06.11-.09.18-.18.28-.09.1-.18.22-.26.3-.09.09-.18.19-.08.37.1.18.43.71.93 1.15.64.56 1.17.73 1.35.81.18.08.29.07.4-.04.11-.11.45-.52.57-.7.12-.18.24-.15.4-.09.17.06 1.06.5 1.24.59.18.09.3.13.34.21.04.08.04.48-.17.94-.2.46-1.18.91-1.62.97-.41.06-.95.09-2.74-.72-2.16-.99-3.52-3.4-3.62-3.54-.1-.14-.87-1.15-.87-2.2 0-1.05.55-1.56.75-1.78Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="contact-link__label">WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    )
  }

  if (isProjectsRoute) {
    const visibleGroups = isWorldsRoute ? projectGroups : [appliedProjectsGroup]
    return (
      <main className="temple temple--worlds">
        <button
          type="button"
          className="page-back-btn"
          onClick={navigateToHomeMapa}
          aria-label="Voltar para o mapa"
        >
          <span aria-hidden="true">←</span>
        </button>
        <section className="projects-journey projects-journey--page" aria-label="projetos">
          {visibleGroups.map((group) => (
            <section
              key={group.title}
              className={`projects-group projects-group--${group.tone}`}
              aria-label={group.title}
            >
              {group.chapterLead ? (
                <p className="projects-chapter-turn">{group.chapterLead}</p>
              ) : null}
              {isWorldsRoute ? (
                <p
                  className="projects-group-label projects-group-label--worlds"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigateTo(ROUTES.home)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigateTo(ROUTES.home)
                    }
                  }}
                  aria-label="Voltar para a página inicial"
                >
                  ARQUITETURA AUTORAL
                </p>
              ) : null}
              {isAppliedRoute ? (
                <p
                  className="projects-group-label projects-group-label--applied"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigateTo(ROUTES.home)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigateTo(ROUTES.home)
                    }
                  }}
                  aria-label="Voltar para a página inicial"
                >
                  {group.title}
                </p>
              ) : null}
              <div className="projects-stream">
                {group.items.map((project) => (
                  <article
                    key={project.name}
                    className={`project-field project-field--${project.name.toLowerCase().replaceAll(' ', '-')}${
                      project.name === 'Solaris' ? ' is-entry-world' : ''
                    }${project.introVideo ? ' has-intro-video' : ''}${
                      isAppliedRoute && project.name === 'Apê E-L' ? ' has-image-caption' : ''
                    }`}
                    ref={project.name === 'Sense' ? senseFieldRef : null}
                  >
                    {project.images && project.name === 'Sense' ? (
                      <div className="project-field__media project-field__media--diptych">
                        {project.images.map((imageSrc, index) => (
                          <img
                            key={`${project.name}-${index}`}
                            src={imageSrc}
                            alt={`${project.name} ${index + 1}`}
                            loading="lazy"
                            decoding="async"
                          />
                        ))}
                      </div>
                    ) : project.images ? (
                      <div className="project-field__media project-field__media--stack">
                        {project.introVideo ? (
                          <div className="project-field__intro-video-wrap">
                            <video
                              className="project-field__media-intro-video"
                              src={project.introVideo}
                              poster="/images/applied/ape-el/OLLIE.jpeg"
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="auto"
                              aria-label={`Vídeo de abertura ${project.name}`}
                            />
                          </div>
                        ) : null}
                        {project.images.map((imageSrc, index) => (
                          <div key={`${project.name}-${index}`} className="project-image-frame">
                            <img
                              src={imageSrc}
                              alt={`${project.name} ${index + 1}`}
                              loading="lazy"
                              decoding="async"
                            />
                            {isAppliedRoute && project.name === 'Apê E-L' && index === 0 ? (
                              <div className="project-image-caption">
                                <h4 data-title={project.name}>{project.name}</h4>
                                {project.bridge ? <p className="project-field__bridge">{project.bridge}</p> : null}
                                <ul aria-label={`sensações de ${project.name}`}>
                                  {project.words.map((word) => (
                                    <li key={word}>{word}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="project-field__media">
                        <img src={project.image} alt={project.name} loading="lazy" decoding="async" />
                        {project.extraImage ? (
                          <img
                            className="project-field__extra-image"
                            src={project.extraImage}
                            alt={`${project.name} detalhe`}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                    )}
                    <div className="project-field__veil" aria-hidden="true"></div>
                    <div className="project-field__content">
                      <h4
                        data-title={project.name}
                        className={project.name === 'HOME OFFICE I-G' ? 'project-title--letters' : undefined}
                      >
                        {renderProjectTitle(project.name)}
                      </h4>
                      {project.bridge ? <p className="project-field__bridge">{project.bridge}</p> : null}
                      {project.entry ? <p className="project-field__entry">{project.entry}</p> : null}
                      <ul aria-label={`sensações de ${project.name}`}>
                        {project.words.map((word) => (
                          <li key={word}>{word}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>
    )
  }

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

      <p className="author-divider author-divider-top">Eloisa Ottonicar</p>

      <section
        className="mapa-stage"
        ref={mapaRef}
        aria-label="mapa da travessia"
        onPointerMove={(event) => mapaInteractionRef.current.handlePointerMove(event)}
        onPointerEnter={(event) => mapaInteractionRef.current.handlePointerEnter(event)}
        onPointerLeave={() => mapaInteractionRef.current.handlePointerLeave()}
        onMouseMove={(event) => mapaInteractionRef.current.handlePointerMove(event)}
        onMouseEnter={(event) => mapaInteractionRef.current.handlePointerEnter(event)}
        onMouseLeave={() => mapaInteractionRef.current.handlePointerLeave()}
      >
        <header className="mapa-header">
          <h2 className="mapa-title">mapa da travessia</h2>
          <p className="mapa-subtitle">
            coordenadas de visão, mundos e sistema
          </p>
          <p className="mapa-signature">Eloisa Ottonicar - Arquitetura Narrativa</p>
        </header>
        <span className="mapa-strike-image" aria-hidden="true"></span>

        <div className="mapa-canvas">
          <span className="mapa-layer layer-far" aria-hidden="true"></span>
          <span className="mapa-layer layer-mid-a" aria-hidden="true"></span>
          <span className="mapa-layer layer-mid-b" aria-hidden="true"></span>
          <span className="mapa-layer layer-grid" aria-hidden="true"></span>
          <span className="mapa-core core-rift" aria-hidden="true"></span>
          <span className="mapa-core core-orbit" aria-hidden="true"></span>
          <span className="mapa-core core-pulse" aria-hidden="true"></span>
          <span className="mapa-line line-1" aria-hidden="true"></span>
          <span className="mapa-line line-2" aria-hidden="true"></span>
          <span className="mapa-line line-3" aria-hidden="true"></span>
          <span className="mapa-line line-4" aria-hidden="true"></span>

          <article
            className="mapa-point p-1 mapa-point--portal"
            data-node="p1"
            data-links="line-1"
            role="link"
            tabIndex={0}
            onClick={() => navigateTo(ROUTES.worlds)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateTo(ROUTES.worlds)
              }
            }}
            aria-label="Abrir página Mundos"
          >
            <h3>Mundos</h3>
            <p>universos em órbita</p>
          </article>
          <article
            className="mapa-point p-2 mapa-point--portal"
            data-node="p2"
            data-links="line-1 line-2"
            role="link"
            tabIndex={0}
            onClick={() => navigateTo(ROUTES.applied)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateTo(ROUTES.applied)
              }
            }}
            aria-label="Abrir página Arquitetura aplicada"
          >
            <h3>No real</h3>
            <p>Quando a narrativa encontra o real</p>
          </article>
          <article
            className="mapa-point p-6 mapa-point--portal"
            data-node="p6"
            data-links="line-4"
            role="link"
            tabIndex={0}
            onClick={() => navigateTo(ROUTES.contact)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateTo(ROUTES.contact)
              }
            }}
            aria-label="Abrir página Contato"
          >
            <h3>Contato</h3>
            <p>ponto de aproximação</p>
          </article>
        </div>
      </section>

      <section
        ref={manifestoRef}
        className={`manifesto-experience${activeManifestoNode ? ` is-engaged is-${activeManifestoNode}` : ''}`}
        aria-label="abertura imersiva do manifesto"
        onMouseMove={handleManifestoMove}
        onMouseEnter={handleManifestoMove}
        onMouseLeave={handleManifestoLeave}
        style={{
          '--manifesto-cursor-x': `${manifestoField.x}%`,
          '--manifesto-cursor-y': `${manifestoField.y}%`,
          '--manifesto-presence': manifestoField.presence,
        }}
      >
        <figure className="manifesto-experience__base">
          <img
            src="/images/FOTOS 2/balao.png"
            alt="Eloisa entre baloes coloridos"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </figure>

        <div className="manifesto-experience__veil" aria-hidden="true"></div>
        <div className="manifesto-experience__night-layer" aria-hidden="true"></div>
        <div className="manifesto-experience__mesh" aria-hidden="true"></div>

        <h2 className="manifesto-experience__line">
          Antes da forma,
          <br />
          existe atmosfera.
        </h2>
        <p className="manifesto-experience__subtitle">Manifesto por Eloísa Ottonicar</p>

        <button
          type="button"
          className={`manifesto-point manifesto-point--main manifesto-point--primary${
            activeManifestoNode === 'balloons-main' ? ' is-active' : ''
          }${activeManifestoNode && activeManifestoNode !== 'balloons-main' ? ' is-muted' : ''}${
            manifestoSignals['balloons-main'] > 0.12 ? ' is-awake' : ''
          }`}
          data-node="balloons-main"
          onClick={() => activateManifestoNode('balloons-main')}
          onPointerDown={() => activateManifestoNode('balloons-main')}
          aria-label="ativar fragmento autora nos baloes"
          style={{ '--signal': manifestoSignals['balloons-main'] }}
        >
          <span className="manifesto-point__core" aria-hidden="true"></span>
          <span className="manifesto-point__order" aria-hidden="true">01°</span>
        </button>

        <button
          type="button"
          className={`manifesto-point manifesto-point--fragment manifesto-point--secondary${
            activeManifestoNode === 'balloons-fragment' ? ' is-active' : ''
          }${activeManifestoNode && activeManifestoNode !== 'balloons-fragment' ? ' is-muted' : ''}${
            manifestoSignals['balloons-fragment'] > 0.12 ? ' is-awake' : ''
          }`}
          data-node="balloons-fragment"
          onClick={() => activateManifestoNode('balloons-fragment')}
          onPointerDown={() => activateManifestoNode('balloons-fragment')}
          aria-label="ativar fragmento dos baloes"
          style={{ '--signal': manifestoSignals['balloons-fragment'] }}
        >
          <span className="manifesto-point__core" aria-hidden="true"></span>
          <span className="manifesto-point__order" aria-hidden="true">02°</span>
        </button>

        <button
          type="button"
          className={`manifesto-point manifesto-point--silent manifesto-point--secondary${
            activeManifestoNode === 'silent-author' ? ' is-active' : ''
          }${activeManifestoNode && activeManifestoNode !== 'silent-author' ? ' is-muted' : ''}${
            manifestoSignals['silent-author'] > 0.12 ? ' is-awake' : ''
          }`}
          data-node="silent-author"
          onClick={() => activateManifestoNode('silent-author')}
          onPointerDown={() => activateManifestoNode('silent-author')}
          aria-label="ativar fragmento intimidade"
          style={{ '--signal': manifestoSignals['silent-author'] }}
        >
          <span className="manifesto-point__core" aria-hidden="true"></span>
          <span className="manifesto-point__order" aria-hidden="true">03°</span>
        </button>

        <div
          className={`manifesto-reveal${manifestoUnlocked.length ? ' is-visible' : ''}`}
          aria-live="polite"
          data-lenis-prevent
          data-lenis-prevent-wheel
          onWheelCapture={(event) => {
            const el = event.currentTarget
            if (el.scrollHeight <= el.clientHeight) return
            el.scrollTop += event.deltaY
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <div className="manifesto-reveal__stack">
            {manifestoNodeOrder
              .filter((node) => manifestoUnlocked.includes(node))
              .map((node) => (
              <p
                key={node}
                className={`manifesto-reveal__fragment${activeManifestoNode === node ? ' is-current' : ''}`}
              >
                {manifestoFragments[node]}
              </p>
              ))}
          </div>
        </div>
      </section>

    </main>
  )
}

export default App
