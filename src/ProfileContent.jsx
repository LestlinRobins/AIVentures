import React from 'react';
import { User, MapPin, CreditCard, Mail, Phone, LogOut } from 'lucide-react';

function ProfileContent() {
  return (
    <div className="content-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={40} color="#8e8e93" />
        </div>
        <h2>Steve John</h2>
        <p>Member since January 2023</p>
      </div>
      
      <div className="content-card">
        <div className="profile-section">
          <h3>Profile Settings</h3>
          
          <div className="profile-option">
            <div className="profile-option-icon">
              <User size={20} />
            </div>
            <div className="profile-option-text">
              <p>Account Information</p>
            </div>
            <div className="profile-option-arrow">›</div>
          </div>
          
          <div className="profile-option">
            <div className="profile-option-icon">
              <MapPin size={20} />
            </div>
            <div className="profile-option-text">
              <p>Saved Addresses</p>
            </div>
            <div className="profile-option-arrow">›</div>
          </div>
          
          <div className="profile-option">
            <div className="profile-option-icon">
              <CreditCard size={20} />
            </div>
            <div className="profile-option-text">
              <p>Payment Methods</p>
            </div>
            <div className="profile-option-arrow">›</div>
          </div>
          
          <div className="profile-option">
            <div className="profile-option-icon">
              <Mail size={20} />
            </div>
            <div className="profile-option-text">
              <p>Email Notifications</p>
            </div>
            <div className="profile-option-arrow">›</div>
          </div>
          
          <div className="profile-option">
            <div className="profile-option-icon">
              <Phone size={20} />
            </div>
            <div className="profile-option-text">
              <p>Phone Notifications</p>
            </div>
            <div className="profile-option-arrow">›</div>
          </div>
        </div>
        
        <div className="logout-button">
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileContent;