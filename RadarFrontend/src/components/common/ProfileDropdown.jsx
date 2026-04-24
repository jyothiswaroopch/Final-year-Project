import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, HelpCircle } from "lucide-react";
import "../styles/ProfileDropdown.css";

const ProfileDropdown = ({ 
  isOpen, 
  onClose, 
  avatarRef, 
  profile, 
  userInitial,
  onSignOut
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mode, setMode] = useState("trader");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mode");
    if (!saved) return;

    const normalized = String(saved).toLowerCase();
    if (normalized === "trader" || normalized === "investor") {
      setMode(normalized);
      return;
    }

    if (saved === "TRADER" || saved === "INVESTOR") {
      setMode(saved.toLowerCase());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  useEffect(() => {
    if (!isOpen && showSignOutConfirm) {
      setShowSignOutConfirm(false);
    }
  }, [isOpen, showSignOutConfirm]);

  // Calculate position based on avatar element
  useEffect(() => {
    if (!isOpen || !avatarRef?.current) return;

    const calculatePosition = () => {
      const rect = avatarRef.current.getBoundingClientRect();
      const dropdownWidth = 320;
      const padding = 12;
      const viewportWidth = window.innerWidth;

      let left = rect.right - dropdownWidth;
      
      // Ensure dropdown doesn't go off-screen on left side
      if (left < padding) {
        left = padding;
      }
      
      // Ensure dropdown doesn't go off-screen on right side
      if (left + dropdownWidth + padding > viewportWidth) {
        left = viewportWidth - dropdownWidth - padding;
      }

      setPosition({
        top: rect.bottom + 8,
        left: left
      });
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition);

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
    };
  }, [isOpen, avatarRef]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        avatarRef?.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowSignOutConfirm(false);
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowSignOutConfirm(false);
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, avatarRef]);

  if (!isOpen) return null;

  const handleSelectMode = (nextMode) => {
    setShowSignOutConfirm(false);
    setMode(nextMode);
    if (nextMode === "investor") {
      navigate("/investor-dashboard");
    } else {
      navigate("/dashboard");
    }
    onClose();
  };

  const content = (
    <div
      ref={dropdownRef}
      className="portal-profile-dropdown"
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "320px",
        zIndex: 9999,
        pointerEvents: "auto"
      }}
    >
      {/* Profile Header */}
      <div className="dropdown-profile-header">
        <div className="dropdown-profile-avatar">
          {userInitial}
        </div>
        <div className="dropdown-profile-copy">
          <p className="dropdown-profile-name">{profile?.username || "User"}</p>
          <p className="dropdown-profile-email">{profile?.email || "user@radar.com"}</p>
        </div>
      </div>

      <div className="profile-divider" />

      {/* Menu Items */}
      <div className="dropdown-menu-list">
        <button
          type="button"
          className="dropdown-menu-item"
          onClick={() => {
            setShowSignOutConfirm(false);
            onClose();
            navigate("/profile");
          }}
        >
          <span className="dropdown-menu-icon">
            <User size={15} />
          </span>
          <span className="dropdown-menu-label">My Profile</span>
        </button>
        <button
          type="button"
          className="dropdown-menu-item"
          onClick={() => {
            setShowSignOutConfirm(false);
            onClose();
            navigate("/settings");
          }}
        >
          <span className="dropdown-menu-icon">
            <Settings size={15} />
          </span>
          <span className="dropdown-menu-label">Settings</span>
        </button>
        <button
          type="button"
          className="dropdown-menu-item"
          onClick={() => {
            setShowSignOutConfirm(false);
            onClose();
            navigate("/support");
          }}
        >
          <span className="dropdown-menu-icon">
            <HelpCircle size={15} />
          </span>
          <span className="dropdown-menu-label">Help & Support</span>
        </button>
      </div>

      <div className="profile-divider" />

      {/* Mode Toggle */}
      <div className="dropdown-interface-section">
        <p className="dropdown-interface-title">CHOOSE YOUR INTERFACE</p>
        <div className="dropdown-toggle-group" role="tablist" aria-label="Choose your interface">
          {["Investor", "Trader"].map((option) => {
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={mode === option.toLowerCase()}
                onClick={() => handleSelectMode(option.toLowerCase())}
                className={`dropdown-toggle-option ${mode === option.toLowerCase() ? "selected active" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="profile-divider" />

      {/* Sign Out */}
      <button 
        type="button" 
        onClick={() => {
          if (onSignOut) {
            onSignOut();
          } else {
            setShowSignOutConfirm(true);
          }
        }}
        className="dropdown-signout-btn"
      >
        <LogOut size={15} />
        <span>Sign Out</span>
      </button>
    </div>
  );

  const confirmOverlay = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B0E14]/90 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-[400px] rounded-[24px] bg-[#1A1D24] p-8 shadow-2xl border border-white/5"
      >
        <div className="flex flex-col items-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <LogOut size={28} strokeWidth={2} />
          </div>

          <h3 className="text-2xl font-black text-white mb-2">
            Sign out?
          </h3>
          
          <p className="text-[15px] text-slate-400 mb-8 text-center">
            Are you sure you want to sign out?
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={() => setShowSignOutConfirm(false)}
              className="flex-1 rounded-[14px] bg-[#2A2E39] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#323744] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowSignOutConfirm(false);
                onClose();
                localStorage.clear();
                window.location.replace("/");
              }}
              className="flex-1 rounded-[14px] bg-gradient-to-r from-[#FF512F] to-[#F09819] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Yes, Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(content, document.body)}
      {showSignOutConfirm ? createPortal(confirmOverlay, document.body) : null}
    </>
  );
};

export default ProfileDropdown;
