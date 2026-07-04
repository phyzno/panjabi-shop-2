// lib/config/productConfig.ts

export const UI_VECTORS = {
  collar: {
    band: '/UI Vectors/Collars/02 - band-Photoroom.png',
    round: '/UI Vectors/Collars/01 - round-Photoroom.png',
    mandarin: '/UI Vectors/Collars/03 - mandarin-Photoroom.png',
    shirt: '/UI Vectors/Collars/04 - spread & shirt both-Photoroom.png',
    spread: '/UI Vectors/Collars/04 - spread & shirt both-Photoroom.png',
    buttondown: '/UI Vectors/Collars/05 - ButtonDown-Photoroom.png',
  },
  placket: {
    hidden: '/UI Vectors/Placket/hidden-Photoroom.png',
    visible: '/UI Vectors/Placket/visible-Photoroom.png',
  },
  pocket: {
    no_pocket: null, // UI-তে এটি ডিজেবল বা X আইকন দিয়ে হ্যান্ডেল করা যেতে পারে
    side: '/UI Vectors/Pocket/side-Photoroom.png',
    chest: '/UI Vectors/Pocket/single-Photoroom.png',
    double_chest: '/UI Vectors/Pocket/doubleflap-Photoroom.png',
  },
  front: {
    flat: '/UI Vectors/Pant Options/Front/flat-Photoroom.png',
    pleated: '/UI Vectors/Pant Options/Front/pleat-Photoroom.png',
  },
  hem: {
    regular: '/UI Vectors/Pant Options/Hem/regular-Photoroom.png',
    cuffed: '/UI Vectors/Pant Options/Hem/cuffed-Photoroom.png',
  },
  back: {
    regular: '/UI Vectors/Shirt Options/Back/01 - regular-Photoroom.png',
    boxpleat: '/UI Vectors/Shirt Options/Back/02 - boxpleat-Photoroom.png',
    sidepleat: '/UI Vectors/Shirt Options/Back/03 - sidepleat-Photoroom.png',
  },
  bottom: {
    curved: '/UI Vectors/Shirt Options/Bottom/curved-Photoroom.png',
    straight: '/UI Vectors/Shirt Options/Bottom/straight-Photoroom.png',
  },
  sleeve: {
    full: '/UI Vectors/Shirt Options/Sleeve/full-Photoroom.png',
    half: '/UI Vectors/Shirt Options/Sleeve/half-Photoroom.png',
  }
};

// Jubba Canvas Map based on the new asset structure
export const JUBBA_CANVAS_MAP: Record<string, Record<string, Record<string, string>>> = {
  band: {
    hidden: {
      chest: '/Canvas/Jubba/Band Collar/Hidden Placket/Chest Pocket/02 - jubba_band_hidden_pocket-Photoroom.webp',
      side: '/Canvas/Jubba/Band Collar/Hidden Placket/No Pocket & Side Pocket/01 - jubba_band_hidden_nopocket-Photoroom.webp',
      no_pocket: '/Canvas/Jubba/Band Collar/Hidden Placket/No Pocket & Side Pocket/01 - jubba_band_hidden_nopocket-Photoroom.webp',
    },
    visible: {
      chest: '/Canvas/Jubba/Band Collar/Visible Placket/Chest Pocket/04 - jubba_band_visible_pocket-Photoroom.webp',
      side: '/Canvas/Jubba/Band Collar/Visible Placket/No Pocket & Side Pocket/03 - jubba_band_visible_nopocket-Photoroom.webp',
      no_pocket: '/Canvas/Jubba/Band Collar/Visible Placket/No Pocket & Side Pocket/03 - jubba_band_visible_nopocket-Photoroom.webp',
    }
  },
  round: {
    hidden: {
      chest: '/Canvas/Jubba/Round Collar/Hidden Placket/Chest Pocket/06 - jubba_round_hidden_pocket-Photoroom.webp',
      side: '/Canvas/Jubba/Round Collar/Hidden Placket/No Pocket & Side Pocket/05 - jubba_round_hidden_nopocket-Photoroom.webp',
      no_pocket: '/Canvas/Jubba/Round Collar/Hidden Placket/No Pocket & Side Pocket/05 - jubba_round_hidden_nopocket-Photoroom.webp',
    },
    visible: {
      chest: '/Canvas/Jubba/Round Collar/Visible Placket/Chest Pocket/08 - jubba_round_visible_pocket-Photoroom.webp',
      side: '/Canvas/Jubba/Round Collar/Visible Placket/No Pocket & Side Pocket/07 - jubba_round_visible_nopocket-Photoroom.webp',
      no_pocket: '/Canvas/Jubba/Round Collar/Visible Placket/No Pocket & Side Pocket/07 - jubba_round_visible_nopocket-Photoroom.webp',
    }
  }
};

