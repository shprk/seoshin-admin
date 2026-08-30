import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type LongTextProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  /** Extra classes for the wrapped (full-text) view at `wrapFrom` and up. */
  wrapClassName?: string
  /** From this breakpoint up, show full wrapped text instead of truncating. */
  wrapFrom?: 'md'
}

export function LongText({
  children,
  className = '',
  contentClassName = '',
  wrapClassName,
  wrapFrom,
}: LongTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOverflown, setIsOverflown] = useState(false)

  // Use ref callback to check overflow when element is mounted
  const refCallback = (node: HTMLDivElement | null) => {
    ref.current = node
    if (node && checkOverflow(node)) {
      queueMicrotask(() => setIsOverflown(true))
    }
  }

  if (wrapFrom === 'md') {
    const wrapped = (
      <div
        className={cn(
          'hidden break-words whitespace-normal md:block',
          className,
          wrapClassName
        )}
      >
        {children}
      </div>
    )

    if (!isOverflown) {
      return (
        <>
          {wrapped}
          <div
            ref={refCallback}
            className={cn('truncate md:hidden', className)}
          >
            {children}
          </div>
        </>
      )
    }

    return (
      <>
        {wrapped}
        <div className='md:hidden'>
          <Popover>
            <PopoverTrigger asChild>
              <div
                ref={refCallback}
                className={cn('cursor-pointer truncate', className)}
              >
                {children}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                'w-fit max-w-[min(90vw,24rem)] break-words whitespace-pre-wrap',
                contentClassName
              )}
            >
              <p>{children}</p>
            </PopoverContent>
          </Popover>
        </div>
      </>
    )
  }

  if (!isOverflown)
    return (
      <div ref={refCallback} className={cn('truncate', className)}>
        {children}
      </div>
    )

  return (
    <>
      <div className='hidden sm:block'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div ref={refCallback} className={cn('truncate', className)}>
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className={contentClassName}>{children}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className='sm:hidden'>
        <Popover>
          <PopoverTrigger asChild>
            <div ref={refCallback} className={cn('truncate', className)}>
              {children}
            </div>
          </PopoverTrigger>
          <PopoverContent className={cn('w-fit', contentClassName)}>
            <p>{children}</p>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}

const checkOverflow = (textContainer: HTMLDivElement | null) => {
  if (textContainer) {
    return (
      textContainer.offsetHeight < textContainer.scrollHeight ||
      textContainer.offsetWidth < textContainer.scrollWidth
    )
  }
  return false
}
