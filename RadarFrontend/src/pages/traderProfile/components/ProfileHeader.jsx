import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ProfileHeader = ({ name, email, status, onBack }) => {
  return (
    <header className="trader-profile-header">
      <button type="button" className="profile-back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="profile-identity-card">
        <div className="profile-avatar" aria-hidden="true">
          {name.slice(0, 1)}
        </div>
        <div>
          <h1 className="profile-name">{name}</h1>
          <p className="profile-email">{email}</p>
        </div>
        <span className="profile-status-badge">{status}</span>
      </div>
    </header>
  );
};

export default ProfileHeader;
