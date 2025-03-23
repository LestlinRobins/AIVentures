import { useState } from "react";
import Header from "./Header";
import PackageSearch from "./PackageSearch";
import RecentShipping from "./RecentShipping";
import TabBar from "./TabBar";
//import CalendarContent from './CalendarContent';
import NotificationsContent from "./NotificationsContent";
import ProfileContent from "./ProfileContent";
import CalendarContent from "./CalendarContent";

function Home() {
  const [activeTab, setActiveTab] = useState("home");

  // Function to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <div className="orange-banner">
              <div className="dashboard-stats">
                <div className="stat-item">
                  <span className="stat-value">23%</span>
                  <span className="stat-label">Time Saved</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">32%</span>
                  <span className="stat-label">CO2 Reduced</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">12%</span>
                  <span className="stat-label">Cost Saved</span>
                </div>
              </div>
            </div>
            <PackageSearch />
            <RecentShipping />
          </>
        );
      case "calendar":
        return <CalendarContent />;
      case "notifications":
        return <NotificationsContent />;
      case "profile":
        return <ProfileContent />;
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      <Header name="Steve John" date="27 Mar 2023" points={0} />
      {renderContent()}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default Home;
