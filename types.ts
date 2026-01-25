
export enum KegType {
  K20L = '20L',
  K30L = '30L',
  K30EE = '30EE',
  PET = 'PET'
}

export interface CalculationResult {
  filledLitres: number;
  wasteLitres: number;
  wastePercentage: number;
  fullPallets: number;
  remainingKegs: number;
  totalKegs: number;
  kegType: KegType;
  availableProduct: number;
  timestamp: number;
}

export interface KegConfig {
  volume: number;
  perPallet: number;
}

export const KEG_CONFIGS: Record<KegType, KegConfig> = {
  [KegType.K20L]: { volume: 20, perPallet: 24 },
  [KegType.K30L]: { volume: 30, perPallet: 24 },
  [KegType.K30EE]: { volume: 30, perPallet: 18 },
  [KegType.PET]: { volume: 30, perPallet: 16 }
};
