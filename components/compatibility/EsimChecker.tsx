'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Smartphone,
  CheckCircle,
  XCircle,
  ChevronDown,
  Phone,
  Settings,
  Search,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

// Type definitions for device data
interface DeviceData {
  compatible: string[];
  notCompatible: string[];
  checkPath: string;
}

type DeviceDatabase = Record<string, DeviceData>;

type Brand = string;

interface DetectionResult {
  detected: boolean;
  brand?: Brand;
  model?: string;
  isCompatible?: boolean;
  isMobile: boolean;
}

function detectDevice(brands: string[]): DetectionResult {
  if (typeof window === 'undefined') {
    return { detected: false, isMobile: false };
  }

  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  // iPhone detection
  if (/iPhone/.test(ua)) {
    const match = ua.match(/iPhone\s*(\d+),(\d+)/);
    if (match) {
      const major = parseInt(match[1]);
      if (major >= 11) {
        return {
          detected: true,
          brand: brands.includes('Apple') ? 'Apple' : undefined,
          model: 'iPhone',
          isCompatible: true,
          isMobile: true,
        };
      }
    }
    return {
      detected: true,
      brand: brands.includes('Apple') ? 'Apple' : undefined,
      model: 'iPhone',
      isCompatible: undefined,
      isMobile: true,
    };
  }

  // iPad detection
  if (/iPad/.test(ua)) {
    return {
      detected: true,
      brand: brands.includes('Apple') ? 'Apple' : undefined,
      model: 'iPad',
      isCompatible: undefined,
      isMobile: true,
    };
  }

  // Android detection - brand detection
  if (/Android/.test(ua)) {
    const brandMap: Record<string, RegExp> = {
      Samsung: /Samsung/i,
      Google: /Pixel/i,
      OnePlus: /OnePlus/i,
      Xiaomi: /Xiaomi|Mi\s|Redmi/i,
      Oppo: /OPPO/i,
      Motorola: /motorola/i,
      Huawei: /HUAWEI/i,
    };

    for (const [brand, regex] of Object.entries(brandMap)) {
      if (regex.test(ua) && brands.includes(brand)) {
        return { detected: true, brand, isMobile: true };
      }
    }
    return { detected: false, isMobile: true };
  }

  return { detected: false, isMobile: false };
}

type Tab = 'auto' | 'manual' | 'dial';