export const PANT_CANVAS_MAP: Record<string, Record<string, Record<string, string>>> = {
  chinos: {
    flat: {
      regular: '/Canvas/Pant/Chinos/Flat Front/Regular Hem/05 - pants_chinos_flat_regular-Photoroom.webp',
      cuffed: '/Canvas/Pant/Chinos/Flat Front/Cuffed Hem/06 - pants_chinos_flat_cuffed-Photoroom.webp',
    },
    pleated: {
      regular: '/Canvas/Pant/Chinos/Pleated Front/Regular Hem/07 - pants_chinos_pleated_regular-Photoroom.webp',
      cuffed: '/Canvas/Pant/Chinos/Pleated Front/Cuffed Hem/08 - pants_chinos_pleated_cuffed-Photoroom.webp',
    }
  },
  formal: {
    flat: {
      regular: '/Canvas/Pant/Formal/Flat Front/Regular Hem/01 - pants_formal_flat_regular-Photoroom.webp',
      cuffed: '/Canvas/Pant/Formal/Flat Front/Cuffed Hem/02 - pants_formal_flat_cuffed-Photoroom.webp',
    },
    pleated: {
      regular: '/Canvas/Pant/Formal/Pleated Front/Regular Hem/03 - pants_formal_pleated_regular-Photoroom.webp',
      cuffed: '/Canvas/Pant/Formal/Pleated Front/Cuffed Hem/04 - pants_formal_pleated_cuffed-Photoroom.webp',
    }
  }
};

