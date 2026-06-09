// Shared, non-secret checkout constants.

// All 27 Egyptian governorates (transliterated). Used by the shipping form and
// validated server-side.
export const EGYPTIAN_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
] as const;

export type Governorate = (typeof EGYPTIAN_GOVERNORATES)[number];

// Governorates that qualify for the lower (metro) shipping fee.
export const METRO_GOVERNORATES: ReadonlyArray<string> = ["Cairo", "Giza"];

// Egyptian mobile number validation.
export const EGYPT_PHONE_REGEX = /^(\+20|0020|0)?1[0125][0-9]{8}$/;

export const CURRENCY = "EGP";

export const CHECKOUT_STATE_KEY = "checkout_state_v1";
export const CHECKOUT_DRAFT_KEY = "checkout_draft";
