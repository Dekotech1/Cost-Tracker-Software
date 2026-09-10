import React, { useState } from 'react';
import { ArrowRightLeft, Plus, Search, Filter, Truck, CheckCircle2, ArrowRight, User, Calendar } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, InterStoreTransferOrder } from '../../types/erp';

interface ErpTransfersProps {
  currentUser: EnterpriseUser;
  onOpenCreateTransfer: () => void;
  onViewWaybill: (waybillNumber: string) => void;
}

export default function ErpTransfers({ currentUser, onOpenCreateTransfer, onViewWaybill }: ErpTransfersProps) {
  const [transfers, setTransfers] = useState(() => erpService.getTransfers());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = transfers.filter((t) => {
    return (
      t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.driverName && t.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Inter-Store Transfers (STT)</h1>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Nationwide Logistics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track movement of solar equipment between Central Depot, Regional Hubs, and Field Site depots.
          </p>
        </div>

        <button
          onClick={onOpenCreateTransfer}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Transfer Order</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transfer#, depot, driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Transfers Cards */}
      <div className="space-y-4">
        {filteredTransfers.map((stt) => (
          <div
            key={stt.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{stt.transferNumber}</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                    {stt.status}
                  </span>
                  {stt.waybillNumber && (
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      Waybill: {stt.waybillNumber}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{stt.sourceStoreName}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-emerald-400">{stt.destinationStoreName}</span>
                </div>
              </div>

              {stt.waybillNumber && (
                <button
                  onClick={() => onViewWaybill(stt.waybillNumber!)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  View Digital Waybill ➔
                </button>
              )}
            </div>

            {/* Carrier & Haulage Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Carrier Logistics:</span>
                <p className="font-medium text-white">{stt.carrierCompany || 'Internal Fleet'}</p>
              </div>
              <div>
                <span className="text-slate-400">Driver &amp; Vehicle:</span>
                <p className="font-medium text-white">
                  {stt.driverName} ({stt.vehicleRegistration})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Driver Phone:</span>
                <p className="font-mono text-emerald-400">{stt.driverPhone || 'N/A'}</p>
              </div>
            </div>

            {/* Items Manifest */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Requested</th>
                    <th className="py-2.5 px-3 text-right">Dispatched</th>
                    <th className="py-2.5 px-3 text-right">Received</th>
                    <th className="py-2.5 px-3">Serial Numbers Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stt.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-semibold text-white">{item.itemName}</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{item.itemSku}</td>
                      <td className="py-2 px-3 text-right font-mono">{item.quantityRequested}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-indigo-400">{item.quantityDispatched}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">{item.quantityReceived}</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                        {item.serialNumbers && item.serialNumbers.length > 0
                          ? `${item.serialNumbers.length} Serials Recorded (${item.serialNumbers[0]}...)`
                          : 'Non-serialized batch'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
