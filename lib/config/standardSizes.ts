export const STANDARD_SIZES: Record<string, Record<string, Record<string, number>>> = {
  panjabi: {
    S: { length: 40, chest: 40, shoulder: 16.5, sleeve: 23, neck: 15 },
    M: { length: 42, chest: 42, shoulder: 17.5, sleeve: 24, neck: 15.5 },
    L: { length: 44, chest: 44, shoulder: 18, sleeve: 24.5, neck: 16 },
    XL: { length: 46, chest: 46, shoulder: 19, sleeve: 25, neck: 16.5 },
    XXL: { length: 48, chest: 48, shoulder: 20, sleeve: 25.5, neck: 17 },
  },
  shirt: {
    S: { length: 28, chest: 38, shoulder: 17, sleeve: 24, neck: 15 },
    M: { length: 29, chest: 40, shoulder: 18, sleeve: 25, neck: 15.5 },
    L: { length: 30, chest: 42, shoulder: 19, sleeve: 25.5, neck: 16 },
    XL: { length: 31, chest: 44, shoulder: 20, sleeve: 26, neck: 16.5 },
  },
  pant: {
    '30': { waist: 30, hip: 36, thigh: 22, inseam: 38, bottom_hem: 13 },
    '32': { waist: 32, hip: 38, thigh: 23, inseam: 39, bottom_hem: 14 },
    '34': { waist: 34, hip: 40, thigh: 24, inseam: 40, bottom_hem: 15 },
    '36': { waist: 36, hip: 42, thigh: 25, inseam: 41, bottom_hem: 16 },
  },
  pajama: {
    S: { waist: 30, hip: 38, thigh: 23, length: 38, bottom_hem: 13 },
    M: { waist: 32, hip: 40, thigh: 24, length: 39, bottom_hem: 14 },
    L: { waist: 34, hip: 42, thigh: 25, length: 40, bottom_hem: 15 },
    XL: { waist: 36, hip: 44, thigh: 26, length: 41, bottom_hem: 16 },
  }
};