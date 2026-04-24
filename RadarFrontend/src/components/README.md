# UserDropdown Component - Documentation

A modern, dark-themed dropdown menu component for trading dashboards built with React and CSS. Perfect for Zerodha, Binance-style trading web applications.

## 📁 Files Included

- **UserDropdown.jsx** - Main React component
- **UserDropdown.css** - Component styling
- **UserDropdownExample.jsx** - Example implementation
- **UserDropdownExample.css** - Example page styling
- **README.md** - This documentation file

## ✨ Features

### Visual Design
- ✅ Dark theme with glassmorphism effect
- ✅ Smooth animations (fade/slide on open)
- ✅ Hover effects with color transitions
- ✅ Rounded corners (12px border-radius)
- ✅ Subtle shadows for depth
- ✅ Gradient backgrounds
- ✅ Professional blue accent color (#64c8ff)

### Functionality
- ✅ Click to open/close
- ✅ Click outside to close
- ✅ Active state management
- ✅ Two organized sections (Settings & Help & Support)
- ✅ 10 Settings menu items
- ✅ 8 Help & Support menu items
- ✅ Danger state styling for Logout
- ✅ Icon support with react-icons

### Responsive Design
- ✅ Desktop (full layout)
- ✅ Tablet (adjusted padding)
- ✅ Mobile (simplified, full-width on small screens)

### Accessibility
- ✅ WCAG compliant
- ✅ Keyboard focus indicators
- ✅ Proper ARIA labels
- ✅ Reduced motion support
- ✅ Semantic HTML

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install react-icons
```

### Step 2: Copy Files
Copy the following files to your `src/components/` directory:
- UserDropdown.jsx
- UserDropdown.css

### Step 3: Import Component
```jsx
import UserDropdown from './components/UserDropdown';
```

### Step 4: Use in Your App
```jsx
export default function Header() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Your logo and navigation */}
      </div>
      
      <div className="navbar-right">
        <UserDropdown />
      </div>
    </header>
  );
}
```

## 📋 Menu Structure

### Settings Section
- Profile
- Account
- Trading Preferences
- Notifications
- Charts
- Security
- Payment Methods
- Language & Region
- App Theme
- Logout (danger state)

### Help & Support Section
- FAQs
- Contact Support
- Raise a Ticket
- Live Chat
- Trading Guide
- Report an Issue
- Feedback
- System Status

## 🎨 Customization

### Change Primary Color
Edit the color values in `UserDropdown.css`. Replace all instances of `#64c8ff`:

```css
/* Primary Color */
#64c8ff → Your desired color (e.g., #00ff00)
```

Common trading app colors:
- Zerodha: #0083E7 (Blue)
- Binance: #F3BA2F (Yellow)
- eToro: #00C249 (Green)
- Upstox: #113CCF (Dark Blue)

### Add/Remove Menu Items
Edit the arrays in `UserDropdown.jsx`:

```jsx
const settingsItems = [
  { name: 'Profile', icon: FiUser },
  { name: 'Account', icon: FiSettings },
  // Add or remove items here
];

const supportItems = [
  { name: 'FAQs', icon: FiHelpCircle },
  // Add or remove items here
];
```

### Use Different Icons
Replace the react-icons with any other icon library:

```jsx
// Instead of react-icons/fi
import { AiOutlineUser } from 'react-icons/ai';
import { GrMenu } from 'react-icons/gr';

// Or use Material UI Icons
import UserIcon from '@mui/icons-material/Person';
```

### Handle Menu Item Clicks
Modify the `handleMenuItemClick` function:

```jsx
const handleMenuItemClick = (itemName) => {
  setActiveItem(itemName);
  
  // Add your custom logic
  switch(itemName) {
    case 'Profile':
      navigate('/profile');
      break;
    case 'Logout':
      handleLogout();
      break;
    case 'Live Chat':
      openLiveChat();
      break;
    // Add more cases
  }
};
```

### Add User Avatar Image
Replace the avatar icon in the JSX:

```jsx
<div className="user-avatar">
  <img 
    src={userProfileImage} 
    alt="User Avatar"
    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
  />
</div>
```

### Update CSS Variables
Common customization points:

```css
/* Change width */
.user-dropdown-panel {
  width: 300px; /* Default: 280px */
}

/* Change animation speed */
.user-dropdown-panel {
  animation: dropdownSlide 0.5s cubic-bezier(...); /* Default: 0.3s */
}

/* Change border radius */
.user-dropdown-trigger,
.user-dropdown-panel {
  border-radius: 16px; /* Default: 12px and 8px */
}
```

## 🔧 Advanced Usage

### Connect to React Router
```jsx
import { useNavigate } from 'react-router-dom';

const handleMenuItemClick = (itemName) => {
  const navigate = useNavigate();
  
  switch(itemName) {
    case 'Profile':
      navigate('/dashboard/profile');
      break;
    case 'Account':
      navigate('/dashboard/account');
      break;
    // Add more routes
  }
};
```

