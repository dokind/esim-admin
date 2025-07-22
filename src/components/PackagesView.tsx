'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Wifi, Network, Clock, Tag, X } from 'lucide-react';
import { PackageResponse, EsimPackage, SellingPrice } from '@/types/country';
import axios from 'axios';

interface PackagesViewProps {
  skuid: number;
  countryName: string;
  onBack: () => void;
  className?: string;
}

export default function PackagesView({ skuid, countryName, onBack, className = '' }: PackagesViewProps) {
  const [packageData, setPackageData] = useState<PackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usdToMntRate, setUsdToMntRate] = useState<number | null>(null);
  const [sellingPrices, setSellingPrices] = useState<SellingPrice[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<EsimPackage | null>(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchPackages(),
        fetchCurrencyRate(),
        fetchSellingPrices()
      ]);
    };
    fetchData();
  }, [skuid]);

  const fetchPackages = async () => {
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
            url: `https://mongoliansgo.hustler.mn/api/roamwifi/get-packages?sku_id=${skuid}`,
            method: 'GET'
          })
        });

        if (!response.ok) {
          throw new Error(`Backend proxy failed: ${response.status}`);
        }
        
        data = await response.json();
      } catch (proxyError) {
        console.warn('Backend proxy failed, trying direct API call:', proxyError);
        
        // Fallback to direct API call via proxy
        try {
          response = await fetch(`https://mongoliansgo.hustler.mn/api/roamwifi/get-packages?sku_id=${skuid}`);
          
          if (!response.ok) {
            throw new Error(`Direct API failed: ${response.status}`);
          }
          
          data = await response.json();
        } catch (directError) {
          console.error('All fetch methods failed:', directError);
          throw new Error('Unable to fetch package data from server');
        }
      }
      
      setPackageData(data);

    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencyRate = async () => {
    try {
      const response = await axios.get('https://api.khanbank.com/v1/rates');
      const rates = response.data;
      
      // Find USD rate in the Khanbank API response
      const usdRate = rates.find((rate: { currency: string; midRate?: number }) => rate.currency === 'USD');
      if (usdRate && usdRate.midRate) {
        setUsdToMntRate(usdRate.midRate);
      } else {
        // Fallback to a default rate if USD not found
        setUsdToMntRate(3000);
      }
    } catch (error) {
      console.error('Failed to fetch currency rates from Khanbank:', error);
      // Fallback to default rate
      setUsdToMntRate(3000);
    }
  };

  const fetchSellingPrices = async () => {
    try {
      const response = await fetch(`https://mongoliansgo.hustler.mn/api/user/page/price?sku_id=${skuid}`);
      
      if (response.ok) {
        const prices = await response.json();
        setSellingPrices(Array.isArray(prices) ? prices : []);
      } else {
        // If API fails or returns error, set empty array
        setSellingPrices([]);
      }
    } catch (error) {
      console.error('Failed to fetch selling prices:', error);
      setSellingPrices([]);
    }
  };

  const formatPrice = (price: number) => {
    // Display the actual API price as is
    const dollarPrice = price.toFixed(2);
    
    // Use Khanbank rate or fallback to default
    const exchangeRate = usdToMntRate || 3000;
    const tugrikPrice = (price * exchangeRate).toFixed(0);
    
    return {
      dollar: `$${dollarPrice}`,
      tugrik: `${tugrikPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}₮`,
      rate: exchangeRate
    };
  };

  const getSellingPrice = (packageId: number) => {
    // Try to match by packageid (from selling price API) with priceid (from package API)
    const sellingPrice = sellingPrices.find(sp => sp.packageid === packageId.toString());
    if (sellingPrice) {
      const price = parseInt(sellingPrice.price);
      return `${price.toLocaleString()}₮`;
    }
    return null;
  };

  const formatDataAmount = (flows: number, unit: string) => {
    if (flows >= 1000 && unit === 'MB') {
      return `${(flows / 1000).toFixed(0)}GB`;
    }
    return `${flows}${unit}`;
  };

  const getDurationText = (days: number) => {
    if (days === 1) return '1 Day';
    if (days < 30) return `${days} Days`;
    if (days === 30) return '1 Month';
    if (days === 90) return '3 Months';
    if (days === 180) return '6 Months';
    if (days === 365) return '1 Year';
    return `${days} Days`;
  };

  const getDiscountInfo = (pkg: EsimPackage) => {
    if (pkg.maxDiscount > 0) {
      return `Up to ${pkg.maxDiscount}% off`;
    }
    if (pkg.singleDiscount > 0) {
      return `${pkg.singleDiscount}% off`;
    }
    return null;
  };

  const handleSetPrice = (packageItem: EsimPackage) => {
    setSelectedPackage(packageItem);
    const existingPrice = getSellingPrice(packageItem.priceid);
    setNewPrice(existingPrice ? existingPrice.replace('₮', '').replace(/,/g, '') : '');
    setShowPriceModal(true);
  };

  const handleSavePrice = async () => {
    if (!selectedPackage || !newPrice) return;

    try {
      const existingSellingPrice = sellingPrices.find(sp => sp.packageid === selectedPackage.priceid.toString());
      const isUpdate = !!existingSellingPrice;

      const requestBody = {
        skuid: skuid.toString(),
        countryname: packageData?.displayEn || countryName,
        duration: getDurationText(selectedPackage.days),
        datagb: formatDataAmount(selectedPackage.flows, selectedPackage.unit),
        price: newPrice,
        packageid: selectedPackage.priceid.toString(),
        packagename: selectedPackage.showName || `${formatDataAmount(selectedPackage.flows, selectedPackage.unit)} - ${getDurationText(selectedPackage.days)}`,
        ...(isUpdate && { rowid: existingSellingPrice.rowid })
      };

      const response = await fetch('https://mongoliansgo.hustler.mn/api/user/page/price', {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message === 'success') {
          // Refresh selling prices after successful update
          await fetchSellingPrices();
          setShowPriceModal(false);
          setSelectedPackage(null);
          setNewPrice('');
        } else {
          alert('Failed to save price. Please try again.');
        }
      } else {
        console.error('Failed to save price');
        alert('Failed to save price. Please try again.');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Error saving price. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowPriceModal(false);
    setSelectedPackage(null);
    setNewPrice('');
  };

  const handleDeletePrice = async () => {
    if (!selectedPackage) return;

    const existingSellingPrice = sellingPrices.find(sp => sp.packageid === selectedPackage.priceid.toString());
    if (!existingSellingPrice) return;

    if (!confirm('Энэ үнийг устгахдаа итгэлтэй байна уу?')) return;

    try {
      const response = await fetch(`https://mongoliansgo.hustler.mn/api/user/page/price?rowid=${existingSellingPrice.rowid}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh selling prices after successful deletion
        await fetchSellingPrices();
        setShowPriceModal(false);
        setSelectedPackage(null);
        setNewPrice('');
      } else {
        console.error('Failed to delete price');
        alert('Failed to delete price. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Error deleting price. Please try again.');
    }
  };

  const sortedPackages = packageData?.esimPackageDtoList?.sort((a, b) => {
    // Sort by days first, then by flows
    if (a.days !== b.days) {
      return a.days - b.days;
    }
    return a.flows - b.flows;
  }) || [];

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading packages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Countries
        </button>
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-red-800">Error loading packages</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchPackages}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Compact Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Countries
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {packageData?.imageUrl && (
              <img 
                src={packageData.imageUrl} 
                alt={packageData.displayEn}
                className="w-12 h-12 rounded object-cover border"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {packageData?.displayEn || countryName}
              </h1>
              <p className="text-sm text-gray-600">
                {sortedPackages.length} packages available
              </p>
            </div>
          </div>
          
          {/* Current Exchange Rate Display */}
          {usdToMntRate && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Өнөөдрийн ханш</div>
              <div className="text-sm font-semibold text-gray-700">
                USD: {usdToMntRate.toFixed(2)}₮
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('mn-MN')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simplified Network Information */}
      {sortedPackages.length > 0 && sortedPackages[0].networkDtoList && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-700">
            <Network className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium mr-2">Networks:</span>
            <span>
              {sortedPackages[0].networkDtoList.map(network => network.operator).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Packages Grid - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedPackages.map((pkg) => (
          <div
            key={pkg.pid}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
          >
            {/* Compact Header */}
            <div className="mb-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {formatDataAmount(pkg.flows, pkg.unit)}
                </h3>
                <div className="text-right">
                  {/* Cost Price */}
                  <div className="text-xs text-gray-500 mb-1">Авах үнэ</div>
                  <div className="text-xs font-medium text-blue-600">
                    {formatPrice(pkg.price).tugrik}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(pkg.price).dollar}
                  </div>
                  
                  {/* Selling Price */}
                  {getSellingPrice(pkg.priceid) ? (
                    <>
                      <div className="text-xs text-gray-500 mt-2 mb-1">Зарах үнэ</div>
                      <div className="text-sm font-bold text-green-600">
                        {getSellingPrice(pkg.priceid)}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-red-500 mt-2">
                      Үнэ тохируулаагүй
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{getDurationText(pkg.days)}</p>
            </div>

            {/* Key Details Only */}
            <div className="space-y-2 mb-3">
              {pkg.supportDaypass === 1 && (
                <div className="flex items-center text-xs text-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Daily Plan</span>
                </div>
              )}
              
              {getDiscountInfo(pkg) && (
                <div className="text-xs text-green-600 font-medium">
                  {getDiscountInfo(pkg)}
                </div>
              )}

              {pkg.overlay === 1 && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600">
                  <Tag className="h-3 w-3 mr-1" />
                  Popular
                </div>
              )}
            </div>

            {/* Set Price Action Button */}
            <button 
              onClick={() => handleSetPrice(pkg)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Set Price
            </button>
          </div>
        ))}
      </div>

      {/* No packages message */}
      {sortedPackages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Wifi className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No eSIM packages available for this country</p>
        </div>
      )}

      {/* Price Setting Modal */}
      {showPriceModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {sellingPrices.find(sp => sp.packageid === selectedPackage.priceid.toString()) 
                  ? 'Үнэ засах' 
                  : 'Үнэ тохируулах'
                }
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Багц:</div>
              <div className="font-medium text-gray-900">
                {formatDataAmount(selectedPackage.flows, selectedPackage.unit)} - {getDurationText(selectedPackage.days)}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Авах үнэ:</div>
              <div className="text-blue-600 font-medium">
                {formatPrice(selectedPackage.price).tugrik} ({formatPrice(selectedPackage.price).dollar})
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Зарах үнэ (₮):
              </label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Үнэ оруулна уу"
                min="0"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Цуцлах
              </button>
              
              {sellingPrices.find(sp => sp.packageid === selectedPackage.priceid.toString()) && (
                <button
                  onClick={handleDeletePrice}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Устгах
                </button>
              )}
              
              <button
                onClick={handleSavePrice}
                disabled={!newPrice}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {sellingPrices.find(sp => sp.packageid === selectedPackage.priceid.toString()) 
                  ? 'Засах' 
                  : 'Хадгалах'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
