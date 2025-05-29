import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18 이상에서는 react-dom/client를 사용
import App from './App';
import './styles/App.css';

// React 18 방식으로 root 생성
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);