### Close After Selection
Uncomment the line in `handleMenuItemClick`:

```jsx
const handleMenuItemClick = (itemName) => {
  setActiveItem(itemName);
  console.log(`Clicked: ${itemName}`);
  
  // Uncomment to close on click
  setIsOpen(false);
};
```

### Add Logout Confirmation
```jsx
const handleLogout = async () => {
  if (window.confirm('Are you sure you want to logout?')) {
    // Clear auth token
    localStorage.removeItem('authToken');
    // Redirect to login
    navigate('/login');
  }
};

// In handleMenuItemClick
if (itemName === 'Logout') {
  handleLogout();
}
```

### Add User Info Display
```jsx
<div className="user-dropdown-panel">
  {/* Add user info header */}
  <div className="user-info-header">
    <img src={userImage} alt="User" className="user-image" />
    <div>
      <p className="user-fullname">John Doe</p>
      <p className="user-email">john@example.com</p>
    </div>
  </div>
  
  {/* Rest of the dropdown */}
  {/* ... */}
</div>
```

## 🎯 Styling Guide

### Component Structure
```
user-dropdown-container
├── user-dropdown-trigger (button)
│   ├── user-avatar
│   ├── user-name
│   └── chevron-icon
└── user-dropdown-panel (dropdown)
    ├── dropdown-section (Settings)
    │   ├── section-heading
    │   └── menu-items
    │       ├── menu-item
    │       │   ├── menu-icon
    │       │   └── menu-label
    │       └── ...
    ├── dropdown-divider
    ├── dropdown-section (Help & Support)
    │   ├── section-heading
    │   └── menu-items
    │       └── ...
    └── dropdown-footer
```

### CSS Classes Reference
- `.user-dropdown-container` - Main wrapper
- `.user-dropdown-trigger` - Trigger button
- `.user-dropdown-trigger.active` - Trigger when open
- `.user-dropdown-panel` - Dropdown panel
- `.dropdown-section` - Section container
- `.section-heading` - Section title
- `.menu-item` - Menu item button
- `.menu-item.active` - Active menu item
- `.menu-item.danger` - Danger state (Logout)
- `.menu-icon` - Icon container
- `.menu-label` - Text label
- `.dropdown-divider` - Separator line
- `.dropdown-footer` - Footer info

## 🎬 Animation Details

### Open Animation
```
Duration: 0.3s
Timing: cubic-bezier(0.4, 0, 0.2, 1)
Effect: Fade in + Slide up + Scale from 0.95
```

### Hover Animation
```
Duration: 0.25s
Effect: Smooth color transition
Icon: Scale 1.1
```

### Active State Animation
```
Left border slides in (scaleY)
Background color changes
Icon brightness increases
```

## 📱 Responsive Breakpoints

### Desktop (> 768px)
- Full width panel (280px)
- All text visible
- Hover effects active

### Tablet (480px - 768px)
- Reduced padding
- Icon-only trigger
- Panel width: 260px
- Smaller font sizes

### Mobile (< 480px)
- Panel width: calc(100vw - 24px)
- Positions from left (to avoid edge issues)
- Chevron icon hidden
- Compact spacing

## 🔐 Security Considerations

1. **XSS Prevention**: Component sanitizes all text content
2. **Event Handling**: Uses proper event delegation
3. **Refs Cleanup**: Properly removes event listeners on unmount
4. **CSRF**: Implement CSRF tokens in your backend

## ⚡ Performance Tips

1. Use `React.memo()` if component is in a list:
   ```jsx
   export default React.memo(UserDropdown);
   ```

2. Lazy load the component for large applications:
   ```jsx
   const UserDropdown = lazy(() => import('./UserDropdown'));
   ```

3. Optimize re-renders by moving state to context if used in multiple components

## 🐛 Troubleshooting

### Dropdown doesn't close on outside click
- Ensure `useEffect` cleanup is working
- Check if other elements have `z-index` higher than 1000

### Icons not showing
- Verify `react-icons` is installed: `npm install react-icons`
- Check browser console for import errors

### Styling not applied
- Clear browser cache
- Verify CSS file is imported in JSX
- Check CSS specificity of other stylesheets

### Mobile layout issues
- Test with Chrome DevTools mobile emulation
- Check viewport meta tag in HTML

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [React Icons](https://react-icons.github.io/react-icons/)
- [CSS Gradients](https://www.gradientmagic.com/)
- [Glassmorphism](https://glassmorphism.com/)

## 📄 License

This component is provided as-is for use in your projects.

## 🤝 Support

For questions or issues:
1. Check this documentation
2. Review the example implementation
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-20  
**Compatible with**: React 16.8+ (with Hooks)
