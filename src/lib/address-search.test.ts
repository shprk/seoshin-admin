import { describe, expect, it } from 'vitest'
import {
  composeAddress,
  formatSelectedAddress,
  parseAddress,
  type DaumPostcodeData,
} from './address-search'

const samplePostcode = {
  zonecode: '03923',
  roadAddress: '서울특별시 마포구 월드컵북로 120',
  jibunAddress: '서울특별시 마포구 성산동 123-4',
  autoRoadAddress: '',
  userSelectedType: 'R' as const,
  bname: '성산동',
  buildingName: '',
  apartment: 'N' as const,
} satisfies DaumPostcodeData

describe('parseAddress / composeAddress', () => {
  it('round-trips an empty value', () => {
    expect(parseAddress('')).toEqual({
      zonecode: '',
      address: '',
      detail: '',
    })
    expect(composeAddress(parseAddress(''))).toBe('')
  })

  it('keeps a legacy freeform address without a postal code', () => {
    const value = '서울특별시 마포구 월드컵북로 120'
    expect(parseAddress(value)).toEqual({
      zonecode: '',
      address: value,
      detail: '',
    })
    expect(composeAddress(parseAddress(value))).toBe(value)
  })

  it('joins a searched address and optional detail with a space', () => {
    const value = '03923 서울특별시 마포구 월드컵북로 120 101동 202호'
    expect(
      composeAddress({
        zonecode: '03923',
        address: '서울특별시 마포구 월드컵북로 120',
        detail: '101동 202호',
      })
    ).toBe(value)
  })

  it('keeps a slash that was typed as part of the address', () => {
    const value = '03923 서울특별시 마포구 월드컵북로 120 / 101동'
    expect(parseAddress(value)).toEqual({
      zonecode: '03923',
      address: '서울특별시 마포구 월드컵북로 120 / 101동',
      detail: '',
    })
    expect(composeAddress(parseAddress(value))).toBe(value)
  })

  it('does not emit a value when only detail is present', () => {
    expect(
      composeAddress({
        zonecode: '',
        address: '',
        detail: '101동',
      })
    ).toBe('')
  })

  it('round-trips a postal code typed without an address yet', () => {
    expect(parseAddress('039')).toEqual({
      zonecode: '039',
      address: '',
      detail: '',
    })
    expect(
      composeAddress({
        zonecode: '03923',
        address: '',
        detail: '',
      })
    ).toBe('03923')
    expect(parseAddress('03923')).toEqual({
      zonecode: '03923',
      address: '',
      detail: '',
    })
  })

  it('keeps spaces while an address is being typed', () => {
    expect(
      composeAddress({
        zonecode: '',
        address: '서울 ',
        detail: '',
      })
    ).toBe('서울 ')
    expect(parseAddress('서울 ')).toEqual({
      zonecode: '',
      address: '서울 ',
      detail: '',
    })
    expect(
      composeAddress({
        zonecode: '03923',
        address: '서울특별시 ',
        detail: '',
      })
    ).toBe('03923 서울특별시 ')
  })
})

describe('formatSelectedAddress', () => {
  it('uses the road address and dong extra for a road selection', () => {
    expect(formatSelectedAddress(samplePostcode)).toEqual({
      zonecode: '03923',
      address: '서울특별시 마포구 월드컵북로 120 (성산동)',
    })
  })

  it('uses the lot-number address for a jibun selection', () => {
    expect(
      formatSelectedAddress({
        ...samplePostcode,
        userSelectedType: 'J',
      })
    ).toEqual({
      zonecode: '03923',
      address: '서울특별시 마포구 성산동 123-4',
    })
  })
})
