import React, { useState, useEffect } from 'react';
import '../styles/components/Notification.css';

// 알림 타입에 따른 아이콘
const getIcon = (type) => {
  switch (type) {
    case 'info':
      return <i className="fas fa-info-circle"></i>;
    case 'success':
      return <i className="fas fa-check-circle"></i>;
    case 'warning':
      return <i className="fas fa-exclamation-triangle"></i>;
    case 'error':
      return <i className="fas fa-times-circle"></i>;
    default:
      return <i className="fas fa-bell"></i>;
  }
};

/**
 * 알림 컴포넌트
 * @param {Object} props
 * @param {string} props.type - 알림 타입 ('info', 'success', 'warning', 'error')
 * @param {string} props.title - 알림 제목
 * @param {string} props.message - 알림 내용
 * @param {number} props.duration - 알림 지속 시간 (밀리초)
 * @param {Array} props.actions - 알림에 추가할 액션 버튼 목록
 * @param {Function} props.onClose - 알림 닫을 때 실행할 콜백
 */
const Notification = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  actions = [],
  onClose 
}) => {
  const [exiting, setExiting] = useState(false);
  
  useEffect(() => {
    // 자동 닫기 타이머
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // 애니메이션 시간과 일치
  };
  
  return (
    <div className={`notification ${exiting ? 'notification-exiting' : ''}`}>
      <div className={`notification-icon ${type}`}>
        {getIcon(type)}
      </div>
      <div className="notification-content">
        {title && <h3 className="notification-title">{title}</h3>}
        {message && <p className="notification-message">{message}</p>}
        
        {actions.length > 0 && (
          <div className="notification-actions">
            {actions.map((action, index) => (
              <button 
                key={index} 
                className="notification-button" 
                onClick={() => {
                  action.onClick();
                  handleClose();
                }}
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 남은 시간 표시 */}
      <div 
        className="notification-progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

export default Notification;
