import clsx from 'clsx'
import { ComponentProps } from 'react'

interface PageProps extends ComponentProps<'div'> {
  headline: string
}
export const Page: React.FC<PageProps> = ({
  className,
  children,
  headline,
  ...props
}) => {
  return (
    <div className={clsx('p-4', className)} {...props}>
      <h1
        className={clsx(
          'typescale-title-large text-on-surface-variant mb-4',
          className,
        )}
        {...props}
      >
        {headline}
      </h1>
      {children}
    </div>
  )
}
