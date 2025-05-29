import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    displayName: user?.displayName || user?.username || '',
    email: user?.email || '',
    notifications: user?.preferences?.notifications || false,
    darkMode: user?.preferences?.darkMode || false,
    language: user?.preferences?.language || 'ko'
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        ...user,
        displayName: editedUser.displayName,
        preferences: {
          notifications: editedUser.notifications,
          darkMode: editedUser.darkMode,
          language: editedUser.language
        }
      });
      setIsEditing(false);
      
      // 다크모드 설정 적용
      document.documentElement.classList.toggle('dark-mode', editedUser.darkMode);
      
      // 언어 설정 저장
      localStorage.setItem('preferredLanguage', editedUser.language);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser({
      displayName: user.displayName || user.username,
      email: user.email,
      notifications: user?.preferences?.notifications || false,
      darkMode: user?.preferences?.darkMode || false,
      language: user?.preferences?.language || 'ko'
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <h1>내 프로필</h1>
      
      <div className="back-link">
        <button onClick={() => navigate('/')}>← 대시보드로 돌아가기</button>
      </div>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {(user.displayName || user.username).charAt(0).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2>{isEditing ? '프로필 수정' : '사용자 정보'}</h2>
            {isEditing ? (
              <div className="profile-info">
                <div className="form-group">
                  <label>아이디:</label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>사용자명:</label>
                  <input
                    type="text"
                    value={editedUser.displayName}
                    onChange={(e) => setEditedUser({...editedUser, displayName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>이메일:</label>
                  <input
                    type="email"
                    value={editedUser.email}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <p><strong>아이디:</strong> {user.username}</p>
                <p><strong>사용자명:</strong> {user.displayName || user.username}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                <p><strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>환경 설정</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <span>이메일 알림</span>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={editedUser.notifications}
                  onChange={(e) => setEditedUser({...editedUser, notifications: e.target.checked})}
                  disabled={!isEditing}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span>다크 모드</span>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={editedUser.darkMode}
                  onChange={(e) => setEditedUser({...editedUser, darkMode: e.target.checked})}
                  disabled={!isEditing}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item setting-item-select">
              <span>언어 설정</span>
              <select
                value={editedUser.language}
                onChange={(e) => setEditedUser({...editedUser, language: e.target.value})}
                disabled={!isEditing}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="edit-profile-button" onClick={handleSaveProfile}>저장</button>
              <button className="cancel-button" onClick={handleCancelEdit}>취소</button>
            </>
          ) : (
            <>
              <button className="edit-profile-button" onClick={handleEditProfile}>프로필 수정</button>
              <button className="logout-button" onClick={handleLogout}>로그아웃</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
