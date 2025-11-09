// Global countries and regions data
export interface Country {
  code: string;
  name: string;
  regions: Region[];
}

export interface Region {
  code: string;
  name: string;
  provinces?: Province[];
}

export interface Province {
  code: string;
  name: string;
  cities?: string[];
}

export const countries: Country[] = [
  {
    code: 'HK',
    name: 'Hong Kong',
    regions: [
      {
        code: 'HK',
        name: 'Hong Kong',
        provinces: [
          {
            code: 'HKI',
            name: 'Hong Kong Island',
            cities: ['Central', 'Wan Chai', 'Causeway Bay', 'North Point', 'Chai Wan']
          },
          {
            code: 'KLN',
            name: 'Kowloon',
            cities: ['Tsim Sha Tsui', 'Mong Kok', 'Yau Ma Tei', 'Hung Hom', 'Kwun Tong']
          },
          {
            code: 'NT',
            name: 'New Territories',
            cities: ['Sha Tin', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long', 'Tai Po']
          }
        ]
      }
    ]
  },
  {
    code: 'CN',
    name: 'China',
    regions: [
      {
        code: 'CN-11',
        name: 'Beijing',
        provinces: [
          {
            code: 'BJ',
            name: 'Beijing',
            cities: ['Dongcheng', 'Xicheng', 'Chaoyang', 'Haidian', 'Fengtai']
          }
        ]
      },
      {
        code: 'CN-31',
        name: 'Shanghai',
        provinces: [
          {
            code: 'SH',
            name: 'Shanghai',
            cities: ['Pudong', 'Huangpu', 'Xuhui', 'Changning', 'Jing\'an']
          }
        ]
      },
      {
        code: 'CN-44',
        name: 'Guangdong',
        provinces: [
          {
            code: 'GZ',
            name: 'Guangzhou',
            cities: ['Tianhe', 'Yuexiu', 'Haizhu', 'Liwan', 'Baiyun']
          },
          {
            code: 'SZ',
            name: 'Shenzhen',
            cities: ['Futian', 'Luohu', 'Nanshan', 'Bao\'an', 'Longgang']
          }
        ]
      }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    regions: [
      {
        code: 'CA',
        name: 'California',
        provinces: [
          {
            code: 'CA-LA',
            name: 'Los Angeles County',
            cities: ['Los Angeles', 'Long Beach', 'Pasadena', 'Glendale', 'Santa Monica']
          },
          {
            code: 'CA-SF',
            name: 'San Francisco County',
            cities: ['San Francisco', 'Oakland', 'Berkeley', 'Fremont', 'San Jose']
          }
        ]
      },
      {
        code: 'NY',
        name: 'New York',
        provinces: [
          {
            code: 'NY-NYC',
            name: 'New York City',
            cities: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
          }
        ]
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    regions: [
      {
        code: 'ENG',
        name: 'England',
        provinces: [
          {
            code: 'LDN',
            name: 'London',
            cities: ['Westminster', 'Camden', 'Islington', 'Hackney', 'Tower Hamlets']
          },
          {
            code: 'MAN',
            name: 'Manchester',
            cities: ['Manchester City Centre', 'Salford', 'Trafford', 'Stockport']
          }
        ]
      },
      {
        code: 'SCT',
        name: 'Scotland',
        provinces: [
          {
            code: 'EDI',
            name: 'Edinburgh',
            cities: ['Old Town', 'New Town', 'Leith', 'Portobello']
          }
        ]
      }
    ]
  },
  {
    code: 'SG',
    name: 'Singapore',
    regions: [
      {
        code: 'SG',
        name: 'Singapore',
        provinces: [
          {
            code: 'CENTRAL',
            name: 'Central Region',
            cities: ['Orchard', 'Marina Bay', 'Chinatown', 'Little India']
          },
          {
            code: 'EAST',
            name: 'East Region',
            cities: ['Bedok', 'Tampines', 'Pasir Ris', 'Changi']
          },
          {
            code: 'WEST',
            name: 'West Region',
            cities: ['Jurong', 'Clementi', 'Bukit Batok', 'Choa Chu Kang']
          }
        ]
      }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    regions: [
      {
        code: 'JP-13',
        name: 'Tokyo',
        provinces: [
          {
            code: 'TKY',
            name: 'Tokyo',
            cities: ['Shibuya', 'Shinjuku', 'Minato', 'Chiyoda', 'Chuo']
          }
        ]
      },
      {
        code: 'JP-27',
        name: 'Osaka',
        provinces: [
          {
            code: 'OSA',
            name: 'Osaka',
            cities: ['Kita', 'Chuo', 'Nishi', 'Tennoji', 'Naniwa']
          }
        ]
      }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    regions: [
      {
        code: 'NSW',
        name: 'New South Wales',
        provinces: [
          {
            code: 'SYD',
            name: 'Sydney',
            cities: ['Sydney CBD', 'North Sydney', 'Parramatta', 'Bondi', 'Manly']
          }
        ]
      },
      {
        code: 'VIC',
        name: 'Victoria',
        provinces: [
          {
            code: 'MEL',
            name: 'Melbourne',
            cities: ['Melbourne CBD', 'St Kilda', 'Richmond', 'Carlton', 'South Yarra']
          }
        ]
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    regions: [
      {
        code: 'ON',
        name: 'Ontario',
        provinces: [
          {
            code: 'TOR',
            name: 'Toronto',
            cities: ['Downtown Toronto', 'North York', 'Scarborough', 'Etobicoke', 'York']
          }
        ]
      },
      {
        code: 'BC',
        name: 'British Columbia',
        provinces: [
          {
            code: 'VAN',
            name: 'Vancouver',
            cities: ['Downtown Vancouver', 'Richmond', 'Burnaby', 'Surrey', 'Coquitlam']
          }
        ]
      }
    ]
  }
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code);
}

export function getRegionsByCountry(countryCode: string): Region[] {
  const country = getCountryByCode(countryCode);
  return country?.regions || [];
}

export function getProvincesByRegion(countryCode: string, regionCode: string): Province[] {
  const country = getCountryByCode(countryCode);
  const region = country?.regions.find(r => r.code === regionCode);
  return region?.provinces || [];
}

export function getCitiesByProvince(countryCode: string, regionCode: string, provinceCode: string): string[] {
  const country = getCountryByCode(countryCode);
  const region = country?.regions.find(r => r.code === regionCode);
  const province = region?.provinces?.find(p => p.code === provinceCode);
  return province?.cities || [];
}

// Helper function to get cities by province code directly (searches all regions)
export function getCitiesByProvinceCode(countryCode: string, provinceCode: string): string[] {
  const country = getCountryByCode(countryCode);
  if (!country) return [];
  
  for (const region of country.regions) {
    const province = region.provinces?.find(p => p.code === provinceCode);
    if (province) {
      return province.cities || [];
    }
  }
  return [];
}

// Helper function to get the region code for a province code
export function getRegionCodeByProvinceCode(countryCode: string, provinceCode: string): string | undefined {
  const country = getCountryByCode(countryCode);
  if (!country) return undefined;
  
  for (const region of country.regions) {
    const province = region.provinces?.find(p => p.code === provinceCode);
    if (province) {
      return region.code;
    }
  }
  return undefined;
}