export const PANJABI_CANVAS_MAP: Record<string, Record<string, Record<string, Record<string, string>>>> = {
  regular: {
    band: {
      hidden: {
        chest: '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Hidden Placket/Chest Pocket/02 - Band Collar + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Hidden Placket/No Pocket/01 - Band Collar + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Hidden Placket/No Pocket/01 - Band Collar + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Visible Placket/Chest Pocket/04 - Band Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Visible Placket/No Pocket/03 - Band Collar + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Visible Placket/No Pocket/03 - Band Collar + Visible Placket + No Pocket-Photoroom.webp',
      }
    },
    mandarin: {
      hidden: {
        chest: '/Canvas/Panjabi/Regular-Classic Panjabi/Mandarin Collar/Hidden Placket/Chest Pocket/06 - Mandarin Collar + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Regular-Classic Panjabi/Mandarin Collar/Hidden Placket/No Pocket/05 - Mandarin Collar + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Regular-Classic Panjabi/Mandarin Collar/Hidden Placket/No Pocket/05 - Mandarin Collar + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Regular-Classic Panjabi/Mandarin Collar/Visible Placket/Chest Pocket/08 - Mandarin Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Regular-Classic Panjabi/Mandarin Collar/Visible Placket/No Pocket/07 - Mandarin Collar + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Regular-Classic Panjabi/Mandarin Collar/Visible Placket/No Pocket/07 - Mandarin Collar + Visible Placket + No Pocket-Photoroom.webp',
      }
    },
    round: {
      hidden: {
        chest: '/Canvas/Panjabi/Regular-Classic Panjabi/Round Collar/Hidden Placket/Chest Pocket/10 - Round Neck + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Regular-Classic Panjabi/Round Collar/Hidden Placket/No Pocket/09 - Round Neck + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Regular-Classic Panjabi/Round Collar/Hidden Placket/No Pocket/09 - Round Neck + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Regular-Classic Panjabi/Round Collar/Visible Placket/Chest Pocket/12 - Round Neck + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Regular-Classic Panjabi/Round Collar/Visible Placket/No Pocket/11 - Round Neck + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Regular-Classic Panjabi/Round Collar/Visible Placket/No Pocket/11 - Round Neck + Visible Placket + No Pocket-Photoroom.webp',
      }
    }
  },
  madani: {
    band: {
      hidden: {
        chest: '/Canvas/Panjabi/Madani/Band Collar/Hidden Placket/Chest Pocket/06 - Band Collar + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Madani/Band Collar/Hidden Placket/No Pocket & Side Pocket/05 - Band Collar + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Madani/Band Collar/Hidden Placket/No Pocket & Side Pocket/05 - Band Collar + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Madani/Band Collar/Visible Placket/Chest Pocket/08 - Band Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Madani/Band Collar/Visible Placket/No Pocket & Side Pocket/07 - Band Collar + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Madani/Band Collar/Visible Placket/No Pocket & Side Pocket/07 - Band Collar + Visible Placket + No Pocket-Photoroom.webp',
      }
    },
    round: {
      hidden: {
        chest: '/Canvas/Panjabi/Madani/Round Neck Collar/Hidden Placket/Chest Pocket/02 - Round Neck + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Madani/Round Neck Collar/Hidden Placket/No Pocket & Side Pocket/01 - Round Neck + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Madani/Round Neck Collar/Hidden Placket/No Pocket & Side Pocket/01 - Round Neck + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Madani/Round Neck Collar/Visible Placket/Chest Pocket/04 - Round Neck + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Madani/Round Neck Collar/Visible Placket/No Pocket & Side Pocket/03 - Round Neck + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Madani/Round Neck Collar/Visible Placket/No Pocket & Side Pocket/03 - Round Neck + Visible Placket + No Pocket-Photoroom.webp',
      }
    }
  },
  kabuli: {
    band: {
      visible: {
        double_flap: '/Canvas/Panjabi/Kabuli/Band Collar/Visible Placket/Double Chest Flap Pocket/03 - Band Collar + Visible Placket + Double Chest Pocket-Photoroom.webp',
        chest: '/Canvas/Panjabi/Kabuli/Band Collar/Visible Placket/Single Pocket/04 - Band Collar + Visible Placket + Single Chest Pocket-Photoroom.webp',
      }
    },
    shirt: {
      visible: {
        double_flap: '/Canvas/Panjabi/Kabuli/Shirt Collar/Visible Placket/Double Chest Flap Pocket/01 - Shirt Collar + Visible Placket + Double Chest Pocket(with flaps)-Photoroom.webp',
        chest: '/Canvas/Panjabi/Kabuli/Shirt Collar/Visible Placket/Single Pocket/02 - Shirt Collar + Visible Placket + Single Chest Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Kabuli/Shirt Collar/Visible Placket/Single Pocket/02 - Shirt Collar + Visible Placket + Single Chest Pocket-Photoroom.webp',
      }
    }
  },
  short: {
    band: {
      hidden: {
        chest: '/Canvas/Panjabi/Short Panjabi/Band Collar/Hidden Placket/Chest Pocket/08 - Band Collar + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Short Panjabi/Band Collar/Hidden Placket/No Pocket/07 - Band Collar + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Short Panjabi/Band Collar/Hidden Placket/No Pocket/07 - Band Collar + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Short Panjabi/Band Collar/Visible Placket/Chest Pocket/06 - Band Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Short Panjabi/Band Collar/Visible Placket/No Pocket/05 - Band Collar + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Short Panjabi/Band Collar/Visible Placket/No Pocket/05 - Band Collar + Visible Placket + No Pocket-Photoroom.webp',
      }
    },
    mandarin: {
      hidden: {
        chest: '/Canvas/Panjabi/Short Panjabi/Mandarin Collar/Hidden Placket/Chest Pocket/03 - Mandarin Collar + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Short Panjabi/Mandarin Collar/Hidden Placket/No Pocket/04 - Mandarin Collar + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Short Panjabi/Mandarin Collar/Hidden Placket/No Pocket/04 - Mandarin Collar + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Short Panjabi/Mandarin Collar/Visible Placket/Chest Pocket/01 - Mandarin Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Short Panjabi/Mandarin Collar/Visible Placket/No Pocket/02 - Mandarin Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Short Panjabi/Mandarin Collar/Visible Placket/No Pocket/02 - Mandarin Collar + Visible Placket + Chest Pocket-Photoroom.webp',
      }
    },
    shirt: {
      hidden: {
        chest: '/Canvas/Panjabi/Short Panjabi/Shirt Collar/Hidden Placket/Chest Pocket/12 - Shirt Collar + Hidden Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Short Panjabi/Shirt Collar/Hidden Placket/No Pocket/11 - Shirt Collar + Hidden Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Short Panjabi/Shirt Collar/Hidden Placket/No Pocket/11 - Shirt Collar + Hidden Placket + No Pocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Panjabi/Short Panjabi/Shirt Collar/Visible Placket/Chest Pocket/10 - Shirt Collar + Visible Placket + Chest Pocket-Photoroom.webp',
        no_pocket: '/Canvas/Panjabi/Short Panjabi/Shirt Collar/Visible Placket/No Pocket/09 - Shirt Collar + Visible Placket + No Pocket-Photoroom.webp',
        side: '/Canvas/Panjabi/Short Panjabi/Shirt Collar/Visible Placket/No Pocket/09 - Shirt Collar + Visible Placket + No Pocket-Photoroom.webp',
      }
    }
  }
};

