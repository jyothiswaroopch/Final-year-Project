import React from 'react';
import UserDropdown from './UserDropdown';
import './UserDropdownExample.css';

/**
 * Example usage of the UserDropdown component
 * 
 * This file demonstrates how to integrate the UserDropdown component
 * into your trading dashboard or any other page.
 */

const UserDropdownExample = () => {
  return (
    <div className="example-container">
      <div className="example-header">
        <h1>Trading Dashboard Header</h1>
        <p>Modern User Dropdown Example</p>
      </div>

      <div className="navbar-example">
        <div className="navbar-left">
          <div className="logo">📊 TradingHub</div>
          <nav className="nav-links">
            <a href="#home">Dashboard</a>
            <a href="#market">Market</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#learn">Learn</a>
          </nav>
        </div>

        <div className="navbar-right">
          {/* This is where you'd use the UserDropdown component */}
          <UserDropdown />
        </div>
      </div>

      <div className="example-info">
        <h2>Component Features</h2>
        <ul>
          <li>✨ Dark theme with glassmorphism effects</li>
          <li>🎯 Two organized sections (Settings & Help)</li>
          <li>⚡ Smooth animations and hover effects</li>
          <li>📱 Fully responsive design</li>
          <li>♿ Accessibility compliant (WCAG)</li>
          <li>🎨 Customizable colors and styling</li>
          <li>🔔 Active state management</li>
          <li>🚀 Performance optimized</li>
        </ul>
      </div>

      <div className="integration-guide">
        <h2>Integration Guide</h2>
        <div className="code-block">
          <h3>Step 1: Install react-icons (if not already installed)</h3>
          <pre><code>npm install react-icons</code></pre>
        </div>

        <div className="code-block">
          <h3>Step 2: Import the component</h3>
          <pre><code>{`import UserDropdown from './components/UserDropdown';`}</code></pre>
        </div>

        <div className="code-block">
          <h3>Step 3: Use in your navbar/header</h3>
          <pre><code>{`export default function Header() {
  return (
    <header className="navbar">
      {/* Your other navbar items */}
      <UserDropdown />
    </header>
  );
}`}</code></pre>
        </div>

        <div className="code-block">
          <h3>Step 4: Customize the menu items (optional)</h3>
          <p>Edit the <code>settingsItems</code> and <code>supportItems</code> arrays in UserDropdown.jsx</p>
        </div>
      </div>

      <div className="customization-guide">
        <h2>Customization Tips</h2>
        <div className="tip">
          <h4>Change Colors</h4>
          <p>Edit the color variables in UserDropdown.css. Primary color is <code>#64c8ff</code></p>
        </div>
        <div className="tip">
          <h4>Add Item Actions</h4>
          <p>Modify the <code>handleMenuItemClick</code> function to handle different items</p>
        </div>
        <div className="tip">
          <h4>Connect to Navigation</h4>
          <p>Use React Router's useNavigate() in the click handler to navigate between pages</p>
        </div>
        <div className="tip">
          <h4>Add User Avatar</h4>
          <p>Replace the <code>.user-avatar</code> content with an img tag for a profile picture</p>
        </div>
      </div>
    </div>
  );
};

export default UserDropdownExample;
