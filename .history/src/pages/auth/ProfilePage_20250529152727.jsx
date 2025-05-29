import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    email: user?.email || '',
    notifications: user?.preferences?.notifications || false,
    darkMode: user?.preferences?.darkMode || false,
    language: user?.preferences?.language || 'ko'
  });
  const navigate = useNavigate();

  const handleMigrateData = async () => {
    // 마이그레이션 로직 호출
    try {
      // 실제 마이그레이션 서비스 사용
      const { migrateAllDataToDb } = await import('../../utils/migrationUtil');
      const result = await migrateAllDataToDb(user.id);
      
      if (result.success) {
        const transactionCount = result.transactions.successCount || 0;
        const goalMigrated = result.goal.migrated;
        
        setMigrationStatus({
          success: true,
          count: transactionCount,
          goalMigrated: goalMigrated
        });
      } else {
        throw new Error(result.error || '마이그레이션 실패');
      }
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      setMigrationStatus({ success: false, error: error.message });
    }
  };

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
        ...editedUser,
        preferences: {
          notifications: editedUser.notifications,
          darkMode: editedUser.darkMode,
          language: editedUser.language
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser({
      username: user.username,
      email: user.email,
      notifications: user?.preferences?.notifications || false,
      darkMode: user?.preferences?.darkMode || false,
      language: user?.preferences?.language || 'ko'
    });
    setIsEditing(false);
  };

  if (!user) {
    return null; // PrivateRoute에서 처리되므로 여기서는 간단히 처리
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
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2>{isEditing ? '프로필 수정' : '사용자 정보'}</h2>
            {isEditing ? (
              <>
                <div className="profile-info">
                  <div>
                    <label>사용자명:</label>
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label>이메일:</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="profile-info">
                <p><strong>사용자명:</strong> {user.username}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                <p><strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>알림 설정</h3>
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
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="edit-profile-button" onClick={handleSaveProfile}>저장</button>
              <button className="logout-button" onClick={handleCancelEdit}>취소</button>
            </>
          ) : (
            <>
              <button className="edit-profile-button" onClick={handleEditProfile}>프로필 수정</button>
              <button className="logout-button" onClick={handleLogout}>로그아웃</button>
            </>
          )}
        </div>
      </div>
      
      <div className="data-management">
        <h2>데이터 관리</h2>
        <button 
          className="migrate-button"
          onClick={handleMigrateData}
        >
          로컬 데이터를 DB로 마이그레이션
        </button>
        {migrationStatus && (
          <div className={`migration-status ${migrationStatus.success ? 'success' : 'error'}`}>
            {migrationStatus.success 
              ? (
                <>
                  <p>{`${migrationStatus.count}개 거래 항목 마이그레이션 성공!`}</p>
                  {migrationStatus.goalMigrated && <p>재정 목표 데이터 마이그레이션 완료!</p>}
                </>
              )
              : `마이그레이션 실패: ${migrationStatus.error}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
