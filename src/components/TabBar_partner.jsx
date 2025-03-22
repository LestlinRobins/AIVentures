import { BarChart2, Package, Users, Settings } from 'lucide-react';

function TabBarPartner({ activeTab, setActiveTab }) {
  return (
    <div className="tab-bar partner">
      <div 
        className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <BarChart2 size={24} />
      </div>
      <div 
        className={`tab ${activeTab === 'shipments' ? 'active' : ''}`}
        onClick={() => setActiveTab('shipments')}
      >
        <Package size={24} />
      </div>
      <div 
        className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
        onClick={() => setActiveTab('customers')}
      >
        <Users size={24} />
      </div>
      <div 
        className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <Settings size={24} />
      </div>
    </div>
  );
}

export default TabBarPartner;