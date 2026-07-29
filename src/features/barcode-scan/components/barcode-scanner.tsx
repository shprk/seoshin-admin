import { useEffect, useRef } from 'react'
import Quagga from '@ericblade/quagga2'

type BarcodeScannerProps = {
  active: boolean
  onDetected: (code: string) => void
}

/**
 * Quagga2 live camera decoder (1D barcode only).
 * - decodes detected code once, then stops the scanner
 */
export function BarcodeScanner({
  active,
  onDetected,
}: BarcodeScannerProps) {
  const interactiveRef = useRef<HTMLDivElement | null>(null)
  const detectedOnceRef = useRef(false)

  useEffect(() => {
    if (!active) return
    if (!interactiveRef.current) return

    const QuaggaAny = Quagga as any
    detectedOnceRef.current = false

    const handleDetected = (data: any) => {
      const code = data?.codeResult?.code
      if (!code) return
      if (detectedOnceRef.current) return

      detectedOnceRef.current = true
      QuaggaAny.stop()
      onDetected(String(code))
    }

    QuaggaAny.onDetected(handleDetected)

    QuaggaAny.init(
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
      (err: any) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Quagga init error:', err)
          return
        }
        QuaggaAny.start()
      }
    )

    return () => {
      try {
        QuaggaAny.offDetected(handleDetected)
      } catch {
        // ignore if offDetected signature differs
      }
      try {
        QuaggaAny.stop()
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

