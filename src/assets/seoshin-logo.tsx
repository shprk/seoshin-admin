import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function SeoshinLogo({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src='/images/seoshin_logo.png'
      alt='서신'
      className={cn('object-contain', className)}
      {...props}
    />
  )
}
