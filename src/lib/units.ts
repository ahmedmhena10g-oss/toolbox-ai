export interface UnitCategory {
  id: string;
  name: string;
  units: { id: string; name: string; /** factor to base unit */ factor: number; offset?: number }[];
  /** id of the base unit (factor 1) */
  base: string;
}

export const unitCategories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    base: "meter",
    units: [
      { id: "millimeter", name: "Millimeter (mm)", factor: 0.001 },
      { id: "centimeter", name: "Centimeter (cm)", factor: 0.01 },
      { id: "meter", name: "Meter (m)", factor: 1 },
      { id: "kilometer", name: "Kilometer (km)", factor: 1000 },
      { id: "inch", name: "Inch (in)", factor: 0.0254 },
      { id: "foot", name: "Foot (ft)", factor: 0.3048 },
      { id: "yard", name: "Yard (yd)", factor: 0.9144 },
      { id: "mile", name: "Mile (mi)", factor: 1609.344 },
      { id: "nautical-mile", name: "Nautical mile", factor: 1852 },
    ],
  },
  {
    id: "weight",
    name: "Weight",
    base: "kilogram",
    units: [
      { id: "milligram", name: "Milligram (mg)", factor: 0.000001 },
      { id: "gram", name: "Gram (g)", factor: 0.001 },
      { id: "kilogram", name: "Kilogram (kg)", factor: 1 },
      { id: "tonne", name: "Tonne (t)", factor: 1000 },
      { id: "ounce", name: "Ounce (oz)", factor: 0.028349523125 },
      { id: "pound", name: "Pound (lb)", factor: 0.45359237 },
      { id: "stone", name: "Stone (st)", factor: 6.35029318 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    base: "celsius",
    units: [
      { id: "celsius", name: "Celsius (°C)", factor: 1 },
      { id: "fahrenheit", name: "Fahrenheit (°F)", factor: 1, offset: 1 },
      { id: "kelvin", name: "Kelvin (K)", factor: 1, offset: 2 },
    ],
  },
  {
    id: "area",
    name: "Area",
    base: "square-meter",
    units: [
      { id: "square-centimeter", name: "Square cm (cm²)", factor: 0.0001 },
      { id: "square-meter", name: "Square meter (m²)", factor: 1 },
      { id: "hectare", name: "Hectare (ha)", factor: 10000 },
      { id: "square-kilometer", name: "Square km (km²)", factor: 1000000 },
      { id: "square-inch", name: "Square inch (in²)", factor: 0.00064516 },
      { id: "square-foot", name: "Square foot (ft²)", factor: 0.09290304 },
      { id: "acre", name: "Acre", factor: 4046.8564224 },
      { id: "square-mile", name: "Square mile (mi²)", factor: 2589988.110336 },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    base: "liter",
    units: [
      { id: "milliliter", name: "Milliliter (mL)", factor: 0.001 },
      { id: "liter", name: "Liter (L)", factor: 1 },
      { id: "cubic-meter", name: "Cubic meter (m³)", factor: 1000 },
      { id: "teaspoon", name: "Teaspoon (US)", factor: 0.00492892 },
      { id: "tablespoon", name: "Tablespoon (US)", factor: 0.0147868 },
      { id: "fluid-ounce", name: "Fluid ounce (US)", factor: 0.0295735 },
      { id: "cup", name: "Cup (US)", factor: 0.236588 },
      { id: "pint", name: "Pint (US)", factor: 0.473176 },
      { id: "quart", name: "Quart (US)", factor: 0.946353 },
      { id: "gallon", name: "Gallon (US)", factor: 3.78541 },
    ],
  },
  {
    id: "time",
    name: "Time",
    base: "second",
    units: [
      { id: "millisecond", name: "Millisecond (ms)", factor: 0.001 },
      { id: "second", name: "Second (s)", factor: 1 },
      { id: "minute", name: "Minute (min)", factor: 60 },
      { id: "hour", name: "Hour (h)", factor: 3600 },
      { id: "day", name: "Day", factor: 86400 },
      { id: "week", name: "Week", factor: 604800 },
      { id: "month", name: "Month (avg)", factor: 2629800 },
      { id: "year", name: "Year (avg)", factor: 31557600 },
    ],
  },
  {
    id: "data",
    name: "Data storage",
    base: "byte",
    units: [
      { id: "bit", name: "Bit (b)", factor: 0.125 },
      { id: "byte", name: "Byte (B)", factor: 1 },
      { id: "kilobyte", name: "Kilobyte (KB)", factor: 1000 },
      { id: "megabyte", name: "Megabyte (MB)", factor: 1000000 },
      { id: "gigabyte", name: "Gigabyte (GB)", factor: 1000000000 },
      { id: "terabyte", name: "Terabyte (TB)", factor: 1000000000000 },
      { id: "kibibyte", name: "Kibibyte (KiB)", factor: 1024 },
      { id: "mebibyte", name: "Mebibyte (MiB)", factor: 1048576 },
      { id: "gibibyte", name: "Gibibyte (GiB)", factor: 1073741824 },
    ],
  },
];

export const categoryById = Object.fromEntries(
  unitCategories.map((c) => [c.id, c])
);

/** Convert a value from one unit to another within a category. */
export const convertUnit = (
  categoryId: string,
  value: number,
  fromId: string,
  toId: string
): number | null => {
  const category = categoryById[categoryId];
  if (!category) return null;
  const from = category.units.find((u) => u.id === fromId);
  const to = category.units.find((u) => u.id === toId);
  if (!from || !to) return null;

  if (categoryId === "temperature") {
    // Special-case temperature conversions (affine, not linear).
    if (fromId === "celsius" && toId === "fahrenheit") return (value * 9) / 5 + 32;
    if (fromId === "celsius" && toId === "kelvin") return value + 273.15;
    if (fromId === "fahrenheit" && toId === "celsius") return ((value - 32) * 5) / 9;
    if (fromId === "fahrenheit" && toId === "kelvin") return ((value - 32) * 5) / 9 + 273.15;
    if (fromId === "kelvin" && toId === "celsius") return value - 273.15;
    if (fromId === "kelvin" && toId === "fahrenheit") return ((value - 273.15) * 9) / 5 + 32;
    return value;
  }

  return (value * from.factor) / to.factor;
};

export const formatNumber = (value: number, maxDecimals = 6): string => {
  if (!Number.isFinite(value)) return "—";
  const rounded = parseFloat(value.toFixed(maxDecimals));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
};
