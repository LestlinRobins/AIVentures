import { Home, Calendar, Bell, User } from 'lucide-react';

function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="tab-bar">
      <div 
        className={`tab ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={24} />
      </div>
      <div 
        className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveTab('calendar')}
      >
        <Calendar size={24} />
      </div>
      <div 
        className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
        onClick={() => setActiveTab('notifications')}
      >
        <Bell size={24} />
      </div>
      <div 
        className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <User size={24} />
      </div>
    </div>
  );
}

export default TabBar;