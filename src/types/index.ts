// Helper
// HACK: Not supported negative infinity
// ref. https://github.com/microsoft/TypeScript/issues/32277
export type Infinity = 1e999

// VO
export type Price = number
export type kWh = number
export type UsageRange = { from: 0 | kWh; to: kWh | Infinity; price: Price }
export type Plan = {
  basic: Price
  fuelAdjustment: Price
  usage: UsageRange[]
}

// DTO
export type PlanDefinition = {
  name: string
  plan: Plan
}
export type Supplier = {
  name: string
  plans: PlanDefinition[]
}
