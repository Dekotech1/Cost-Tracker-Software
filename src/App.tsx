import React, { useState } from 'react';
import ErpLayout from './components/erp/ErpLayout';
import ErpDashboard from './components/erp/ErpDashboard';
import ErpProgrammes from './components/erp/ErpProgrammes';
import ErpCommunities from './components/erp/ErpCommunities';
import ErpProcurement from './components/erp/ErpProcurement';
import ErpInventory from './components/erp/ErpInventory';
import ErpTransfers from './components/erp/ErpTransfers';
import ErpWaybills from './components/erp/ErpWaybills';
import ErpGoodsReceiving from './components/erp/ErpGoodsReceiving';
import ErpAssets from './components/erp/ErpAssets';
import ErpFinance from './components/erp/ErpFinance';
import ErpReports from './components/erp/ErpReports';
import ErpAuditLogs from './components/erp/ErpAuditLogs';
import ErpAdmin from './components/erp/ErpAdmin';
import CreateModals from './components/erp/CreateModals';
import { erpService } from './services/erpStorageService';
import { EnterpriseUser, PurchaseRequisition } from './types/erp';

export default function App() {
  const users = erpService.getUsers();
  const [currentUser, setCurrentUser] = useState<EnterpriseUser>(() => users[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [transferDataFromPR, setTransferDataFromPR] = useState<PurchaseRequisition | null>(null);
  const [selectedWaybillNumber, setSelectedWaybillNumber] = useState<string | undefined>(undefined);

  const handleOpenCreateModal = (type: string) => {
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setTransferDataFromPR(null);
  };

  const handleConvertToTransfer = (pr: PurchaseRequisition) => {
    setTransferDataFromPR(pr);
    setActiveModal('transfer');
  };

  const handleViewWaybill = (wbNum: string) => {
    setSelectedWaybillNumber(wbNum);
    setActiveTab('waybills');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ErpDashboard
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onOpenCreateModal={handleOpenCreateModal}
          />
        );
      case 'programmes':
        return (
          <ErpProgrammes
            onOpenCreateModal={() => handleOpenCreateModal('programme')}
          />
        );
      case 'communities':
        return (
          <ErpCommunities
            onOpenCreateModal={() => handleOpenCreateModal('community')}
          />
        );
      case 'procurement':
        return (
          <ErpProcurement
            currentUser={currentUser}
            onOpenCreateModal={handleOpenCreateModal}
            onConvertToTransfer={handleConvertToTransfer}
          />
        );
      case 'inventory':
        return (
          <ErpInventory
            currentUser={currentUser}
            onOpenCreateItemModal={() => handleOpenCreateModal('item')}
            onOpenStockMovementModal={() => handleOpenCreateModal('movement')}
          />
        );
      case 'transfers':
        return (
          <ErpTransfers
            currentUser={currentUser}
            onOpenCreateTransfer={() => handleOpenCreateModal('transfer')}
            onViewWaybill={handleViewWaybill}
          />
        );
      case 'waybills':
        return (
          <ErpWaybills
            onOpenCreateWaybill={() => handleOpenCreateModal('waybill')}
            selectedWaybillNumber={selectedWaybillNumber}
          />
        );
      case 'receiving':
        return (
          <ErpGoodsReceiving
            currentUser={currentUser}
            onOpenCreateGrn={() => handleOpenCreateModal('grn')}
          />
        );
      case 'assets':
        return (
          <ErpAssets
            currentUser={currentUser}
            onOpenCreateAsset={() => handleOpenCreateModal('asset')}
          />
        );
      case 'finance':
        return <ErpFinance currentUser={currentUser} />;
      case 'reports':
        return <ErpReports />;
      case 'audit':
        return <ErpAuditLogs />;
      case 'admin':
        return (
          <ErpAdmin
            currentUser={currentUser}
            onSwitchUser={setCurrentUser}
            onOpenCreateStore={() => handleOpenCreateModal('store')}
          />
        );
      default:
        return (
          <ErpDashboard
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onOpenCreateModal={handleOpenCreateModal}
          />
        );
    }
  };

  return (
    <ErpLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={currentUser}
      onUserChange={setCurrentUser}
      users={users}
      onOpenCreateModal={handleOpenCreateModal}
    >
      {renderActiveTabContent()}

      {/* Quick Action & Flow Modals */}
      <CreateModals
        modalType={activeModal}
        onClose={handleCloseModal}
        currentUser={currentUser}
        transferDataFromPR={transferDataFromPR}
      />
    </ErpLayout>
  );
}
