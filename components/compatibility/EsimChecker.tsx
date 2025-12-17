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
} from 'lucide-react';

// Comprehensive eSIM compatible device database
const deviceDatabase = {
  Apple: {
    compatible: [
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
      'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
      'iPhone XS Max', 'iPhone XS', 'iPhone XR',
      'iPhone SE (3rd generation)', 'iPhone SE (2nd generation)',
      'iPad Pro (all models with cellular)',
      'iPad Air (3rd generation and later)',
      'iPad (7th generation and later)',
      'iPad mini (5th generation and later)',
    ],
    notCompatible: [
      'iPhone X', 'iPhone 8', 'iPhone 8 Plus', 'iPhone 7', 'iPhone 6s',
      'iPhone SE (1st generation)',
    ],
    checkPath: 'Settings → Mobile Data → Add eSIM',
  },
  Samsung: {
    compatible: [
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
      'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
      'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S20 FE',
      'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3', 'Galaxy Z Fold 2',
      'Galaxy Z Flip 6', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3', 'Galaxy Z Flip',
      'Galaxy Note 20 Ultra', 'Galaxy Note 20',
      'Galaxy A55', 'Galaxy A54', 'Galaxy A35', 'Galaxy A34',
    ],
    notCompatible: [
      'Galaxy S10', 'Galaxy S9', 'Galaxy Note 10', 'Galaxy Note 9',
      'Galaxy A53', 'Galaxy A52', 'Galaxy A51',
    ],
    checkPath: 'Settings → Connections → SIM Manager → Add eSIM',
  },
  Google: {
    compatible: [
      'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 9 Pro Fold',
      'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
      'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
      'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
      'Pixel 5', 'Pixel 5a',
      'Pixel 4 XL', 'Pixel 4', 'Pixel 4a',
      'Pixel 3 XL', 'Pixel 3', 'Pixel 3a XL', 'Pixel 3a',
      'Pixel Fold',
    ],
    notCompatible: [
      'Pixel 2', 'Pixel 2 XL', 'Pixel', 'Pixel XL',
    ],
    checkPath: 'Settings → Network & Internet → SIMs → Add eSIM',
  },
  OnePlus: {
    compatible: [
      'OnePlus 12', 'OnePlus 12R',
      'OnePlus 11', 'OnePlus 11R',
      'OnePlus Open',
    ],
    notCompatible: [
      'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus 9', 'OnePlus 8',
    ],
    checkPath: 'Settings → Mobile Network → SIM & Network → Add eSIM',
  },
  Xiaomi: {
    compatible: [
      'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
      'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13',
      'Xiaomi 12S Ultra', 'Xiaomi 12 Pro',
    ],
    notCompatible: [
      'Xiaomi 12', 'Xiaomi 11', 'Redmi Note series',
    ],
    checkPath: 'Settings → SIM Cards & Mobile Networks → Add eSIM',
  },
  Oppo: {
    compatible: [
      'Find X7 Ultra', 'Find X7',
      'Find X6 Pro', 'Find X6',
      'Find X5 Pro', 'Find X5',
      'Find N3', 'Find N2', 'Find N2 Flip',
    ],
    notCompatible: [
      'Reno series (most models)', 'A series',
    ],
    checkPath: 'Settings → SIM Card & Mobile Data → Add eSIM',
  },
  Motorola: {
    compatible: [
      'Motorola Razr 40 Ultra', 'Motorola Razr 40',
      'Motorola Razr (2023)', 'Motorola Razr (2022)',
      'Motorola Edge 40 Pro', 'Motorola Edge 40',
      'Motorola Edge+ (2023)',
    ],
    notCompatible: [
      'Moto G series', 'Moto E series',
    ],
    checkPath: 'Settings → Network & Internet → SIMs → Add eSIM',
  },
  Huawei: {
    compatible: [
      'P40 Pro', 'P40',
      'Mate 40 Pro',
    ],
    notCompatible: [
      'Most newer Huawei models (due to US restrictions)',
    ],
    checkPath: 'Settings → Mobile Network → SIM Management',
  },
};

type Brand = keyof typeof deviceDatabase;

interface DetectionResult {
  detected: boolean;
  brand?: Brand;
  model?: string;
  isCompatible?: boolean;
  isMobile: boolean;
}

function detectDevice(): DetectionResult {
  if (typeof window === 'undefined') {
    return { detected: false, isMobile: false };
  }

  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  // iPhone detection
  if (/iPhone/.test(ua)) {
    // Try to extract iPhone model
    const match = ua.match(/iPhone\s*(\d+),(\d+)/);
    if (match) {
      const major = parseInt(match[1]);
      // iPhone 11,2 = iPhone XS (2018), first with eSIM
      // Anything >= iPhone 11 hardware is compatible
      if (major >= 11) {
        return {
          detected: true,
          brand: 'Apple',
          model: 'iPhone',
          isCompatible: true,
          isMobile: true,
        };
      }
    }
    // Can't determine specific model, but it's an iPhone
    return {
      detected: true,
      brand: 'Apple',
      model: 'iPhone',
      isCompatible: undefined, // Unknown - needs manual check
      isMobile: true,
    };
  }

  // iPad detection
  if (/iPad/.test(ua)) {
    return {
      detected: true,
      brand: 'Apple',
      model: 'iPad',
      isCompatible: undefined,
      isMobile: true,
    };
  }

  // Android detection - brand detection
  if (/Android/.test(ua)) {
    if (/Samsung/i.test(ua)) {
      return { detected: true, brand: 'Samsung', isMobile: true };
    }
    if (/Pixel/i.test(ua)) {
      return { detected: true, brand: 'Google', isMobile: true };
    }
    if (/OnePlus/i.test(ua)) {
      return { detected: true, brand: 'OnePlus', isMobile: true };
    }
    if (/Xiaomi|Mi\s|Redmi/i.test(ua)) {
      return { detected: true, brand: 'Xiaomi', isMobile: true };
    }
    if (/OPPO/i.test(ua)) {
      return { detected: true, brand: 'Oppo', isMobile: true };
    }
    if (/motorola/i.test(ua)) {
      return { detected: true, brand: 'Motorola', isMobile: true };
    }
    if (/HUAWEI/i.test(ua)) {
      return { detected: true, brand: 'Huawei', isMobile: true };
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

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const result = detectDevice();
    setDetection(result);
    if (result.brand) {
      setSelectedBrand(result.brand);
    }
  }, []);

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

  const brands = Object.keys(deviceDatabase) as Brand[];

  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    const brandData = deviceDatabase[selectedBrand];
    const allModels = [...brandData.compatible, ...brandData.notCompatible];
    if (!searchQuery) return allModels;
    return allModels.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedBrand, searchQuery]);

  const checkResult = useMemo(() => {
    if (!selectedBrand || !selectedModel) return null;
    const brandData = deviceDatabase[selectedBrand];
    if (brandData.compatible.includes(selectedModel)) {
      return { compatible: true, checkPath: brandData.checkPath };
    }
    if (brandData.notCompatible.includes(selectedModel)) {
      return { compatible: false, checkPath: brandData.checkPath };
    }
    return null;
  }, [selectedBrand, selectedModel]);

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
        {/* Auto-Detect Tab */}
        {activeTab === 'auto' && (
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
        {activeTab === 'manual' && (
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
        {activeTab === 'dial' && (
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
