import { useState, useEffect, useRef } from 'react';
import { searchUsers } from '../services/api';

const Sidebar = ({ user, activeChat, onChatSelect, dmConversations, onLogout, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const found = await searchUsers(query);
      setResults(found);
      setSearching(false);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleResultClick = (foundUser) => {
    setQuery('');
    setResults([]);
    onChatSelect({ type: 'dm', user: foundUser });
    onClose?.(); // close drawer on mobile after selecting
  };

  const handleChatSelect = (chat) => {
    onChatSelect(chat);
    onClose?.(); // close drawer on mobile after selecting
  };

  const isActive = (chat) => {
    if (chat.type === 'general') return activeChat?.type === 'general';
    return activeChat?.type === 'dm' && activeChat?.user?._id === chat.user._id;
  };

  return (
    <>
      {/* Dark overlay — mobile only */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo row with close button on mobile */}
        <div className="logo">
          <img src="/logo.png" alt="clav" />
          <h2>Clav</h2>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">×</button>
        </div>

        {/* Search bar */}
        <div className="search-wrapper">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search users…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); setResults([]); }}>×</button>
            )}
          </div>

          {/* Dropdown results */}
          {(results.length > 0 || (searching && query)) && (
            <div className="search-results">
              {searching && !results.length ? (
                <div className="search-result-item search-loading">Searching…</div>
              ) : results.length === 0 ? (
                <div className="search-result-item search-empty">No users found</div>
              ) : (
                results.map((u) => (
                  <div
                    key={u._id}
                    className="search-result-item"
                    onClick={() => handleResultClick(u)}
                  >
                    <div className="result-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="result-name">{u.name}</p>
                      <p className="result-email">{u.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="sidebar-section-label">CHANNELS</div>
        <div
          className={`room ${isActive({ type: 'general' }) ? 'room-active' : ''}`}
          onClick={() => handleChatSelect({ type: 'general' })}
        >
          # General
        </div>

        {/* Direct Messages */}
        {dmConversations.length > 0 && (
          <>
            <div className="sidebar-section-label">DIRECT MESSAGES</div>
            {dmConversations.map((conv) => (
              <div
                key={conv._id}
                className={`dm-item ${isActive({ type: 'dm', user: conv }) ? 'room-active' : ''}`}
                onClick={() => handleChatSelect({ type: 'dm', user: conv })}
              >
                <div className="dm-avatar">{conv.name.charAt(0).toUpperCase()}</div>
                <span className="dm-name">{conv.name}</span>
              </div>
            ))}
          </>
        )}

        {/* User profile + logout */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <div className="sidebar-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="sidebar-username">{user.name}</p>
                <p className="sidebar-email">{user.email}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">⏻</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;