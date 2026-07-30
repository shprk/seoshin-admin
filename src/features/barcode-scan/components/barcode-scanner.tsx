import { useEffect, useRef } from 'react'
import Quagga from '@ericblade/quagga2'

type BarcodeScannerProps = {
  active: boolean
  onDetected: (code: string) => void
}

type QuaggaDetectedResult = {
  codeResult?: {
    code?: string | null
  }
}

type QuaggaApi = {
  onDetected: (handler: (data: QuaggaDetectedResult) => void) => void
  offDetected: (handler: (data: QuaggaDetectedResult) => void) => void
  init: (config: Record<string, unknown>, cb: (err: unknown) => void) => void
  start: () => void
  stop: () => void
}

/**
 * Quagga2 live camera decoder (1D barcode only).
 * - decodes detected code once, then stops the scanner
 */
export function BarcodeScanner({ active, onDetected }: BarcodeScannerProps) {
  const interactiveRef = useRef<HTMLDivElement | null>(null)
  const detectedOnceRef = useRef(false)

  useEffect(() => {
    if (!active) return
    if (!interactiveRef.current) return

    const quagga = Quagga as unknown as QuaggaApi
    detectedOnceRef.current = false

    const handleDetected = (data: QuaggaDetectedResult) => {
      const code = data.codeResult?.code
      if (!code) return
      if (detectedOnceRef.current) return

      detectedOnceRef.current = true
      quagga.stop()
      onDetected(String(code))
    }

    quagga.onDetected(handleDetected)

    quagga.init(
      {
        locate: true,
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: interactiveRef.current,
          constraints: {
            facingMode: 'environment',
            width: 640,
            height: 480,
          },
        },
        locator: {
          halfSample: true,
          patchSize: 'medium',
        },
        decoder: {
          // Prefer Code128 (common for alphanumeric like A26-0001)
          readers: ['code_128_reader', 'code_39_reader', 'codabar_reader'],
          multiple: false,
        },
        frequency: 10,
      },
      (err: unknown) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Quagga init error:', err)
          return
        }
        quagga.start()
      }
    )

    return () => {
      try {
        quagga.offDetected(handleDetected)
      } catch {
        // ignore if offDetected signature differs
      }
      try {
        quagga.stop()
      } catch {
        // ignore
      }
    }
  }, [active, onDetected])

  return (
    <div className='relative w-full overflow-hidden rounded-md bg-muted/30'>
      <div className='relative aspect-[4/3]'>
        <div
          ref={interactiveRef}
          id='interactive'
          className='viewport absolute inset-0'
        />
      </div>
    </div>
  )
}
