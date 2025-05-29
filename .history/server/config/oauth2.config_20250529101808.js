const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5001/api/auth/google/callback'  // 리디렉션 URI
);

// Gmail API 사용 범위 설정
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// OAuth2 URL 생성 함수
const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
};

module.exports = {
    oauth2Client,
    getAuthUrl
};
