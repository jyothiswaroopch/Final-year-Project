import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, Camera, Edit2, Hash, Save, UserRound, X, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, getProgressKey } from '../../api/learningApi';
import { fetchUserProfile, updateUserProfile } from '../../api/userApi';
import api from '../../api/api';

const unwrap = (value, fallback) => value?.data?.data ?? value?.data ?? value ?? fallback;

const formatJoined = (createdAt) => {
  if (!createdAt) return 'N/A';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const resizeProfileImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Unable to read profile picture'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('Unable to process profile picture'));
    image.onload = () => {
      const maxSize = 360;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.src = String(reader.result || '');
  };
  reader.readAsDataURL(file);
});

export default function InvestorProfilePage({ onBack }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ username: '', email: '', address: '', profilePicture: '' });

  const initial = useMemo(() => {
    const source = profile?.username || profile?.email || 'I';
    return source.trim().charAt(0).toUpperCase() || 'I';
  }, [profile]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, courseRes, watchlistRes] = await Promise.all([
        fetchUserProfile(),
        fetchCourses('investor').catch(() => []),
        api.get('/watchlist').catch(() => ({ data: [] })),
      ]);

      const profileData = unwrap(profileRes, {});
      setProfile(profileData);
      setDraft({
        username: profileData.username || '',
        email: profileData.email || '',
        address: profileData.address || '',
        profilePicture: profileData.profilePicture || '',
      });

      // Watchlist snapshot
      const lists = Array.isArray(watchlistRes?.data) ? watchlistRes.data : [];
      const items = lists[0]?.items || [];
      setWatchlist(items.slice(0, 5));

      // All courses with progress from localStorage
      const allCourses = Array.isArray(courseRes) ? courseRes : [];
      const coursesWithProgress = allCourses.map(c => {
        const courseId = c.id || c._id;
        const stored = JSON.parse(
          localStorage.getItem(getProgressKey(courseId, 'INVESTOR')) ||
          localStorage.getItem(getProgressKey(courseId, '')) || '{}'
        );
        const totalChapters = c.chapters?.length || 0;
        const completedChapters = Object.values(stored.chapters || {}).filter(Boolean).length;
        const pct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
        return { ...c, _progress: { pct, completedChapters, totalChapters } };
      });
      setCourses(coursesWithProgress);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const resized = await resizeProfileImage(file);
      setDraft(prev => ({ ...prev, profilePicture: resized }));
      setEditing(true);
    } catch (err) {
      setError(err.message || 'Unable to use this profile picture');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateUserProfile(draft);
      const nextProfile = { ...profile, ...updated };
      setProfile(nextProfile);
      setDraft({ username: nextProfile.username || '', email: nextProfile.email || '', address: nextProfile.address || '', profilePicture: nextProfile.profilePicture || '' });
      window.dispatchEvent(new CustomEvent('radar:profile-updated', { detail: nextProfile }));
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({ username: profile?.username || '', email: profile?.email || '', address: profile?.address || '', profilePicture: profile?.profilePicture || '' });
    setEditing(false);
  };

  // Fallback courses if API returns empty
  const displayCourses = courses.length > 0 ? courses : [
    { _id: 'fundamental-analysis', title: 'Fundamental Analysis', description: 'Learn how to read balance sheets, income statements and value stocks.' },
    { _id: 'portfolio-building', title: 'Portfolio Building', description: 'Diversification, rebalancing, and long-term wealth creation strategies.' },
  ];

  if (loading) {
    return (
      <div className="investor-profile-page" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="investor-profile-page" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Back button */}
      <button
        onClick={onBack || (() => navigate('/investor/dashboard'))}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={loadProfile} style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Hero Card */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoPick} />
        <button
          onClick={() => fileRef.current?.click()}
          style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}
          aria-label="Change profile picture"
        >
          {(draft.profilePicture || profile?.profilePicture) ? (
            <img src={draft.profilePicture || profile.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{initial}</span>
          )}
        </button>

        <div style={{ flex: 1, minWidth: '220px' }}>
          {editing ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {['username', 'email', 'address'].map(field => (
                <input key={field} name={field} value={draft[field]} onChange={handleDraftChange} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '13px', outline: 'none', background: '#f0fdf4' }} />
              ))}
            </div>
          ) : (
            <>
              <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900, color: '#1e293b' }}>{profile?.username || 'Investor'}</h1>
              <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{profile?.email || 'account@radar.com'}</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#94a3b8' }}>{profile?.address || 'Address not added yet'}</p>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: '#d1fae5', color: '#059669', borderRadius: '999px', padding: '4px 12px' }}>Active</span>
          {editing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCancel} disabled={saving} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#059669', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Save size={13} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1fae5', background: '#f0fdf4', color: '#059669', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit2 size={13} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Two-column: Account Info + Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 900, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: <Calendar size={16} />, text: `Joined: ${formatJoined(profile?.createdAt)}` },
              { icon: <UserRound size={16} />, text: 'Role: Investor' },
              { icon: <Hash size={16} />, text: `User ID: ${profile?._id || 'N/A'}` },
            ].map((item, i) => (
              <p key={i} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                <span style={{ color: '#059669' }}>{item.icon}</span>{item.text}
              </p>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 900, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Watchlist Snapshot</h2>
          {watchlist.length === 0 ? (
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Your watchlist is empty.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {watchlist.map(item => (
                <div key={item.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{String(item.symbol || '').replace(/\.(NS|BO)$/i, '')}</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>{item.price ? `₹${Number(item.price).toFixed(2)}` : '--'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Academy Courses — ALL with progress */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <BookOpen size={18} style={{ color: '#059669' }} />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1e293b' }}>Investor Academy</h2>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
          Your learning progress across all investor courses.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {displayCourses.map((course, index) => {
            const prog = course._progress;
            const pct = prog?.pct ?? 0;
            const completed = prog?.completedChapters ?? 0;
            const total = prog?.totalChapters ?? 0;
            const isDone = pct === 100;
            const colors = index % 2 === 0
              ? { bg: '#f0fdf4', border: '#bbf7d0', accent: '#059669', bar: '#10b981' }
              : { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', bar: '#3b82f6' };

            return (
              <div key={course._id || course.id || course.title}
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 900, color: '#1e293b', lineHeight: 1.3 }}>{course.title}</h3>
                  {isDone && (
                    <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '2px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      ✓ Complete
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>{course.description}</p>

                {total > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px', color: '#64748b', fontWeight: 700 }}>
                      <span>{pct > 0 ? `${pct}% complete` : 'Not started'}</span>
                      <span>{completed}/{total} chapters</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: isDone ? '#10b981' : colors.bar, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate('/investor/dashboard/academy')}
                  style={{ alignSelf: 'flex-start', padding: '7px 16px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'white', color: colors.accent, fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {isDone ? 'Review Course' : pct > 0 ? 'Continue' : 'Start Course'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
