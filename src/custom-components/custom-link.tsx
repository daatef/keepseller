'use client'
import React from 'react';
import Link, { LinkProps } from 'next/link'
import { forwardRef } from 'react'

interface CustomLinkProps extends LinkProps {
  className?: string
  children: React.ReactNode
}

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link ref={ref} className={className} {...props}>
        {children}
      </Link>
    )
  }
)

CustomLink.displayName = 'CustomLink'

export default CustomLink
