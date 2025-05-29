import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, updateUser, updatePassword, setUser, getCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({
    displayName: user?.displayName || user?.username || '',
    darkMode: user?.preferences?.darkMode || false,
    language: user?.preferences?.language || 'ko'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // 다크모드 효과 적용
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', editedUser.darkMode);
  }, [editedUser.darkMode]);
  // 언어 설정 적용
  useEffect(() => {
    if (editedUser.language) {
      document.documentElement.setAttribute('lang', editedUser.language);
      localStorage.setItem('preferredLanguage', editedUser.language);
    }
  }, [editedUser.language]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const handleLogout = () => {
    document.documentElement.classList.remove('dark-mode');
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setIsChangingPassword(false);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.currentPassword) {
        setPasswordError('현재 비밀번호를 입력해주세요.');
        return;
    }

    if (!validatePassword(passwordData.newPassword)) {
        setPasswordError('새 비밀번호는 8자 이상이며, 대문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.');
        return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('새 비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        await updatePassword(passwordData.currentPassword, passwordData.newPassword);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
        setPasswordError(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleSaveProfile = async () => {
    try {
        const updatedUser = {
            ...user,
            displayName: editedUser.displayName,
            preferences: {
                ...user.preferences,
                darkMode: editedUser.darkMode,
                language: editedUser.language
            }
        };
        
        await updateUser(updatedUser);
        // 전역 상태 업데이트
        const updatedUserData = await getCurrentUser();
        setUser(updatedUserData);
        
        // 언어 설정 적용
        document.documentElement.lang = editedUser.language;
        // 다크모드 설정 적용
        document.documentElement.className = editedUser.darkMode ? 'dark-mode' : '';
        
        setIsEditing(false);
        alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
        console.error('프로필 업데이트 실패:', error);
        alert('프로필 업데이트에 실패했습니다.');
    }
};

  const handleCancelEdit = () => {
    setEditedUser({
      displayName: user.displayName || user.username,
      darkMode: user?.preferences?.darkMode || false,
      language: user?.preferences?.language || 'ko'
    });
    setIsEditing(false);
    setIsChangingPassword(false);
    setPasswordError('');
  };

  const getLanguageName = (code) => {
    const languages = {
      ko: '한국어',
      en: 'English',
      ja: '日本語'
    };
    return languages[code] || code;
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
            <h2>{isEditing ? '프로필 수정' : isChangingPassword ? '비밀번호 변경' : '사용자 정보'}</h2>
            {!isChangingPassword ? (
              isEditing ? (
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
                      value={user.email}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-info">                  <p><strong>아이디:</strong> {user.username}</p>
                  <p><strong>사용자명:</strong> {user.displayName || user.username}</p>
                  <p><strong>이메일:</strong> {user.email}</p>
                  <p><strong>가입일:</strong> {formatDate(user.created_at)}</p>
                </div>
              )
            ) : (
              <form onSubmit={handlePasswordChange} className="password-change-form">
                <div className="form-group">
                  <label>현재 비밀번호:</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>새 비밀번호:</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>새 비밀번호 확인:</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                {passwordError && <div className="error-message">{passwordError}</div>}
                <div className="profile-actions">
                  <button type="submit" className="edit-profile-button">비밀번호 변경</button>
                  <button type="button" className="cancel-button" onClick={handleCancelEdit}>취소</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {!isChangingPassword && (
          <div className="profile-section">
            <h3>환경 설정</h3>
            <div className="settings-grid">
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
                <span>언어 설정</span>                <select
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
        )}

        <div className="profile-actions">
          {!isChangingPassword && !isEditing && (
            <>
              <button className="edit-profile-button" onClick={handleEditProfile}>프로필 수정</button>
              <button className="password-change-button" onClick={() => setIsChangingPassword(true)}>비밀번호 변경</button>
              <button className="logout-button" onClick={handleLogout}>로그아웃</button>
            </>
          )}          {isEditing && !isChangingPassword && (
            <>
              <button className="edit-profile-button" onClick={handleSaveProfile}>저장</button>
              <button className="cancel-button" onClick={handleCancelEdit}>취소</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
