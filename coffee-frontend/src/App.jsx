import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Input from './components/Input/Input'
import Slider from './components/Slider/Slider'
import v60Img from './assets/v60.webp'
import './App.css'

const formatTime = (seconds) => {
  if (seconds === '' || Number.isNaN(Number(seconds))) {
    return ''
  }

  const total = Math.max(0, Math.round(Number(seconds)))
  if (total < 60) {
    return `${total}s`
  }
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}m${String(secs).padStart(2, '0')}s`
}

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const [activeTab, setActiveTab] = useState('sweet')
  const [lastEdited, setLastEdited] = useState('coffee')
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState('v60')
  const [coffee, setCoffee] = useState('')
  const [water, setWater] = useState('')
  const [time, setTime] = useState('')
  const [temp, setTemp] = useState('')
  const [ratio, setRatio] = useState(16)
  const segmentRef = useRef(null)
  const indicatorRef = useRef(null)
  const tabRefs = useRef([])
  const springRef = useRef({ x: 0, vx: 0, w: 0, vw: 0, raf: null })
  const requestIdRef = useRef(0)
  const loadingTimerRef = useRef(null)

  const beginRequest = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current)
    }
    loadingTimerRef.current = setTimeout(() => {
      setLoading(true)
    }, 100)
  }

  const endRequest = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current)
      loadingTimerRef.current = null
    }
    setLoading(false)
  }

  const resolveMode = () => activeTab
  const coffeePlaceholder = loading ? 'Загружаю' : 'Напр.18'
  const waterPlaceholder = loading ? 'Загружаю' : 'Напр.250'
  const showEmptyState = coffee.trim() === '' && water.trim() === ''
  const statusPlaceholder = showEmptyState ? '-' : 'Загружаю'
  const sliderConfig =
    method === 'espresso'
      ? { min: 1.5, max: 3, step: 0.1 }
      : { min: 12, max: 18, step: 1 }

  const buildUrl = (path, params) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        search.append(key, String(val))
      }
    })
    return `${API_BASE}${path}?${search.toString()}`
  }

  const updateFromCoffee = async (value, ratioOverride) => {
    const num = Number(value)
    if (!value || Number.isNaN(num)) {
      setWater('')
      setTime('')
      setTemp('')
      return
    }

    const requestId = ++requestIdRef.current
    beginRequest()
    const mode = resolveMode()
    const ratioParam =
      mode === 'custom' ? ratioOverride ?? ratio : undefined
    const res = await fetch(
      buildUrl('/api/calc/coffee', {
        coffee: num,
        mode,
        ratio: ratioParam,
        method,
      })
    )
    if (!res.ok) {
      if (requestId === requestIdRef.current) {
        endRequest()
      }
      return
    }

    const data = await res.json()
    if (requestId === requestIdRef.current) {
      setCoffee(String(data.coffee))
      setWater(String(data.water))
      setTime(formatTime(data.time))
      setTemp(String(data.temp))
      if (data.ratio !== undefined) {
        setRatio(Number(data.ratio))
      }
      endRequest()
    }
  }

  const updateFromWater = async (value, ratioOverride) => {
    const num = Number(value)
    if (!value || Number.isNaN(num)) {
      setCoffee('')
      setTime('')
      setTemp('')
      return
    }

    const requestId = ++requestIdRef.current
    beginRequest()
    const mode = resolveMode()
    const ratioParam =
      mode === 'custom' ? ratioOverride ?? ratio : undefined
    const res = await fetch(
      buildUrl('/api/calc/water', {
        water: num,
        mode,
        ratio: ratioParam,
        method,
      })
    )
    if (!res.ok) {
      if (requestId === requestIdRef.current) {
        endRequest()
      }
      return
    }

    const data = await res.json()
    if (requestId === requestIdRef.current) {
      setCoffee(String(data.coffee))
      setWater(String(data.water))
      setTime(formatTime(data.time))
      setTemp(String(data.temp))
      if (data.ratio !== undefined) {
        setRatio(Number(data.ratio))
      }
      endRequest()
    }
  }

  useEffect(() => {
    setLastEdited('water')
    setWater('250')
    updateFromWater('250')
  }, [])

  useEffect(() => {
    const ratioParam = activeTab === 'custom' ? ratio : undefined
    if (lastEdited === 'water') {
      updateFromWater(water, ratioParam)
    } else {
      updateFromCoffee(coffee, ratioParam)
    }
  }, [activeTab])

  useEffect(() => {
    const ratioParam = activeTab === 'custom' ? ratio : undefined
    if (lastEdited === 'water') {
      updateFromWater(water, ratioParam)
    } else {
      updateFromCoffee(coffee, ratioParam)
    }
  }, [method])

  useEffect(() => {
    if (activeTab !== 'custom') return
    const nextRatio = method === 'espresso' ? 2 : 16
    setRatio(nextRatio)

    if (lastEdited === 'water' && water.trim() !== '') {
      updateFromWater(water, nextRatio)
      return
    }

    if (coffee.trim() !== '') {
      updateFromCoffee(coffee, nextRatio)
    }
  }, [method, activeTab])

  const handleRatioChange = (nextRatio) => {
    setRatio(nextRatio)
    if (activeTab !== 'custom') return

    if (coffee.trim() !== '') {
      setLastEdited('coffee')
      updateFromCoffee(coffee, nextRatio)
      return
    }

    if (water.trim() !== '') {
      setLastEdited('water')
      updateFromWater(water, nextRatio)
    }
  }

  useLayoutEffect(() => {
    const segment = segmentRef.current
    const indicator = indicatorRef.current
    const activeIndex = ['sweet', 'balance', 'custom'].indexOf(activeTab)
    const activeButton = tabRefs.current[activeIndex]

    if (!segment || !indicator || !activeButton) return

    const segmentRect = segment.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    const targetX = buttonRect.left - segmentRect.left
    const targetW = buttonRect.width

    const state = springRef.current
    const stiffness = 300
    const damping = 20
    const mass = 1

    if (state.w === 0) {
      state.x = targetX
      state.w = targetW
      indicator.style.transform = `translateX(${state.x}px)`
      indicator.style.width = `${state.w}px`
      return
    }

    let last = performance.now()

    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000)
      last = now

      const ax =
        (-stiffness * (state.x - targetX) - damping * state.vx) / mass
      state.vx += ax * dt
      state.x += state.vx * dt

      const aw =
        (-stiffness * (state.w - targetW) - damping * state.vw) / mass
      state.vw += aw * dt
      state.w += state.vw * dt

      indicator.style.transform = `translateX(${state.x}px)`
      indicator.style.width = `${state.w}px`

      const settled =
        Math.abs(state.x - targetX) < 0.1 &&
        Math.abs(state.vx) < 0.1 &&
        Math.abs(state.w - targetW) < 0.1 &&
        Math.abs(state.vw) < 0.1

      if (settled) {
        state.x = targetX
        state.w = targetW
        state.vx = 0
        state.vw = 0
        indicator.style.transform = `translateX(${state.x}px)`
        indicator.style.width = `${state.w}px`
        state.raf = null
        return
      }

      state.raf = requestAnimationFrame(step)
    }

    if (state.raf) cancelAnimationFrame(state.raf)
    state.raf = requestAnimationFrame(step)
  }, [activeTab])

  return (
    <main className="page">
      <div className="unsupported">
        не поддерживается данный тип экранов
      </div>
      <div className="screen">
        <header className="header">
          <p className="app-name">AppName</p>
        </header>

        <section className="section">
          <h2 className="section__title">Способ приготовления</h2>
          <div className="methods">
            <button
              className={`method ${method === 'v60' ? 'method--active' : ''}`}
              type="button"
              onClick={() => setMethod('v60')}
            >
              <img className="method__image" src={v60Img} alt="Воронка V60" />
              <span className="method__label">Воронка V60</span>
            </button>
            <button
              className={`method ${method === 'espresso' ? 'method--active' : ''}`}
              type="button"
              onClick={() => setMethod('espresso')}
            >
              <span className="method__placeholder">Эспрессо</span>
            </button>
            <button className="method" type="button">
              <span className="method__placeholder">Placeholder</span>
            </button>
            <button className="method" type="button">
              <span className="method__placeholder">Placeholder</span>
            </button>
            <button className="method" type="button">
              <span className="method__placeholder">Placeholder</span>
            </button>
            <button className="method" type="button">
              <span className="method__placeholder">Placeholder</span>
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Калькулятор</h2>
          <div className="segment" ref={segmentRef}>
            <div className="segment__indicator" ref={indicatorRef} />
            <button
              className={`segment__item ${activeTab === 'sweet' ? 'segment__item--active' : ''}`}
              type="button"
              ref={(el) => {
                tabRefs.current[0] = el
              }}
              onClick={() => setActiveTab('sweet')}
            >
              Сладость
            </button>
            <button
              className={`segment__item ${activeTab === 'balance' ? 'segment__item--active' : ''}`}
              type="button"
              ref={(el) => {
                tabRefs.current[1] = el
              }}
              onClick={() => setActiveTab('balance')}
            >
              Баланс
            </button>
            <button
              className={`segment__item ${activeTab === 'custom' ? 'segment__item--active' : ''}`}
              type="button"
              ref={(el) => {
                tabRefs.current[2] = el
              }}
              onClick={() => setActiveTab('custom')}
            >
              Своё
            </button>
          </div>

          <div className="inputs">
            <div className="field">
              <label className="field__label">Кофе в зернах</label>
              <Input
                value={coffee}
                onChange={(event) => {
                  const next = event.target.value
                  if (next.trim() === '0') {
                    setLastEdited('coffee')
                    setCoffee('')
                    updateFromCoffee('')
                    return
                  }
                  setLastEdited('coffee')
                  setCoffee(next)
                  updateFromCoffee(next)
                }}
                suffix="Гр"
                loading={loading}
                placeholder={coffeePlaceholder}
                numeric
              />
            </div>
            <div className="field">
              <label className="field__label">Вода</label>
              <Input
                value={water}
                onChange={(event) => {
                  const next = event.target.value
                  if (next.trim() === '0') {
                    setLastEdited('water')
                    setWater('')
                    updateFromWater('')
                    return
                  }
                  setLastEdited('water')
                  setWater(next)
                  updateFromWater(next)
                }}
                suffix="Мл"
                loading={loading}
                placeholder={waterPlaceholder}
                numeric
              />
            </div>
            <div className="field">
              <label className="field__label">Время приготовления</label>
              <Input
                value={time}
                suffix="Сек"
                disabled
                loading={loading}
                placeholder={statusPlaceholder}
              />
            </div>
            <div className="field">
              <label className="field__label">Температура</label>
              <Input
                value={temp}
                suffix="°C"
                disabled
                loading={loading}
                placeholder={statusPlaceholder}
              />
            </div>
          </div>
        </section>

        {activeTab === 'custom' ? (
          <section className="section custom-slider">
            <Slider
              value={ratio}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step}
              onChange={handleRatioChange}
              leftLabel="Более насыщенно"
              rightLabel="Менее насыщенно"
            />
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default App
