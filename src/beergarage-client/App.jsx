import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navbar     from '../components/Navbar'
import MobileBar  from '../components/MobileBar'
import MaxModal   from '../components/MaxModal'
import MenuPage   from '../sections/MenuPage'
import Hero       from '../sections/Hero'
import Menu       from '../sections/Menu'
import Beers      from '../sections/Beers'
import Events     from '../sections/Events'
import Interior   from '../sections/Interior'
import BookingMap from '../sections/BookingMap'
import Connect    from '../sections/Connect'
import Footer     from '../sections/Footer'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ClientApp() {
  const root = useRef(null)
  const [maxModalOpen, setMaxModalOpen] = useState(false)
  const [menuPageOpen, setMenuPageOpen] = useState(false)
  const [bookingOpen,  setBookingOpen]  = useState(false)

  useGSAP(() => {
    const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = gsap.utils.toArray('[data-reveal]')

    if (reduce) {
      gsap.set(reveals, { opacity: 1, y: 0 })
      return
    }

    gsap.set(reveals, { opacity: 0, y: 42 })

    const queue = new Set()
    let flush
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { queue.add(e.target); io.unobserve(e.target) }
      })
      clearTimeout(flush)
      flush = setTimeout(() => {
        const batch = [...queue].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        queue.clear()
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1, overwrite: true })
      }, 60)
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 })

    reveals.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, { scope: root })

  return (
    <div ref={root}>
      <div className="page-glow page-glow--left" />
      <div className="page-glow page-glow--right" />
      <Navbar onMenuClick={() => setMenuPageOpen(true)} />
      <main>
        <Hero     onMaxClick={() => setMaxModalOpen(true)} onMenuClick={() => setMenuPageOpen(true)} />
        <Menu     onMenuClick={() => setMenuPageOpen(true)} />
        <Beers />
        <Events   onMaxClick={() => setMaxModalOpen(true)} />
        <Interior onBookClick={() => setBookingOpen(true)} />
        <Connect  onMaxClick={() => setMaxModalOpen(true)} />
      </main>
      <Footer   onMaxClick={() => setMaxModalOpen(true)} />
      <MobileBar onMenuClick={() => setMenuPageOpen(true)} />
      {maxModalOpen && <MaxModal   onClose={() => setMaxModalOpen(false)} />}
      {menuPageOpen && <MenuPage   onClose={() => setMenuPageOpen(false)} />}
      {bookingOpen  && <BookingMap onClose={() => setBookingOpen(false)}  />}
    </div>
  )
}
