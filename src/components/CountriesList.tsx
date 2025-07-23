'use client';

import { useState, useEffect } from 'react';
import { Globe, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { Country, ContinentData } from '@/types/country';
import PackagesView from './PackagesView';

// Popular countries to display at the top - mapped to match API data
const POPULAR_COUNTRIES = [
  { name: 'China', search: 'China', flag: '🇨🇳' },
  { name: 'Japan', search: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', search: 'Korea', flag: '🇰🇷' },
  { name: 'Thailand', search: 'Thailand', flag: '🇹🇭' },
  { name: 'Vietnam', search: 'Vietnam', flag: '🇻🇳' },
  { name: 'Singapore', search: 'Singapore', flag: '🇸🇬' },
  { name: 'Malaysia', search: 'Malaysia', flag: '🇲🇾' },
  { name: 'Indonesia', search: 'Indonesia', flag: '🇮🇩' },
];

interface CountriesListProps {
  className?: string;
}

export default function CountriesList({ className = '' }: CountriesListProps) {
  const [continentData, setContinentData] = useState<ContinentData | null>(null);
  const [popularCountries, setPopularCountries] = useState<Country[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<string>('Asia');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple approaches for fetching data
      let response;
      let data;
      
      try {
        // First, try using the backend URL for CORS handling
        response = await fetch('https://mongoliansgo.hustler.mn/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: 'https://mongoliansgo.hustler.mn/api/roamwifi/get-sku-list-continent',
            method: 'GET'
          })
        });

        if (!response.ok) {
          throw new Error(`Backend proxy failed: ${response.status}`);
        }
        
        data = await response.json();
      } catch (proxyError) {
        console.warn('Backend proxy failed, trying local API route:', proxyError);
        
        // Fallback to our local API route
        response = await fetch('/api/countries');
        
        if (!response.ok) {
          throw new Error(`Local API failed: ${response.status}`);
        }
        
        data = await response.json();
      }
      
      setContinentData(data);
      
      // Extract popular countries from the data
      const allCountries: Country[] = [];
      if (data.data) {
        Object.values(data.data as Record<string, Country[]>).forEach((countries: Country[]) => {
          allCountries.push(...countries);
        });
      }
      
      // Find popular countries based on the search terms
      const foundPopular = POPULAR_COUNTRIES.map(popular => {
        const found = allCountries.find(country => 
          country.search.toLowerCase().includes(popular.search.toLowerCase()) ||
          country.display.toLowerCase().includes(popular.search.toLowerCase())
        );
        return found;
      }).filter(Boolean) as Country[];
      
      setPopularCountries(foundPopular);

    } catch (err) {
      console.error('Error fetching countries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
  };

  // Show packages view if a country is selected
  if (selectedCountry) {
    return (
      <PackagesView 
        skuid={selectedCountry.skuid} 
        countryName={selectedCountry.display}
        onBack={handleBackToCountries}
      />
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading countries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading countries</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchCountries}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getFlagForCountry = (countryName: string) => {
    const popular = POPULAR_COUNTRIES.find(p => 
      countryName.toLowerCase().includes(p.search.toLowerCase())
    );
    return popular?.flag || '🌍';
  };

  const currentCountries = continentData?.data?.[selectedContinent] || [];

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Globe className="h-6 w-6 mr-2 text-blue-500" />
          eSIM Countries Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Manage eSIM availability across different countries</p>
      </div>

      {/* Popular Countries Section */}
      {popularCountries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Countries</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularCountries.map((country) => (
              <div
                key={country.skuid}
                onClick={() => handleCountryClick(country)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:scale-105"
              >
                <div className="text-center">
                  {country.imageUrl ? (
                    <img 
                      src={country.imageUrl} 
                      alt={country.display}
                      className="w-8 h-8 mx-auto mb-2 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.textContent = getFlagForCountry(country.display);
                          fallback.className = 'text-2xl mb-2';
                          parent.insertBefore(fallback, target);
                        }
                      }}
                    />
                  ) : (
                    <div className="text-2xl mb-2">{getFlagForCountry(country.display)}</div>
                  )}
                  <div className="text-sm font-medium text-gray-900">{country.display}</div>
                  <div className="text-xs text-gray-500">SKU: {country.skuid}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continent Navigation */}
      {continentData?.continent && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Browse by Continent</h2>
          <div className="flex flex-wrap gap-2">
            {continentData.continent.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedContinent === continent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="inline h-4 w-4 mr-1" />
                {continent}
                {continentData.data[continent] && (
                  <span className="ml-1 text-xs opacity-75">
                    ({continentData.data[continent].length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Countries Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedContinent} Countries
          </h2>
          <span className="text-sm text-gray-500">
            {currentCountries.length} countries available
          </span>
        </div>
        
        {currentCountries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No countries data available for {selectedContinent}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentCountries.map((country, index) => (
              <div
                key={`${country.skuid}-${country.display}-${index}`}
                onClick={() => handleCountryClick(country)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {country.imageUrl ? (
                      <img 
                        src={country.imageUrl} 
                        alt={country.display}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.textContent = getFlagForCountry(country.display);
                            fallback.className = 'text-2xl';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="text-2xl">{getFlagForCountry(country.display)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{country.display}</div>
                    <div className="text-sm text-gray-500">SKU: {country.skuid}</div>
                    <div className="text-xs text-gray-400">Code: {country.countryCode}</div>
                    {country.note && (
                      <div className="text-xs text-blue-600 mt-1 truncate" title={country.note}>
                        {country.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
