import clsx from 'clsx'
import { NextSeo } from 'next-seo'
import React, { ComponentProps } from 'react'

interface HeadingProps extends ComponentProps<'h1'> {
  as?: 'h1' | 'h2' | 'h3'
}
function Heading({ as, ...props }: HeadingProps) {
  const Renderer = as || 'h1'
  return <Renderer {...props} />
}

export function H1({ className, ...props }: HeadingProps) {
  return (
    <Heading
      as="h1"
      className={clsx('typescale-headline-medium mt-6', className)}
      {...props}
    />
  )
}

export function H2({ className, ...props }: HeadingProps) {
  return (
    <Heading
      as="h2"
      className={clsx('typescale-title-large mt-12', className)}
      {...props}
    />
  )
}

type Meta = { title?: string }
export function withLayout({ title }: Meta) {
  return function Layout({ children }) {
    return (
      <>
        <NextSeo title={`${title} - Lota`} />
        <article className="container py-16">{children}</article>
      </>
    )
  } as React.FC
}
