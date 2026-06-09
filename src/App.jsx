import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navbar from './components/Navbar'
import MobileBar from './components/MobileBar'
import Hero from './sections/Hero'
import Menu from './sections/Menu'
import Beers from './sections/Beers'
import Events from './sections/Events'
import Interior from './sections/Interior'
import Connect from './sections/Connect'
import Footer from './sections/Footer'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function App() {
  const root = useRef(null)

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = gsap.utils.toArray('[data-reveal]')

    if (reduce) {
      gsap.set(reveals, { opacity: 1, y: 0 })
      return
    }

    gsap.set(reveals, { opacity: 0, y: 42 })

    // Reveal via IntersectionObserver — reads true element visibility, so it
    // stays reliable even as lazy images/fonts change the page height (unlike
    // cached scroll positions). GSAP still drives the actual animation.
    const queue = new Set()
    let flush
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          queue.add(e.target)
          io.unobserve(e.target)
        }
      })
      // batch elements that appeared together so they stagger nicely
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
      <Navbar />
      <main>
        <Hero />
        <Menu />
        <Beers />
        <Events />
        <Interior />
        <Connect />
      </main>
      <Footer />
      <MobileBar />
    </div>
  )
}
