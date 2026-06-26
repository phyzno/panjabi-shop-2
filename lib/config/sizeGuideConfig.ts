// lib/config/sizeGuideConfig.ts

export const MEASUREMENT_INSTRUCTIONS: Record<string, { title: string; desc: string; image: string }> = {
  chest: {
    title: 'Chest',
    desc: 'Measure around the fullest part of your chest, keeping the tape perfectly horizontal under your armpits.',
    image: '/Measurment Guides/01 - Chest.png'
  },
  shoulder: {
    title: 'Shoulder',
    desc: 'Measure horizontally across the upper back from the edge of one shoulder bone to the other.',
    image: '/Measurment Guides/02 - Shoulder.png'
  },
  sleeve: {
    title: 'Sleeve Length',
    desc: 'Measure from the top edge of the shoulder joint down along the outside of the arm to the wrist bone.',
    image: '/Measurment Guides/03 - Sleeve.png'
  },
  neck: {
    title: 'Neck',
    desc: 'Wrap the tape circularly around the base of your neck where a shirt collar would naturally sit.',
    image: '/Measurment Guides/04 - Neck.png'
  },
  waist: {
    title: 'Waist',
    desc: 'Measure around your natural waistline or where you comfortably wear your trousers/pajamas.',
    image: '/Measurment Guides/05 - Waist.png'
  },
  hip: {
    title: 'Hip',
    desc: 'Stand with your heels together and measure around the fullest part of your hips/buttocks.',
    image: '/Measurment Guides/06 - Hip.png'
  },
  thigh: {
    title: 'Thigh',
    desc: 'Measure around the thickest part of your thigh, typically an inch or two below the crotch.',
    image: '/Measurment Guides/07 - Thigh.png'
  },
  bottom_hem: {
    title: 'Bottom Hem (Ankle)',
    desc: 'Measure around your ankle or the desired width of the bottom opening of your trousers.',
    image: '/Measurment Guides/08 - Bottom Hem.png'
  },
  outseam: {
    title: 'Outseam (Full Length)',
    desc: 'Measure vertically down the outside of the leg, from the top of the waistband down to the ankle hem.',
    image: '/Measurment Guides/09 - Outseam.png'
  },
  inseam: {
    title: 'Inseam',
    desc: 'Measure vertically down the inside of the leg, starting straight from the crotch point down to the inner ankle.',
    image: '/Measurment Guides/10 - Inseam.png'
  },
  shirt_length: {
    title: 'Shirt Length',
    desc: 'Measure straight down from the highest point of the shoulder (near the neck base) to the mid-crotch or desired hem.',
    image: '/Measurment Guides/11 - Shirt Length.png'
  },
  panjabi_length: {
    title: 'Panjabi Length',
    desc: 'Measure straight down from the highest point of the shoulder to the knee level or your preferred length.',
    image: '/Measurment Guides/12 - Panjabi Length.png'
  },
  jubba_length: {
    title: 'Jubba Length',
    desc: 'Measure straight down from the highest point of the shoulder all the way to the ankle.',
    image: '/Measurment Guides/13 - Jubba Length.png'
  },
  shoes: {
    title: 'Foot Length',
    desc: 'Place your foot flat on a piece of paper. Measure the straight distance from the back of the heel to the tip of your longest toe.',
    image: '/Measurment Guides/14 - Shoes.png'
  }
};

export const PRODUCT_SIZE_GROUPS: Record<string, { name: string; keys: string[] }> = {
  panjabi: {
    name: 'Panjabi',
    keys: ['chest', 'shoulder', 'sleeve', 'neck', 'panjabi_length']
  },
  shirt: {
    name: 'Shirt',
    keys: ['chest', 'shoulder', 'sleeve', 'neck', 'shirt_length']
  },
  jubba: {
    name: 'Jubba',
    keys: ['chest', 'shoulder', 'sleeve', 'neck', 'jubba_length']
  },
  pant: {
    name: 'Pant',
    keys: ['waist', 'hip', 'thigh', 'outseam', 'inseam', 'bottom_hem']
  },
  pajama: {
    name: 'Pajama',
    keys: ['waist', 'hip', 'thigh', 'outseam', 'inseam', 'bottom_hem']
  },
  shoes: {
    name: 'Shoes',
    keys: ['shoes']
  }
};

// Industry Standard Shoe Size Chart for BD/EU
export const SHOE_SIZE_CHART = [
  { cm: '24.5', inch: '9.6"', eu: '39', us: '6', uk: '5.5' },
  { cm: '25.1', inch: '9.9"', eu: '40', us: '7', uk: '6.5' },
  { cm: '25.8', inch: '10.1"', eu: '41', us: '8', uk: '7.5' },
  { cm: '26.5', inch: '10.4"', eu: '42', us: '9', uk: '8.5' },
  { cm: '27.1', inch: '10.7"', eu: '43', us: '10', uk: '9.5' },
  { cm: '27.8', inch: '10.9"', eu: '44', us: '11', uk: '10.5' },
  { cm: '28.5', inch: '11.2"', eu: '45', us: '12', uk: '11.5' },
];