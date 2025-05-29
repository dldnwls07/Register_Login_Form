import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState(null);
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
        <h2>사용자 정보</h2>
        <div className="profile-info">
          <p><strong>사용자명:</strong> {user.username}</p>
          <p><strong>이메일:</strong> {user.email}</p>
          <p><strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>로그아웃</button>
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
