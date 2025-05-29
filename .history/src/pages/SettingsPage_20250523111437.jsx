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
  
  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('설정 파싱 오류:', e);
      }
    }
  }, []);
  
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    setSettings(newSettings);
    
    // 설정 저장
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
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
        <button className="data-export-button">데이터 내보내기</button>
      </div>
    </div>
  );
};

export default SettingsPage;
