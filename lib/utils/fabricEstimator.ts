interface EstimatorParams {
  productKey: string; 
  measurements: Record<string, number>; 
}

export function calculateFabricYardage({ productKey, measurements }: EstimatorParams): number {
  const [motherCat, subCat] = productKey.split('_');

  if (!measurements || Object.keys(measurements).length === 0) return 2.5;

  switch (motherCat) {
    case 'panjabi': {
      const { length = 42, chest = 42 } = measurements;
      let yards = 2.25; 
      
      if (length > 42) yards += 0.25;
      if (length > 46) yards += 0.25;
      if (chest > 44) yards += 0.25;

      if (subCat === 'kabuli') yards += 0.25; 
      if (subCat === 'short') yards -= 0.50;  

      return yards;
    }
    
    case 'shirt': {
      const { length = 29, chest = 40 } = measurements;
      let yards = 1.75; 
      if (chest > 44 || length > 31) yards += 0.25;
      return yards;
    }

    case 'pant': {
      const { waist = 32, inseam = 39 } = measurements;
      let yards = 1.5;
      if (waist > 38 || inseam > 41) yards += 0.25;
      return yards;
    }

    case 'pajama': {
      const { length = 39, waist = 32 } = measurements;
      let yards = 2.0; 

      if (subCat === 'churidar') yards += 0.5; 
      else if (subCat === 'kabuli_salwar') yards += 0.75; 
      
      if (length > 42 || waist > 40) yards += 0.25;

      return yards;
    }

    case 'jubba': {
      const { length = 56, chest = 44 } = measurements;
      let yards = 3.5; 
      if (length > 58) yards += 0.25;
      if (chest > 48) yards += 0.25;
      return yards;
    }

    default:
      return 2.5;
  }
}