import React, { useState } from 'react';
import { sendPasswordResetEmail, findUsernameByEmail } from '../../api/authAPI';
import '../../styles/pages/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (isPasswordReset) {
        await sendPasswordResetEmail(email);
        setMessage('비밀번호 재설정 이메일이 전송되었습니다.');
      } else {
        const username = await findUsernameByEmail(email);
        setMessage(`아이디는 ${username}입니다.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || '요청 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="forgot-password-page">
      <h1>{isPasswordReset ? '비밀번호 찾기' : '아이디 찾기'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit">{isPasswordReset ? '비밀번호 재설정' : '아이디 찾기'}</button>
          <button type="button" onClick={() => setIsPasswordReset(!isPasswordReset)}>
            {isPasswordReset ? '아이디 찾기' : '비밀번호 찾기'}로 전환
          </button>
        </div>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ForgotPasswordPage;
