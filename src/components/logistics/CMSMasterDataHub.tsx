import React, { useState } from 'react';
import {
  StoreWarehouse,
  RenewableProduct,
  TransferPolicy,
  SupplierContact,
} from '../../types/logistics';
import { cmsService, CMSConfig } from '../../services/cmsService';
import {
  Database,
  Warehouse,
  Package,
  ShieldCheck,
  Building2,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Zap,
  Globe,
  Plus,
  Layers,
} from 'lucide-react';

interface CMSMasterDataHubProps {
  stores: StoreWarehouse[];
  products: RenewableProduct[];
  policies: TransferPolicy[];
  suppliers: SupplierContact[];
  onAddStore?: (store: StoreWarehouse) => void;
  onAddProduct?: (product: RenewableProduct) => void;
}

export default function CMSMasterDataHub({
  stores,
  products,
  policies,
  suppliers,
  onAddStore,
  onAddProduct,
}: CMSMasterDataHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'stores' | 'policies' | 'suppliers' | 'schemas'>(
    'catalog'
  );

  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(cmsService.getConfig());
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [selectedSchemaProvider, setSelectedSchemaProvider] = useState<'Strapi' | 'Sanity'>('Strapi');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await cmsService.testConnection(cmsConfig.baseUrl, cmsConfig.apiToken);
      setConnectionResult(res);
      setCmsConfig(cmsService.getConfig());
    } catch (e: any) {
      setConnectionResult({
        success: false,
        message: e.message || 'Error communicating with CMS API endpoint.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const strapiSchemaJson = JSON.stringify(cmsService.getStrapiSchema(), null, 2);
  const sanitySchemaCode = cmsService.getSanitySchema();

  const handleCopySchema = () => {
    const textToCopy = selectedSchemaProvider === 'Strapi' ? strapiSchemaJson : sanitySchemaCode;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Headless CMS Connection Status Banner */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Headless CMS Master Data Connector
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    cmsConfig.baseUrl
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}
                >
                  {cmsConfig.baseUrl ? 'Connected via VITE_CMS_URL' : 'Running on High-Performance Local Master Cache'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Strapi / Contentful / Sanity Master Data Management for Stores, Technical Product Specs & Policies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors font-mono"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Pinging CMS...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {connectionResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              connectionResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            {connectionResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{connectionResult.message}</span>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'catalog', label: 'Product Catalog & Specs', icon: Package, count: products.length },
            { id: 'stores', label: 'Regional Warehouses', icon: Warehouse, count: stores.length },
            { id: 'policies', label: 'Transfer & Hazmat Policies', icon: ShieldCheck, count: policies.length },
            { id: 'suppliers', label: 'OEM & Supplier Directory', icon: Building2, count: suppliers.length },
            { id: 'schemas', label: 'CMS Schema Architecture', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: PRODUCT CATALOG & SPECS */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="h-40 bg-slate-950 relative overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                        {p.sku}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                    </div>

                    {p.specs.hazardClass !== 'Non-Hazardous' && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="bg-rose-500/90 backdrop-blur-md text-white font-mono text-[9px] uppercase px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" /> UN3480 Class 9 Hazmat
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase">{p.brand}</span>
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug">{p.name}</h4>
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs font-mono">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider block">
                        Technical Specifications:
                      </span>
                      {p.specs.wattage && (
                        <div className="flex justify-between text-white/70">
                          <span className="text-white/40">Power Rating:</span>
                          <span className="text-amber-300 font-bold">{p.specs.wattage}W</span>
                        </div>
                      )}
                      {p.specs.capacityKwh && (
                        <div className="flex justify-between text-white/70">
                          <span className="text-white/40">Storage Capacity:</span>
                          <span className="text-emerald-400 font-bold">{p.specs.capacityKwh} kWh</span>
                        </div>
                      )}
                      {p.specs.voltage && (
                        <div className="flex justify-between text-white/70">
                          <span className="text-white/40">Voltage:</span>
                          <span className="text-white">{p.specs.voltage}</span>
                        </div>
                      )}
                      {p.specs.chemistry && (
                        <div className="flex justify-between text-white/70">
                          <span className="text-white/40">Chemistry:</span>
                          <span className="text-white">{p.specs.chemistry}</span>
                        </div>
                      )}
                      {p.specs.dimensions && (
                        <div className="flex justify-between text-white/70">
                          <span className="text-white/40">Dimensions:</span>
                          <span className="text-white/80 text-[10px] truncate max-w-[150px]">{p.specs.dimensions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/10 mt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs pt-3 font-mono">
                    <span className="text-white/40">Standard Valuation:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{formatCurrency(p.unitCost)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href={p.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Datasheet PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {p.requiresSerialization ? (
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Serialized
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-white/40">Bulk UOM: {p.uom}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: REGIONAL WAREHOUSES */}
      {activeSubTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((s) => (
            <div key={s.id} className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {s.id}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{s.name}</h4>
                  <p className="text-xs text-white/50">{s.state} • {s.region} Region</p>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    s.operatingStatus === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}
                >
                  {s.operatingStatus}
                </span>
              </div>

              <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs">
                <div className="text-white/60">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Exact Facility Address:</span>
                  <p className="text-white mt-0.5">{s.exactAddress}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Store Manager:</span>
                    <p className="font-semibold text-white">{s.storeManagerName}</p>
                    <p className="text-[10px] text-white/50 font-mono">{s.storeManagerContact}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Capacity:</span>
                    <p className="font-bold text-white font-mono">{s.capacitySqMeters.toLocaleString()} m²</p>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      Valuation: {formatCurrency(s.currentStockValuation || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: TRANSFER & HAZMAT POLICIES */}
      {activeSubTab === 'policies' && (
        <div className="space-y-4">
          {policies.map((pol) => (
            <div key={pol.id} className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 uppercase">{pol.id} • {pol.category}</span>
                    <h4 className="text-base font-bold text-white tracking-tight">{pol.title}</h4>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-white/40">
                  Applies to: {pol.appliesToCategories.join(', ')}
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">{pol.summary}</p>

              {/* Guidelines */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                  Standard Operating Procedures:
                </span>
                <ul className="space-y-1.5 text-xs text-white/70">
                  {pol.guidelines.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Checklist */}
              <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                  Mandatory Dispatch Checklist:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pol.mandatoryChecklist.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 4: SUPPLIERS DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {sup.tier}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{sup.companyName}</h4>
                  <p className="text-xs text-white/50">{sup.category} • {sup.regionalOffice}</p>
                </div>
                <Building2 className="h-5 w-5 text-white/40" />
              </div>

              <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Point of Contact:</span>
                  <span className="font-semibold text-white">{sup.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Email:</span>
                  <span className="text-amber-300 font-mono">{sup.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Phone:</span>
                  <span className="text-white font-mono">{sup.phone}</span>
                </div>
                <div className="pt-1.5 border-t border-white/5 text-[11px] text-white/60">
                  <span className="text-white/40 font-mono">SLA & Terms:</span> {sup.slaTerms}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 5: HEADLESS CMS SCHEMA ARCHITECTURE */}
      {activeSubTab === 'schemas' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-amber-400" />
                  Headless CMS Exact Schema Architecture
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Exportable JSON and TypeScript content models for Strapi v4/v5, Sanity Studio, and Contentful.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedSchemaProvider('Strapi')}
                    className={`text-xs py-1 px-3 rounded-lg font-mono transition-colors ${
                      selectedSchemaProvider === 'Strapi'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Strapi v4/v5
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSchemaProvider('Sanity')}
                    className={`text-xs py-1 px-3 rounded-lg font-mono transition-colors ${
                      selectedSchemaProvider === 'Sanity'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Sanity Schema
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors font-mono"
                >
                  {copiedSchema ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Copy Schema Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="bg-black/80 rounded-xl p-4 border border-white/10 font-mono text-xs text-emerald-300 max-h-[500px] overflow-y-auto overflow-x-auto">
              <pre className="whitespace-pre">
                {selectedSchemaProvider === 'Strapi' ? strapiSchemaJson : sanitySchemaCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