export const SHIRT_CANVAS_MAP: Record<string, Record<string, Record<string, Record<string, string>>>> = {
  full: {
    buttondown: {
      hidden: {
        chest: '/Canvas/Shirt/Full Sleeve/ButtonDown Collar/Hidden Placket/Chest Pocket/08 - shirt_full_buttondown_hidden_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Full Sleeve/ButtonDown Collar/Hidden Placket/No Pocket/07 - shirt_full_buttondown_hidden_nopocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Shirt/Full Sleeve/ButtonDown Collar/Visible Placket/Chest Pocket/06 - shirt_full_buttondown_visible_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Full Sleeve/ButtonDown Collar/Visible Placket/No Pocket/05 - shirt_full_buttondown_visible_nopocket-Photoroom.webp',
      }
    },
    mandarin: {
      hidden: {
        chest: '/Canvas/Shirt/Full Sleeve/Mandarin Collar/Hidden Placket/Chest Pocket/12 - shirt_full_mandarin_hidden_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Full Sleeve/Mandarin Collar/Hidden Placket/No Pocket/11 - shirt_full_mandarin_hidden_nopocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Shirt/Full Sleeve/Mandarin Collar/Visible Placket/Chest Pocket/10 - shirt_full_mandarin_visible_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Full Sleeve/Mandarin Collar/Visible Placket/No Pocket/09 - shirt_full_mandarin_visible_nopocket-Photoroom.webp',
      }
    },
    spread: {
      hidden: {
        chest: '/Canvas/Shirt/Full Sleeve/Spread Collar/Hidden Placket/Chest Pocket/04 - shirt_full_spread_hidden_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Full Sleeve/Spread Collar/Hidden Placket/No Pocket/03 - shirt_full_spread_hidden_nopocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Shirt/Full Sleeve/Spread Collar/Visible Placket/Chest Pocket/02 - shirt_full_spread_visible_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Full Sleeve/Spread Collar/Visible Placket/No Pocket/01 - shirt_full_spread_visible_nopocket-Photoroom.webp',
      }
    }
  },
  half: {
    buttondown: {
      hidden: {
        chest: '/Canvas/Shirt/Half Sleeve/ButtonDown Collar/Hidden Placket/Chest Pocket/20 - shirt_half_buttondown_hidden_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Half Sleeve/ButtonDown Collar/Hidden Placket/No Pocket/19 - shirt_half_buttondown_hidden_nopocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Shirt/Half Sleeve/ButtonDown Collar/Visible Placket/Chest Pocket/18 - shirt_half_buttondown_visible_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Half Sleeve/ButtonDown Collar/Visible Placket/No Pocket/17 - shirt_half_buttondown_visible_nopocket-Photoroom.webp',
      }
    },
    mandarin: {
      hidden: {
        chest: '/Canvas/Shirt/Half Sleeve/Mandarin Collar/Hidden Placket/Chest Pocket/24 - shirt_half_mandarin_hidden_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Half Sleeve/Mandarin Collar/Hidden Placket/No Pocket/23 - shirt_half_mandarin_hidden_nopocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Shirt/Half Sleeve/Mandarin Collar/Visible Placket/Chest Pocket/22 - shirt_half_mandarin_visible_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Half Sleeve/Mandarin Collar/Visible Placket/No Pocket/21 - shirt_half_mandarin_visible_nopocket-Photoroom.webp',
      }
    },
    spread: {
      hidden: {
        chest: '/Canvas/Shirt/Half Sleeve/Spread Collar/Hidden Placket/Chest Pocket/16 - shirt_half_spread_hidden_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Half Sleeve/Spread Collar/Hidden Placket/No Pocket/15 - shirt_half_spread_hidden_nopocket-Photoroom.webp',
      },
      visible: {
        chest: '/Canvas/Shirt/Half Sleeve/Spread Collar/Visible Placket/Chest Pocket/14 - shirt_half_spread_visible_pocket-Photoroom.webp',
        no_pocket: '/Canvas/Shirt/Half Sleeve/Spread Collar/Visible Placket/No Pocket/13 - shirt_half_spread_visible_nopocket-Photoroom.webp',
      }
    }
  }
};

