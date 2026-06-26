export const STANDARD_SIZES: Record<string, Record<string, Record<string, number>>> = {
  panjabi: {
    // --- Preset Sizes (Standard Fit) ---
    S: { length: 40, chest: 40, shoulder: 16.5, sleeve: 23.5, neck: 15 },
    M: { length: 42, chest: 42, shoulder: 17, sleeve: 24, neck: 15.5 },
    L: { length: 44, chest: 44, shoulder: 17.5, sleeve: 24.5, neck: 16 },
    XL: { length: 46, chest: 46, shoulder: 18, sleeve: 25, neck: 16.5 },
    XXL: { length: 48, chest: 48, shoulder: 18.5, sleeve: 25.5, neck: 17 },

    // --- Numbered Sizes (Based on Top BD Brands) ---
    '36': { length: 38, chest: 38, shoulder: 16, sleeve: 23, neck: 14.5 },
    '38': { length: 40, chest: 40, shoulder: 16.5, sleeve: 23.5, neck: 15 },
    '40': { length: 42, chest: 42, shoulder: 17, sleeve: 24, neck: 15.5 },
    '42': { length: 44, chest: 44, shoulder: 17.5, sleeve: 24.5, neck: 16 },
    '44': { length: 46, chest: 46, shoulder: 18, sleeve: 25, neck: 16.5 },
    '46': { length: 48, chest: 48, shoulder: 18.5, sleeve: 25.5, neck: 17 },
    '48': { length: 48, chest: 50, shoulder: 19, sleeve: 26, neck: 17.5 },
  },
  
  shirt: {
    // --- Preset Sizes ---
    S: { length: 28, chest: 39, shoulder: 17, sleeve: 24, neck: 15 },
    M: { length: 29, chest: 41, shoulder: 17.5, sleeve: 24.5, neck: 15.5 },
    L: { length: 30, chest: 43, shoulder: 18, sleeve: 25, neck: 16 },
    XL: { length: 31, chest: 45, shoulder: 18.5, sleeve: 25.5, neck: 16.5 },
    XXL: { length: 32, chest: 47, shoulder: 19, sleeve: 26, neck: 17 },

    // --- Numbered Sizes (Based on Chest) ---
    '38': { length: 28, chest: 39, shoulder: 17, sleeve: 24, neck: 15 },
    '40': { length: 29, chest: 41, shoulder: 17.5, sleeve: 24.5, neck: 15.5 },
    '42': { length: 30, chest: 43, shoulder: 18, sleeve: 25, neck: 16 },
    '44': { length: 31, chest: 45, shoulder: 18.5, sleeve: 25.5, neck: 16.5 },
    '46': { length: 32, chest: 47, shoulder: 19, sleeve: 26, neck: 17 },
  },
  
  jubba: {
    // --- Jubba Sizes (Mapped by Length 52-62, Global Standard) ---
    '52': { length: 52, chest: 42, shoulder: 17, sleeve: 23.5, neck: 15.5 },
    '54': { length: 54, chest: 44, shoulder: 17.5, sleeve: 24, neck: 16 },
    '56': { length: 56, chest: 46, shoulder: 18, sleeve: 24.5, neck: 16.5 },
    '58': { length: 58, chest: 48, shoulder: 18.5, sleeve: 25, neck: 17 },
    '60': { length: 60, chest: 50, shoulder: 19, sleeve: 25.5, neck: 17.5 },
    '62': { length: 62, chest: 52, shoulder: 19.5, sleeve: 26, neck: 18 },
  },
  
  pant: {
    // --- Pant Sizes (Waist based 28-42) ---
    '28': { waist: 28, hip: 36, thigh: 21, outseam: 38, inseam: 28, bottom_hem: 12.5 },
    '30': { waist: 30, hip: 38, thigh: 22, outseam: 39, inseam: 29, bottom_hem: 13 },
    '32': { waist: 32, hip: 40, thigh: 23, outseam: 40, inseam: 30, bottom_hem: 14 },
    '34': { waist: 34, hip: 42, thigh: 24, outseam: 41, inseam: 31, bottom_hem: 15 },
    '36': { waist: 36, hip: 44, thigh: 25, outseam: 41.5, inseam: 31.5, bottom_hem: 16 },
    '38': { waist: 38, hip: 46, thigh: 26, outseam: 42, inseam: 32, bottom_hem: 17 },
    '40': { waist: 40, hip: 48, thigh: 27, outseam: 42.5, inseam: 32.5, bottom_hem: 18 },
    '42': { waist: 42, hip: 50, thigh: 28, outseam: 43, inseam: 33, bottom_hem: 19 },
  },
  
  pajama: {
    // --- Pajama Sizes (Usually Elastic/Drawstring, so S, M, L is standard) ---
    S: { waist: 30, hip: 40, thigh: 24, outseam: 38, inseam: 28, bottom_hem: 13 },
    M: { waist: 34, hip: 42, thigh: 25, outseam: 39, inseam: 29, bottom_hem: 14 },
    L: { waist: 38, hip: 44, thigh: 26, outseam: 40, inseam: 30, bottom_hem: 15 },
    XL: { waist: 42, hip: 46, thigh: 27, outseam: 41, inseam: 31, bottom_hem: 16 },
  }
};