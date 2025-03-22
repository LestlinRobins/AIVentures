import { useState } from "react";
import Header from "./Header_partner";
import PackageSearch from "./PackageSearch_partner";
import RecentShipping from "./RecentShipping_partner";
import TabBar from "./TabBar_partner";
import DashboardContent from "./DashboardContent";
import ShipmentsContent from "./ShipmentsContent";
import CustomersContent from "./CustomersContent";
import SettingsContent from "./SettingsContent";
import AvailableOrders from "./AvailableOrders";
function HomePartner() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Function to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="orange-banner partner"></div>
            <PackageSearch />
            <RecentShipping />
            <AvailableOrders />
          </>
        );
      case "shipments":
        return <ShipmentsContent />;
      case "customers":
        return <CustomersContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return null;
    }
  };

  return (
    <div className="home-container partner">
      <Header name="Partner Dashboard" date="27 Mar 2023" points={0} />
      {renderContent()}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default HomePartner;
