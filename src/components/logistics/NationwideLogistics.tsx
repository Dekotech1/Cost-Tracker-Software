import React, { useState } from 'react';
import {
  StoreWarehouse,
  RenewableProduct,
  InterStoreTransfer,
  DynamicStockBalance,
  SerializedAsset,
  TransferPolicy,
  SupplierContact,
  TransferStatus,
  StockTransaction,
} from '../../types/logistics';
import StateStoreOverview from './StateStoreOverview';
import InterStoreTransferModule from './InterStoreTransferModule';
import DynamicStockBalancesView from './DynamicStockBalancesView';
import SerializedAssetTracker from './SerializedAssetTracker';
import CMSMasterDataHub from './CMSMasterDataHub';
import {
  Warehouse,
  Truck,
  Calculator,
  Barcode,
  Database,
  ShieldCheck,
  TrendingUp,
  Package,
} from 'lucide-react';

interface NationwideLogisticsProps {
  stores: StoreWarehouse[];
  products: RenewableProduct[];
  transfers: InterStoreTransfer[];
  stockBalances: DynamicStockBalance[];
  serializedAssets: SerializedAsset[];
  policies: TransferPolicy[];
  suppliers: SupplierContact[];
  transactions: StockTransaction[];
  currentUserRole?: string;
  currentUserName?: string;
  onCreateTransfer: (transfer: Omit<InterStoreTransfer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTransferStatus: (
    transferId: string,
    newStatus: TransferStatus,
    metadata?: {
      waybillNumber?: string;
      driverName?: string;
      driverPhone?: string;
      vehicleRegistration?: string;
      approvalNotes?: string;
      receivedNotes?: string;
      varianceNotes?: string;
    }
  ) => void;
  onAddSerializedAsset?: (asset: SerializedAsset) => void;
}

export default function NationwideLogistics({
  stores,
  products,
  transfers,
  stockBalances,
  serializedAssets,
  policies,
  suppliers,
  transactions,
  currentUserRole,
  currentUserName,
  onCreateTransfer,
  onUpdateTransferStatus,
  onAddSerializedAsset,
}: NationwideLogisticsProps) {
  const [activeLogisticsTab, setActiveLogisticsTab] = useState<
    'overview' | 'transfers' | 'balances' | 'serials' | 'cms'
  >('overview');

  const [preselectedDestStoreId, setPreselectedDestStoreId] = useState<string | null>(null);

  const handleInitiateTransferToStore = (storeId: string) => {
    setPreselectedDestStoreId(storeId);
    setActiveLogisticsTab('transfers');
  };

  const handleSelectStoreDetail = (storeId: string) => {
    setActiveLogisticsTab('balances');
  };

  const subTabs = [
    {
      id: 'overview',
      label: 'State Stores Overview',
      icon: Warehouse,
      badge: `${stores.length} Hubs`,
    },
    {
      id: 'transfers',
      label: 'Inter-Store Transfers (STT)',
      icon: Truck,
      badge: `${transfers.filter((t) => t.status === 'In Transit' || t.status === 'Approved').length} Active`,
    },
    {
      id: 'balances',
      label: 'Dynamic Stock Ledger',
      icon: Calculator,
      badge: `${stockBalances.length} Balances`,
    },
    {
      id: 'serials',
      label: 'Serialized Asset Tracking',
      icon: Barcode,
      badge: `${serializedAssets.length} Serials`,
    },
    {
      id: 'cms',
      label: 'Headless CMS Master Data',
      icon: Database,
      badge: 'Strapi / Sanity',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                Nationwide Supply Chain Architecture
              </span>
              <span className="font-mono text-[10px] text-white/40">Multi-Store Logistics Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Renewable Energy Procurement, Inventory & Logistics
            </h1>
            <p className="text-xs text-white/60 max-w-3xl leading-relaxed">
              Real-time multi-state warehouse ledger connecting Headless CMS master data (Strapi/Sanity) with
              operational inter-store transfers (STT), site deployments, and UN3480 hazardous battery compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-black/40 border border-white/10 rounded-2xl p-3 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-white/40 uppercase block">Total Warehouses</span>
              <span className="font-bold text-white text-sm">{stores.length} State Hubs</span>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <div className="text-right">
              <span className="text-[10px] text-white/40 uppercase block">Active STTs</span>
              <span className="font-bold text-amber-400 text-sm">
                {transfers.filter((t) => t.status === 'In Transit' || t.status === 'Approved').length} Corridors
              </span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation Bar */}
        <div className="flex space-x-2 overflow-x-auto pt-6 border-t border-white/10 mt-6" aria-label="Logistics Tabs">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLogisticsTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveLogisticsTab(tab.id as any);
                  if (tab.id !== 'transfers') {
                    setPreselectedDestStoreId(null);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 duration-150 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Switcher */}
      {activeLogisticsTab === 'overview' && (
        <StateStoreOverview
          stores={stores}
          products={products}
          transfers={transfers}
          stockBalances={stockBalances}
          onSelectStore={handleSelectStoreDetail}
          onInitiateTransferToStore={handleInitiateTransferToStore}
        />
      )}

      {activeLogisticsTab === 'transfers' && (
        <InterStoreTransferModule
          transfers={transfers}
          stores={stores}
          products={products}
          stockBalances={stockBalances}
          serializedAssets={serializedAssets}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          onCreateTransfer={onCreateTransfer}
          onUpdateTransferStatus={onUpdateTransferStatus}
          preselectedDestinationStoreId={preselectedDestStoreId}
        />
      )}

      {activeLogisticsTab === 'balances' && (
        <DynamicStockBalancesView
          balances={stockBalances}
          stores={stores}
          products={products}
        />
      )}

      {activeLogisticsTab === 'serials' && (
        <SerializedAssetTracker
          assets={serializedAssets}
          stores={stores}
          products={products}
          onAddAsset={onAddSerializedAsset}
        />
      )}

      {activeLogisticsTab === 'cms' && (
        <CMSMasterDataHub
          stores={stores}
          products={products}
          policies={policies}
          suppliers={suppliers}
        />
      )}
    </div>
  );
}
