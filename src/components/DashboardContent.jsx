import { useState } from 'react';
import Header from './Header_partner';
import PackageSearch from './PackageSearch_partner';
import RecentShipping from './RecentShipping_partner';
import TabBar from './TabBar_partner';

function DashboardContent() {
  return (
    <div className="home-container partner">
      <Header name="Partner Dashboard" date="27 Mar 2023" points={0} />
      <div className="orange-banner partner"></div>
      <PackageSearch />
      <RecentShipping />
      <TabBar />
    </div>
  );
}

export default DashboardContent;