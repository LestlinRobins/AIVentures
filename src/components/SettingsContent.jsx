import React from 'react';
import { Settings, Bell, Lock, HelpCircle, Info, Moon } from 'lucide-react';

function SettingsContent() {
  return (
    <div className="content-container">
      <h2>Settings</h2>
      
      <div className="content-card">
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="settings-option">
            <div className="settings-option-icon">
              <Bell size={20} />
            </div>
            <div className="settings-option-text">
              <p>Notifications</p>
            </div>
            <div className="settings-option-toggle">
              <label className="switch small">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          <div className="settings-option">
            <div className="settings-option-icon">
              <Moon size={20} />
            </div>
            <div className="settings-option-text">
              <p>Dark Mode</p>
            </div>
            <div className="settings-option-toggle">
              <label className="switch small">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          <div className="settings-option">
            <div className="settings-option-icon">
              <Lock size={20} />
            </div>
            <div className="settings-option-text">
              <p>Security</p>
            </div>
            <div className="settings-option-arrow">›</div>
          </div>
          
          <div className="settings-option">
            <div className="settings-option-icon">
              <HelpCircle size={20} />
            </div>
            <div className="settings-option-text">
              <p>Help & Support</p>
            </div>
            <div className="settings-option-arrow">›</div>
          </div>
          
          <div className="settings-option">
            <div className="settings-option-icon">
              <Info size={20} />
            </div>
            <div className="settings-option-text">
              <p>About</p>
            </div>
            <div className="settings-option-arrow">›</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsContent;