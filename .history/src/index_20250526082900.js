import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // .jsx 확장자 명시
import './styles/App.css';
import './styles/Common.css';

// React 18 방식으로 root 생성
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);