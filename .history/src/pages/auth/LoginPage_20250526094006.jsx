import React from 'react';
import '../../styles/Common.css';

const LoginPage = () => {
    return (
        <div className="auth-container">
            <h2 className="auth-title">로그인</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="username">아이디</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="아이디를 입력하세요"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>
                <button type="submit" className="auth-button">로그인</button>
            </form>
        </div>
    );
};

export default LoginPage;
