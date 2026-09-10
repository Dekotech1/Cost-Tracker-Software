import React, { useState } from 'react';
import { Truck, Plus, Search, ShieldCheck, Printer, CheckCircle, MapPin, Hash, QrCode } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { DigitalWaybill } from '../../types/erp';

interface ErpWaybillsProps {
  onOpenCreateWaybill: () => void;
  selectedWaybillNumber?: string;
}

export default function ErpWaybills({ onOpenCreateWaybill, selectedWaybillNumber }: ErpWaybillsProps) {
  const [waybills, setWaybills] = useState(() => erpService.getWaybills());
  const [searchTerm, setSearchTerm] = useState(selectedWaybillNumber || '');
  const [activeWaybillForPrint, setActiveWaybillForPrint] = useState<DigitalWaybill | null>(null);

  const filteredWaybills = waybills.filter((wb) => {
    return (
      wb.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wb.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wb.sourceStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wb.destinationStoreName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Digital Waybills &amp; Logistics</h1>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              SHA-256 Verification
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident electronic waybills with GPS coordinates, carrier license verification, and receipt auditing.
          </p>
        </div>

        <button
          onClick={onOpenCreateWaybill}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Digital Waybill</span>
        </button>
      </div>

      {/* Printable Modal View */}
      {activeWaybillForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 print:p-0">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto print:bg-white print:text-black print:border-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:border-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white print:text-black">
                  Official Dispatch Waybill: {activeWaybillForPrint.waybillNumber}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer print:hidden"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Manifest</span>
                </button>
                <button
                  onClick={() => setActiveWaybillForPrint(null)}
                  className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 print:hidden cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Manifest Content */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-xl print:bg-slate-100">
                <p className="font-semibold text-slate-400 print:text-slate-600">Origin / Dispatch Depot:</p>
                <p className="font-bold text-white print:text-black mt-0.5">{activeWaybillForPrint.sourceStoreName}</p>
                <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono mt-1">
                  GPS: {activeWaybillForPrint.dispatchGpsCoordinates.lat}, {activeWaybillForPrint.dispatchGpsCoordinates.lng}
                </p>
                <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                  Timestamp: {new Date(activeWaybillForPrint.dispatchTimestamp).toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl print:bg-slate-100">
                <p className="font-semibold text-slate-400 print:text-slate-600">Destination Store:</p>
                <p className="font-bold text-emerald-400 print:text-emerald-700 mt-0.5">{activeWaybillForPrint.destinationStoreName}</p>
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1">
                  Status: <span className="font-bold">{activeWaybillForPrint.status}</span>
                </p>
              </div>
            </div>

            {/* Carrier Information */}
            <div className="bg-slate-800/20 p-3 rounded-xl border border-slate-800 print:border-slate-300 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 print:text-slate-600">Haulage Carrier:</span>
                <p className="font-semibold text-white print:text-black">{activeWaybillForPrint.carrierCompany}</p>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Driver Name &amp; License:</span>
                <p className="font-semibold text-white print:text-black">{activeWaybillForPrint.driverName}</p>
                <p className="font-mono text-[10px] text-slate-400">{activeWaybillForPrint.driverLicenseNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Vehicle Registration:</span>
                <p className="font-mono font-bold text-white print:text-black">{activeWaybillForPrint.vehicleRegistration}</p>
              </div>
            </div>

            {/* Items Manifest */}
            <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 print:bg-slate-200 text-slate-400 print:text-black font-mono">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Dispatched Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {activeWaybillForPrint.itemsSummary.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-white print:text-black">{item.itemName}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{item.sku}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 print:text-black">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cryptographic Verification Hash & Digital Signatures */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Hash className="h-3.5 w-3.5 text-emerald-400" /> Digital Verification Hash (SHA-256):
                </span>
                <span className="font-mono text-emerald-400 font-bold text-[10px] break-all">
                  {activeWaybillForPrint.verificationHash}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Driver Signature:</span>
                  <p className="font-medium text-slate-200 print:text-black">{activeWaybillForPrint.driverSignatureName || 'Digitally Signed'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Dispatch Officer Signature:</span>
                  <p className="font-medium text-slate-200 print:text-black">{activeWaybillForPrint.storeOfficerSignatureName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search waybill#, driver, depot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Waybills Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredWaybills.map((wb) => (
          <div
            key={wb.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{wb.waybillNumber}</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                    {wb.status}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    STT: {wb.transferNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Origin: <span className="font-medium text-white">{wb.sourceStoreName}</span> ➔ Destination:{' '}
                  <span className="font-medium text-emerald-400">{wb.destinationStoreName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveWaybillForPrint(wb)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Waybill</span>
                </button>
              </div>
            </div>

            {/* Carrier & Route */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Carrier:</span>
                <p className="font-medium text-white">{wb.carrierCompany}</p>
              </div>
              <div>
                <span className="text-slate-400">Driver &amp; Vehicle:</span>
                <p className="font-medium text-white">
                  {wb.driverName} ({wb.vehicleRegistration})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Dispatch GPS:</span>
                <p className="font-mono text-emerald-400 text-[11px] flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {wb.dispatchGpsCoordinates.lat}, {wb.dispatchGpsCoordinates.lng}
                </p>
              </div>
            </div>

            {/* Verification Hash Stamp */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="truncate max-w-sm">Verification Hash: {wb.verificationHash}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Cryptographically Sealed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
