// WebSocketClient.js
const createWebSocket = () => {
	const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
	const wsUrl = `${protocol}://${window.location.host}/ws`;
	const socket = new WebSocket(wsUrl);
	
	socket.addEventListener('error', (error) => {
		console.error('WebSocket 연결 오류:', error);
		// 재연결 로직 (예: 3초 후 재시도)
		setTimeout(createWebSocket, 3000);
	});
	
	// ...기존 이벤트 리스너...
	return socket;
};

const socket = createWebSocket();

export default socket;