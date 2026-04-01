const ChatHeader = ({ activeChat, onMenuToggle }) => {
  if (!activeChat) return null;

  const isGeneral = activeChat.type === 'general';
  const name = isGeneral ? 'General' : activeChat.user?.name;
  const initial = isGeneral ? '#' : name?.charAt(0)?.toUpperCase();

  return (
    <div className="chat-header">
      {/* Hamburger — visible only on mobile */}
      <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle sidebar">
        <span /><span /><span />
      </button>

      <div className={`chat-header-avatar ${isGeneral ? 'chat-header-general' : ''}`}>
        {initial}
      </div>
      <div>
        <p className="chat-header-name">
          {isGeneral ? '# General' : name}
        </p>
        <p className="chat-header-sub">
          {isGeneral ? 'Everyone in Clav' : `Direct message with ${name}`}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
