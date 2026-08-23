export type AddressParts = {
  zonecode: string
  address: string
  detail: string
}

export type AddressSearchResult = {
  zonecode: string
  address: string
}

export type DaumPostcodeData = {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  autoRoadAddress: string
  userSelectedType: 'R' | 'J'
  bname: string
  buildingName: string
  apartment: 'Y' | 'N'
}

type DaumPostcodeInstance = {
  open: () => void
  embed: (element: HTMLElement) => void
}

type DaumPostcodeOptions = {
  oncomplete: (data: DaumPostcodeData) => void
  onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
  width?: string
  height?: string
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcodeInstance
    }
  }
}

const SCRIPT_ID = 'daum-postcode-script'
const SCRIPT_SRC =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let scriptLoading: Promise<void> | null = null

export function parseAddress(value: string): AddressParts {
  if (value === '') return { zonecode: '', address: '', detail: '' }

  if (/^\d{1,5}$/.test(value)) {
    return { zonecode: value, address: '', detail: '' }
  }

  const zipMatch = /^(\d{5}) (.*)$/.exec(value)
  if (zipMatch) {
    return { zonecode: zipMatch[1], address: zipMatch[2], detail: '' }
  }

  return { zonecode: '', address: value, detail: '' }
}

export function composeAddress(parts: AddressParts): string {
  const zonecode = parts.zonecode.trim()
  const address = parts.address
  const detail = parts.detail
  const base =
    zonecode && address ? `${zonecode} ${address}` : zonecode || address

  if (!base) {
    return ''
  }
  if (!detail) return base
  if (!base.trim()) return ''
  return `${base.trimEnd()} ${detail}`
}

export function formatSelectedAddress(
  data: DaumPostcodeData
): AddressSearchResult {
  const address =
    data.userSelectedType === 'J'
      ? data.jibunAddress || data.autoRoadAddress || data.roadAddress
      : data.roadAddress || data.autoRoadAddress || data.jibunAddress

  let extra = ''
  if (data.userSelectedType === 'R') {
    if (data.bname && /[동로가]$/.test(data.bname)) {
      extra = data.bname
    }
    if (data.buildingName && data.apartment === 'Y') {
      extra = extra ? `${extra}, ${data.buildingName}` : data.buildingName
    }
  }

  return {
    zonecode: data.zonecode,
    address: extra ? `${address} (${extra})` : address,
  }
}

export function isAddressSearchReady(): boolean {
  return Boolean(window.daum?.Postcode)
}

export function loadDaumPostcodeScript(): Promise<void> {
  if (isAddressSearchReady()) return Promise.resolve()
  if (scriptLoading) return scriptLoading

  scriptLoading = new Promise((resolve, reject) => {
    const fail = () => {
      scriptLoading = null
      document.getElementById(SCRIPT_ID)?.remove()
      reject(new Error('주소 검색을 불러오지 못했습니다.'))
    }

    const succeed = () => {
      if (isAddressSearchReady()) {
        resolve()
        return
      }
      fail()
    }

    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        succeed()
        return
      }
      existing.addEventListener('load', succeed, { once: true })
      existing.addEventListener('error', fail, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => {
      script.setAttribute('data-loaded', 'true')
      succeed()
    }
    script.onerror = fail
    document.head.appendChild(script)
  })

  return scriptLoading
}

export function openAddressSearch(): Promise<AddressSearchResult | null> {
  const Postcode = window.daum?.Postcode
  if (!Postcode) {
    throw new Error('주소 검색을 불러오지 못했습니다.')
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (value: AddressSearchResult | null) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    new Postcode({
      oncomplete(data) {
        finish(formatSelectedAddress(data))
      },
      onclose(state) {
        if (state === 'FORCE_CLOSE') finish(null)
      },
    }).open()
  })
}

export async function embedAddressSearch(
  element: HTMLElement,
  handlers: {
    onSelect: (result: AddressSearchResult) => void
    onClose: () => void
  }
): Promise<() => void> {
  await loadDaumPostcodeScript()
  const Postcode = window.daum?.Postcode
  if (!Postcode) {
    throw new Error('주소 검색을 불러오지 못했습니다.')
  }

  let cancelled = false

  new Postcode({
    oncomplete(data) {
      if (cancelled) return
      handlers.onSelect(formatSelectedAddress(data))
    },
    onclose(state) {
      if (cancelled) return
      if (state === 'FORCE_CLOSE') handlers.onClose()
    },
    width: '100%',
    height: '360px',
  }).embed(element)

  return () => {
    cancelled = true
    element.replaceChildren()
  }
}