export function EsimChecker() {
  const [activeTab, setActiveTab] = useState<Tab>('auto');
  const [detection, setDetection] = useState<DetectionResult>({ detected: false, isMobile: false });
  const [selectedBrand, setSelectedBrand] = useState<Brand | ''>('');
  const [selectedModel, setSelectedModel] = useState('');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceDatabase, setDeviceDatabase] = useState<DeviceDatabase>({});
  const [loading, setLoading] = useState(true);

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch device data from API
  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await fetch('/api/devices');
        if (response.ok) {
          const data = await response.json();
          setDeviceDatabase(data);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  // Run device detection after data is loaded
  useEffect(() => {
    if (!loading && Object.keys(deviceDatabase).length > 0) {
      const brands = Object.keys(deviceDatabase);
      const result = detectDevice(brands);
      setDetection(result);
      if (result.brand) {
        setSelectedBrand(result.brand);
      }
    }
  }, [loading, deviceDatabase]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setBrandDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const brands = Object.keys(deviceDatabase);

  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    const brandData = deviceDatabase[selectedBrand];
    if (!brandData) return [];
    const allModels = [...brandData.compatible, ...brandData.notCompatible];
    if (!searchQuery) return allModels;
    return allModels.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedBrand, searchQuery, deviceDatabase]);

  const checkResult = useMemo(() => {
    if (!selectedBrand || !selectedModel) return null;
    const brandData = deviceDatabase[selectedBrand];
    if (!brandData) return null;
    if (brandData.compatible.includes(selectedModel)) {
      return { compatible: true, checkPath: brandData.checkPath };
    }
    if (brandData.notCompatible.includes(selectedModel)) {
      return { compatible: false, checkPath: brandData.checkPath };
    }
    return null;
  }, [selectedBrand, selectedModel, deviceDatabase]);

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-soft">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white rounded-t-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Smartphone className="w-6 h-6" />
          <h3 className="text-xl font-bold">eSIM Compatibility Checker</h3>
        </div>
        <p className="text-brand-100 text-sm">
          Check if your phone supports eSIM in seconds
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-200">
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'auto'
              ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50'
              : 'text-navy-400 hover:text-navy-600 hover:bg-cream-50'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Auto-Detect
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50'
              : 'text-navy-400 hover:text-navy-600 hover:bg-cream-50'
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Find My Phone
        </button>
        <button
          onClick={() => setActiveTab('dial')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'dial'
              ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50'
              : 'text-navy-400 hover:text-navy-600 hover:bg-cream-50'
          }`}
        >
          <Phone className="w-4 h-4 inline mr-2" />
          Quick Check
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
            <p className="text-navy-400">Loading device data...</p>
          </div>
        )}

        {/* Auto-Detect Tab */}
        {!loading && activeTab === 'auto' && (
          <div className="space-y-4">
            {detection.detected ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-navy-400">Detected Device</p>
                    <p className="font-semibold text-navy-600">
                      {detection.brand} {detection.model || 'Device'}
                    </p>
                  </div>
                </div>

                {detection.isCompatible === true && (
                  <div className="flex items-start gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
                    <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-success-700">Great news! Your device supports eSIM</p>
                      <p className="text-sm text-success-600 mt-1">
                        You can use Trvel eSIM on this device.
                      </p>
                    </div>
                  </div>
                )}

                {detection.isCompatible === undefined && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <HelpCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-700">We detected your device brand</p>
                      <p className="text-sm text-amber-600 mt-1">
                        Use the &quot;Find My Phone&quot; tab to select your exact model and confirm compatibility.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                {detection.isMobile ? (
                  <>
                    <HelpCircle className="w-12 h-12 text-navy-300 mx-auto mb-4" />
                    <p className="text-navy-500 font-medium">Couldn&apos;t auto-detect your device</p>
                    <p className="text-navy-400 text-sm mt-2">
                      Use the &quot;Find My Phone&quot; tab to manually check compatibility.
                    </p>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-12 h-12 text-navy-300 mx-auto mb-4" />
                    <p className="text-navy-500 font-medium">Visit this page on your phone</p>
                    <p className="text-navy-400 text-sm mt-2">
                      Or use the &quot;Find My Phone&quot; tab to check compatibility.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {!loading && activeTab === 'manual' && (
          <div className="space-y-4">
            {/* Brand Dropdown */}
            <div ref={brandDropdownRef}>
              <label className="block text-sm font-medium text-navy-500 mb-2">
                Phone Brand
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setBrandDropdownOpen(!brandDropdownOpen);
                    setModelDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 p-4 bg-cream-50 border border-cream-200 rounded-xl hover:border-brand-300 transition-colors text-left"
                >
                  <span className={selectedBrand ? 'text-navy-600 font-medium' : 'text-navy-400'}>
                    {selectedBrand || 'Select brand'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {brandDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-cream-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBrand(brand);
                          setSelectedModel('');
                          setBrandDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors text-left border-b border-cream-100 last:border-b-0"
                      >
                        <span className="font-medium text-navy-600">{brand}</span>
                        {selectedBrand === brand && (
                          <CheckCircle className="w-5 h-5 text-brand-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Model Dropdown */}
            {selectedBrand && (
              <div ref={modelDropdownRef}>
                <label className="block text-sm font-medium text-navy-500 mb-2">
                  Phone Model
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setModelDropdownOpen(!modelDropdownOpen);
                      setBrandDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-cream-50 border border-cream-200 rounded-xl hover:border-brand-300 transition-colors text-left"
                  >
                    <span className={selectedModel ? 'text-navy-600 font-medium' : 'text-navy-400'}>
                      {selectedModel || 'Select model'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {modelDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-cream-200 rounded-xl shadow-lg">
                      {/* Search input */}
                      <div className="p-3 border-b border-cream-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                          <input
                            type="text"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredModels.map((model) => {
                          const isCompatible = deviceDatabase[selectedBrand].compatible.includes(model);
                          return (
                            <button
                              key={model}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModel(model);
                                setModelDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors text-left border-b border-cream-100 last:border-b-0"
                            >
                              <span className="text-navy-600">{model}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isCompatible
                                  ? 'bg-success-100 text-success-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {isCompatible ? 'Compatible' : 'Not Compatible'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {checkResult && (
              <div className={`p-4 rounded-xl border ${
                checkResult.compatible
                  ? 'bg-success-50 border-success-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {checkResult.compatible ? (
                    <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold ${checkResult.compatible ? 'text-success-700' : 'text-red-700'}`}>
                      {checkResult.compatible
                        ? 'Your device supports eSIM!'
                        : 'This device does not support eSIM'}
                    </p>
                    {checkResult.compatible && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-navy-400 mb-1">How to add eSIM:</p>
                        <p className="text-sm font-medium text-navy-600 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          {checkResult.checkPath}
                        </p>
                      </div>
                    )}
                    {!checkResult.compatible && (
                      <p className="text-sm text-red-600 mt-1">
                        You&apos;ll need a physical SIM card for this device, or consider upgrading to a newer model.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dial Tab */}
        {!loading && activeTab === 'dial' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-navy-500 mb-4">
                The quickest way to check eSIM support is by dialing a special code on your phone.
              </p>

              {/* Dial button */}
              <a
                href="tel:*%2306%23"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all text-lg"
              >
                <Phone className="w-6 h-6" />
                Dial *#06#
                <ExternalLink className="w-5 h-5" />
              </a>

              <p className="text-sm text-navy-400 mt-3">
                Tap to open your phone&apos;s dialer with this code
              </p>
            </div>

            <div className="border-t border-cream-200 pt-6">
              <h4 className="font-semibold text-navy-600 mb-4">What to look for:</h4>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-success-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success-700">If you see &quot;EID&quot; number</p>
                    <p className="text-sm text-success-600">
                      Your phone supports eSIM! The EID is your embedded SIM identifier.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">If you only see IMEI number(s)</p>
                    <p className="text-sm text-red-600">
                      Your phone likely doesn&apos;t support eSIM, or the feature may be carrier-locked.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative check methods */}
            <div className="border-t border-cream-200 pt-6">
              <h4 className="font-semibold text-navy-600 mb-4">Alternative: Check your settings</h4>

              <div className="grid gap-3">
                <div className="p-4 bg-cream-50 rounded-xl">
                  <p className="font-medium text-navy-600 mb-1">iPhone</p>
                  <p className="text-sm text-navy-400 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings → Mobile Data → Add eSIM
                  </p>
                </div>
                <div className="p-4 bg-cream-50 rounded-xl">
                  <p className="font-medium text-navy-600 mb-1">Samsung</p>
                  <p className="text-sm text-navy-400 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings → Connections → SIM Manager → Add eSIM
                  </p>
                </div>
                <div className="p-4 bg-cream-50 rounded-xl">
                  <p className="font-medium text-navy-600 mb-1">Google Pixel</p>
                  <p className="text-sm text-navy-400 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings → Network & Internet → SIMs → Add eSIM
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="px-6 py-4 bg-cream-50 border-t border-cream-200 rounded-b-2xl">
        <p className="text-xs text-navy-400 text-center">
          Your phone must be carrier-unlocked to use eSIM. Contact your carrier if you&apos;re unsure.
        </p>
      </div>
    </div>
  );
}
