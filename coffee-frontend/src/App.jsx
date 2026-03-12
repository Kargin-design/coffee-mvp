import { useEffect, useState } from 'react'
import Input from './components/Input/Input'
import './App.css'

const formatTime = (seconds) => {
  if (seconds === '' || Number.isNaN(Number(seconds))) {
    return ''
  }

  const total = Math.max(0, Math.round(Number(seconds)))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}m${String(secs).padStart(2, '0')}s`
}

function App() {
  const [coffee, setCoffee] = useState('')
  const [water, setWater] = useState('')
  const [time, setTime] = useState('')
  const [temp, setTemp] = useState('')

  const updateFromCoffee = async (value) => {
    const num = Number(value)
    if (!value || Number.isNaN(num)) {
      setWater('')
      setTime('')
      setTemp('')
      return
    }

    const res = await fetch(`/api/calc/coffee?coffee=${num}`)
    if (!res.ok) return

    const data = await res.json()
    setCoffee(String(data.coffee))
    setWater(String(data.water))
    setTime(formatTime(data.time))
    setTemp(String(data.temp))
  }

  const updateFromWater = async (value) => {
    const num = Number(value)
    if (!value || Number.isNaN(num)) {
      setCoffee('')
      setTime('')
      setTemp('')
      return
    }

    const res = await fetch(`/api/calc/water?water=${num}`)
    if (!res.ok) return

    const data = await res.json()
    setCoffee(String(data.coffee))
    setWater(String(data.water))
    setTime(formatTime(data.time))
    setTemp(String(data.temp))
  }

  useEffect(() => {
    updateFromCoffee('18')
  }, [])

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
            <button className="method method--active" type="button">
              <div className="method__icon" aria-hidden="true">
                <span className="method__cup" />
                <span className="method__drip" />
              </div>
              <span className="method__label">Воронка V60</span>
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
            <button className="method" type="button">
              <span className="method__placeholder">Placeholder</span>
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Калькулятор</h2>
          <div className="segment">
            <button className="segment__item segment__item--active" type="button">
              Сладость
            </button>
            <button className="segment__item" type="button">
              Баланс
            </button>
            <button className="segment__item" type="button">
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
                  setCoffee(next)
                  updateFromCoffee(next)
                }}
                suffix="Гр"
              />
            </div>
            <div className="field">
              <label className="field__label">Кофе в зернах</label>
              <Input
                value={water}
                onChange={(event) => {
                  const next = event.target.value
                  setWater(next)
                  updateFromWater(next)
                }}
                suffix="Мл"
              />
            </div>
            <div className="field">
              <label className="field__label">Время приготовления</label>
              <Input value={time} suffix="Сек" disabled />
            </div>
            <div className="field">
              <label className="field__label">Температура</label>
              <Input value={temp} suffix="°C" disabled />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
