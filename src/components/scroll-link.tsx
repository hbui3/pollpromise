'use client'

import { type ReactNode } from 'react'

interface ScrollLinkProps {
  href: string
  className?: string
  children: ReactNode
}

export function ScrollLink({ href, className, children }: ScrollLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      // Update URL without reload
      window.history.pushState(null, '', href)
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
