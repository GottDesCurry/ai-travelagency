// ISO 3166-1 alpha-2 codes for the countries in src/data/iata-codes.json (needed by LiteAPI).
const CODES: Record<string, string> = {
  Switzerland: 'CH', Portugal: 'PT', France: 'FR', Spain: 'ES', Germany: 'DE', USA: 'US', 'United States': 'US', 'United Kingdom': 'GB',
  Japan: 'JP', Thailand: 'TH', Singapore: 'SG', 'United Arab Emirates': 'AE', Turkey: 'TR', Qatar: 'QA', India: 'IN', Australia: 'AU',
  Canada: 'CA', Italy: 'IT', Austria: 'AT', Netherlands: 'NL', Belgium: 'BE', Denmark: 'DK', Sweden: 'SE', 'Czech Republic': 'CZ',
  Hungary: 'HU', Poland: 'PL', Greece: 'GR', Croatia: 'HR', Serbia: 'RS', Bulgaria: 'BG', Romania: 'RO', Cyprus: 'CY', Malta: 'MT',
  Iceland: 'IS', Norway: 'NO', Finland: 'FI', Latvia: 'LV', Estonia: 'EE', Lithuania: 'LT', Ireland: 'IE', Morocco: 'MA', Egypt: 'EG',
  Israel: 'IL', Maldives: 'MV', Indonesia: 'ID', 'Hong Kong': 'HK', 'South Korea': 'KR', Malaysia: 'MY', Vietnam: 'VN', Mexico: 'MX',
  Brazil: 'BR', 'South Africa': 'ZA', Kenya: 'KE', Tanzania: 'TZ', Mauritius: 'MU',
}
export function countryCode(country: string): string | null {
  return CODES[country] ?? null
}
