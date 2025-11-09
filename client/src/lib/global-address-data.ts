// Global address data using country-state-city library
import { Country, State, City } from 'country-state-city';

// Re-export types for convenience
export interface CountryData {
  code: string;
  name: string;
  phonecode: string;
}

export interface StateData {
  code: string;
  name: string;
  countryCode: string;
}

export interface CityData {
  name: string;
  stateCode: string;
  countryCode: string;
}

/**
 * Get all countries
 */
export function getAllCountries(): CountryData[] {
  return Country.getAllCountries().map(country => ({
    code: country.isoCode,
    name: country.name,
    phonecode: country.phonecode
  }));
}

/**
 * Get country by ISO code
 */
export function getCountryByCode(code: string): CountryData | undefined {
  const country = Country.getCountryByCode(code);
  if (!country) return undefined;
  
  return {
    code: country.isoCode,
    name: country.name,
    phonecode: country.phonecode
  };
}

/**
 * Get all states/provinces for a country
 */
export function getStatesByCountry(countryCode: string): StateData[] {
  return State.getStatesOfCountry(countryCode).map(state => ({
    code: state.isoCode,
    name: state.name,
    countryCode: state.countryCode
  }));
}

/**
 * Get state by code
 */
export function getStateByCode(countryCode: string, stateCode: string): StateData | undefined {
  const state = State.getStateByCodeAndCountry(stateCode, countryCode);
  if (!state) return undefined;
  
  return {
    code: state.isoCode,
    name: state.name,
    countryCode: state.countryCode
  };
}

/**
 * Get all cities for a state
 */
export function getCitiesByState(countryCode: string, stateCode: string): CityData[] {
  return City.getCitiesOfState(countryCode, stateCode).map(city => ({
    name: city.name,
    stateCode: city.stateCode,
    countryCode: city.countryCode
  }));
}

/**
 * Get all cities for a country (useful for small countries without states)
 */
export function getCitiesByCountry(countryCode: string): CityData[] {
  return City.getCitiesOfCountry(countryCode).map(city => ({
    name: city.name,
    stateCode: city.stateCode,
    countryCode: city.countryCode
  }));
}

/**
 * Search countries by name (case-insensitive)
 */
export function searchCountries(query: string): CountryData[] {
  const lowerQuery = query.toLowerCase();
  return getAllCountries().filter(country => 
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search states by name (case-insensitive)
 */
export function searchStates(countryCode: string, query: string): StateData[] {
  const lowerQuery = query.toLowerCase();
  return getStatesByCountry(countryCode).filter(state =>
    state.name.toLowerCase().includes(lowerQuery) ||
    state.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search cities by name (case-insensitive)
 */
export function searchCities(countryCode: string, stateCode: string, query: string): CityData[] {
  const lowerQuery = query.toLowerCase();
  return getCitiesByState(countryCode, stateCode).filter(city =>
    city.name.toLowerCase().includes(lowerQuery)
  );
}