export const PAJAMA_CANVAS_MAP: Record<string, string> = {
  aligarhi: '/Canvas/Pajama/Aligarhi/01 - Aligarhi Pajama-Photoroom.webp',
  churidar: '/Canvas/Pajama/Churidar/02 - Churidar pajama-Photoroom.webp',
  kabuli_salwar: '/Canvas/Pajama/Kabuli Salwar Pajama/04 - Kabuli Salwar pajama - 2-Photoroom.webp',
};

// টাইপস্ক্রিপ্টের সাহায্যে স্ট্রাকচারটিকে আরও স্ট্রিক্ট এবং ডাইনামিক করা হলো
export type TailoringChoice = [string, string | null];

export interface TailoringOptionGroup {
  id: string;
  title: string;
  choices: TailoringChoice[];
  condition?: (productType: string, productStyles: Record<string, string>) => boolean;
}

export const ADVANCED_TAILORING_OPTIONS: Record<string, TailoringOptionGroup[]> = {
  panjabi: [
    { 
      id: 'bottom_cut', 
      title: 'Bottom Cut', 
      choices: [['straight_slit', '/New Ui Vectors/Bottom Hems/Panjabi Straight Slit.webp'], ['apple_cut', '/New Ui Vectors/Bottom Hems/Panjabi Apple Cut.webp']] 
    },
    { 
      id: 'sleeve_cuff', 
      title: 'Sleeve Cuff', 
      choices: [['regular_fold', '/New Ui Vectors/Cuff/Reguler.webp'], ['button_cuff', '/New Ui Vectors/Cuff/Single Button.webp'], ['french_cuff', '/New Ui Vectors/Cuff/French.webp']],
      // Logic: Hide IF subCategory === 'panjabi_madani'
      condition: (productType) => productType !== 'panjabi_madani' 
    },
    { 
      id: 'pocket_secret', 
      title: 'Secret Pocket', 
      choices: [['no_secret_pocket', '/New Ui Vectors/Pocket Options/No Secret Pocket.webp'], ['inside_secret_pocket', '/New Ui Vectors/Pocket Options/Inside Secret Pocket.webp']] 
    }
  ],
  shirt: [
    { 
      id: 'back_design', 
      title: 'Back Style', 
      choices: [['smooth', '/New Ui Vectors/Back/Shirt Smooth Back.webp'], ['box_pleat', '/New Ui Vectors/Back/Shirt Box Pleat.webp'], ['side_pleats', '/New Ui Vectors/Back/Shirt Side Pleats.webp']] 
    },
    { 
      id: 'bottom_cut', 
      title: 'Bottom Cut', 
      choices: [['curved_hem', '/New Ui Vectors/Bottom Hems/Shirt Curved Hem.webp'], ['straight_hem', '/New Ui Vectors/Bottom Hems/Shirt Straight Hem.webp']] 
    },
    { 
      id: 'cuff_style', 
      title: 'Cuff Style', 
      choices: [['regular_cuff', '/New Ui Vectors/Cuff/Single Button.webp'], ['double_button', '/New Ui Vectors/Cuff/Double Button.webp'], ['french_cuff', '/New Ui Vectors/Cuff/French.webp']],
      // Logic: Hide IF shirt_sleeve === 'half'
      condition: (_, productStyles) => productStyles.sleeve !== 'half'
    },
    { 
      id: 'pocket_secret', 
      title: 'Secret Pocket', 
      choices: [['no_secret_pocket', '/New Ui Vectors/Pocket Options/No Secret Pocket.webp'], ['inside_secret_pocket', '/New Ui Vectors/Pocket Options/Inside Secret Pocket.webp']] 
    }
  ],
  pant: [
    { 
      id: 'waistband', 
      title: 'Waistband', 
      choices: [['belt_loops', '/New Ui Vectors/Waistband options/Pant Belt Loops.webp'], ['side_adjusters', '/New Ui Vectors/Waistband options/Pant Side Adjusters.webp']] 
    },
    { 
      id: 'fastening', 
      title: 'Fastening', 
      choices: [['hook_and_bar', '/New Ui Vectors/Waistband options/Pant Hook and Bar Fastening.webp'], ['button_closure', '/New Ui Vectors/Waistband options/Pant Button Closure.webp']] 
    },
    { 
      id: 'pant_back_pocket', 
      title: 'Back Pocket', 
      choices: [['no_pocket', '/New Ui Vectors/Pocket Options/Pant No Back Pocket.webp'], ['single_welt', '/New Ui Vectors/Pocket Options/Pant Single Welt Back Pocket.webp'], ['double_welt', '/New Ui Vectors/Pocket Options/Pant Double Welt Back Pocket.webp']] 
    },
    { 
      id: 'suspender_buttons', 
      title: 'Suspender Buttons', 
      choices: [['no', '/New Ui Vectors/Waistband options/Pant Suspender Buttons - No.webp'], ['yes', '/New Ui Vectors/Waistband options/Pant Suspender Buttons - Yes.webp']] 
    }
  ],
  pajama: [
    { 
      id: 'waistband_type', 
      title: 'Waistband System', 
      choices: [['full_elastic', '/New Ui Vectors/Waistband options/Pajama Full Elastic.webp'], ['drawstring', '/New Ui Vectors/Waistband options/Pajama Drawstring.webp'], ['hybrid', '/New Ui Vectors/Waistband options/Pajama Hybrid Waistband.webp']] 
    },
    { 
      id: 'side_pockets', 
      title: 'Side Pockets', 
      choices: [['no_pockets', '/New Ui Vectors/Pocket Options/Pajama No Side Pocket.webp'], ['single_pocket', '/New Ui Vectors/Pocket Options/Pajama Single Side Pocket.webp'], ['both_sides', '/New Ui Vectors/Pocket Options/Pajama Both Side Pockets.webp']] 
    }
  ],
  jubba: [
    { 
      id: 'sleeve_style', 
      title: 'Sleeve Opening', 
      choices: [['loose_straight', '/New Ui Vectors/Cuff/Reguler.webp'], ['shirt_cuff', '/New Ui Vectors/Cuff/Single Button.webp'], ['french_cuff', '/New Ui Vectors/Cuff/French.webp']] 
    },
    { 
      id: 'pocket_secret', 
      title: 'Secret Pocket', 
      choices: [['no_secret_pocket', '/New Ui Vectors/Pocket Options/No Secret Pocket.webp'], ['inside_secret_pocket', '/New Ui Vectors/Pocket Options/Inside Secret Pocket.webp']] 
    }
  ]
};