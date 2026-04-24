import React, { useState, useRef, useEffect } from 'react';
import {
  FiUser,
  FiSettings,
  FiMessageSquare,
  FiLogOut,
  FiChevronDown,
  FiBell,
  FiLock,
  FiCreditCard,
  FiGlobe,
  FiMoon,
  FiHelpCircle,
  FiMail,
  FiTicket,
  FiMessageCircle,
  FiBook,
  FiBug,
  FiThumbsUp,
  FiActivity,
  FiMenu
} from 'react-icons/fi';
import './UserDropdown.css';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle menu item click
  const handleMenuItemClick = (itemName) => {
    setActiveItem(itemName);
    console.log(`Clicked: ${itemName}`);
    // Add your navigation or action logic here
    
    // Uncomment to close on click
    // setIsOpen(false);
  };

  const settingsItems = [
    { name: 'Profile', icon: FiUser },
    { name: 'Account', icon: FiSettings },
    { name: 'Trading Preferences', icon: FiMenu },
    { name: 'Notifications', icon: FiBell },
    { name: 'Charts', icon: FiActivity },
    { name: 'Security', icon: FiLock },
    { name: 'Payment Methods', icon: FiCreditCard },
    { name: 'Language & Region', icon: FiGlobe },
    { name: 'App Theme', icon: FiMoon },
    { name: 'Logout', icon: FiLogOut, isDanger: true }
  ];

  const supportItems = [
    { name: 'FAQs', icon: FiHelpCircle },
    { name: 'Contact Support', icon: FiMail },
    { name: 'Raise a Ticket', icon: FiTicket },
    { name: 'Live Chat', icon: FiMessageCircle },
    { name: 'Trading Guide', icon: FiBook },
    { name: 'Report an Issue', icon: FiBug },
    { name: 'Feedback', icon: FiThumbsUp },
    { name: 'System Status', icon: FiActivity }
  ];

  return (
    <div className="user-dropdown-container">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        className={`user-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-avatar">
          <FiUser size={20} />
        </div>
        <span className="user-name">Account</span>
        <FiChevronDown
          size={16}
          className={`chevron-icon ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div ref={dropdownRef} className="user-dropdown-panel">
          {/* Settings Section */}
          <div className="dropdown-section">
            <h3 className="section-heading">Settings</h3>
            <div className="menu-items">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    className={`menu-item ${item.isDanger ? 'danger' : ''} ${
                      activeItem === item.name ? 'active' : ''
                    }`}
                    onClick={() => handleMenuItemClick(item.name)}
                  >
                    <span className="menu-icon">
                      <Icon size={18} />
                    </span>
                    <span className="menu-label">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="dropdown-divider"></div>

          {/* Help & Support Section */}
          <div className="dropdown-section">
            <h3 className="section-heading">Help & Support</h3>
            <div className="menu-items">
              {supportItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    className={`menu-item ${
                      activeItem === item.name ? 'active' : ''
                    }`}
                    onClick={() => handleMenuItemClick(item.name)}
                  >
                    <span className="menu-icon">
                      <Icon size={18} />
                    </span>
                    <span className="menu-label">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="dropdown-footer">
            <p>v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
