export type DailySummaryRow = {
  id: string;
  date: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  hydration_l: number | null;
  recovery_score: number | null;
  strain_score: number | null;
  sleep_hours: number | null;
  vitamin_d_mcg: number | null;
  vitamin_c_mg: number | null;
  iron_mg: number | null;
  magnesium_mg: number | null;
  sodium_mg: number | null;
};

export type ServingRow = {
  id: string;
  date: string;
  meal: string | null;
  food_name: string;
  quantity: number | null;
  unit: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

export type BiometricsRow = {
  id: string;
  date: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  resting_hr: number | null;
  hrv_ms: number | null;
  recovery_score: number | null;
};
