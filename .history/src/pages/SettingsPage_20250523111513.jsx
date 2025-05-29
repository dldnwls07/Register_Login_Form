import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/SettingsPage.css';

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: false,
    notificationsEnabled: true,
    currency: 'KRW'
  });
    // 설정 불러오기 (로그인 상태에 따라 다르게 처리)
  useEffect(() => {
    // 유저별 설정 키 생성
    const settingsKey = user ? `appSettings_${user.id}` : 'appSettings';
    
    const savedSettings = localStorage.getItem(settingsKey);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('설정 파싱 오류:', e);
      }
    }
  }, [user]);
  
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    setSettings(newSettings);
    
    // 유저별로 설정 저장
    const settingsKey = user ? `appSettings_${user.id}` : 'appSettings';
    localStorage.setItem(settingsKey, JSON.stringify(newSettings));
  };
  
  return (
    <div className="settings-page">
      <h1>설정</h1>
      
      <div className="back-link">
        <Link to="/">← 대시보드로 돌아가기</Link>
      </div>
      
      <div className="settings-section">
        <h2>앱 설정</h2>
        
        <div className="setting-item">
          <label>
            <span>다크 모드</span>
            <input 
              type="checkbox" 
              checked={settings.darkMode}
              onChange={e => handleSettingChange('darkMode', e.target.checked)}
            />
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <span>알림 사용</span>
            <input 
              type="checkbox" 
              checked={settings.notificationsEnabled}
              onChange={e => handleSettingChange('notificationsEnabled', e.target.checked)}
            />
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <span>통화</span>
            <select 
              value={settings.currency}
              onChange={e => handleSettingChange('currency', e.target.value)}
            >
              <option value="KRW">원 (₩)</option>
              <option value="USD">달러 ($)</option>
              <option value="EUR">유로 (€)</option>
              <option value="JPY">엔 (¥)</option>
            </select>
          </label>
        </div>
      </div>
        <div className="settings-section">
        <h2>계정 설정</h2>
        <Link to="/profile" className="profile-link">프로필 관리</Link>
        
        {user && (
          <>
            <button 
              className="data-export-button"
              onClick={() => {
                alert('데이터 내보내기 기능은 곧 제공될 예정입니다.');
              }}
            >
              데이터 내보내기
            </button>
            
            <div className="user-info">
              <p><strong>현재 로그인:</strong> {user.username}</p>
              <p><strong>이메일:</strong> {user.email}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
