// Get userId and friendId from URL params
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const friendId = urlParams.get('friendId');

const sendMessageButton = document.getElementById('sendMessage');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

// Fetch messages from server and decrypt them
async function fetchMessages() {
    const response = await fetch(`https://onlinechat.hanfu2022.workers.dev/getMessages?userId=${userId}&friendId=${friendId}`);
    const data = await response.json();
    
    data.messages.forEach(({ senderId, encryptedMessage }) => {
        const decryptedMessage = decryptMessage(encryptedMessage);
        const messageElement = document.createElement('div');
        messageElement.textContent = `${senderId}: ${decryptedMessage}`;
        messagesDiv.appendChild(messageElement);
    });
}

// Send a message to the server
sendMessageButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
        const encryptedMessage = encryptMessage(message);
        
        await fetch(`https://onlinechat.hanfu2022.workers.dev/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: userId,
                recipientId: friendId,
                encryptedMessage: encryptedMessage
            })
        });

        messageInput.value = '';
        const messageElement = document.createElement('div');
        messageElement.textContent = `You: ${message}`;
        messagesDiv.appendChild(messageElement);
    }
});

// Encrypt message with AES
function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, 'shared-secret-key').toString();
}

// Decrypt message with AES
function decryptMessage(encryptedMessage) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, 'shared-secret-key');
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Periodically fetch new messages
setInterval(fetchMessages, 3000);

// JavaScript 代码（放在 `chat.js` 中）
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessage');
const messagesDiv = document.getElementById('messages');

// 获取 URL 中的 friendId 参数
const urlParams = new URLSearchParams(window.location.search);
const friendId = urlParams.get('friendId');

// 显示当前聊天对象的信息
document.getElementById('chatWith').innerText = `Chat with: ${friendId}`;

sendMessageButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
        // 发送消息到 Worker 环境
        await sendMessageToServer(friendId, message);
        
        // 显示消息
        messagesDiv.innerHTML += `<div>You: ${message}</div>`;
        messageInput.value = '';
    }
});

// 通过 Fetch API 向 Worker 发送消息
async function sendMessageToServer(friendId, message) {
    const response = await fetch('/sendMessage', {
        method: 'POST',
        body: JSON.stringify({ friendId, message }),
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
}

// Chat 页面定时获取消息
setInterval(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const friendId = urlParams.get('friendId');

    const response = await fetch(`/getMessages?friendId=${friendId}`);
    const messages = await response.json();

    // 清空并更新消息展示
    messagesDiv.innerHTML = ''; // 清空旧的消息
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.senderId}: ${msg.message}`;
        messagesDiv.appendChild(messageElement);
    });
}, 3000);  // 每 3 秒钟更新一次

// Chat functionality (on chat.html)
const sendMessageButton = document.getElementById('sendMessage');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

// Get roomId from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');  // Your user ID
const roomId = urlParams.get('roomId');  // Room ID for the chat

// Show user ID in the chat input
if (document.getElementById('userIdInput')) {
    document.getElementById('userIdInput').value = userId;
}

// Handle sending messages
sendMessageButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
        await fetch(`${WORKER_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: userId,
                roomId: roomId,
                encryptedMessage: encryptMessage(message),
            })
        });
        messageInput.value = '';
    }
});

// Fetch messages for the room
async function fetchMessages() {
    const response = await fetch(`${WORKER_URL}/getMessages?roomId=${roomId}`);
    const data = await response.json();
    messagesDiv.innerHTML = ''; // Clear existing messages
    data.messages.forEach(({ senderId, encryptedMessage }) => {
        const decryptedMessage = decryptMessage(encryptedMessage);
        const messageElement = document.createElement('div');
        messageElement.textContent = `${senderId}: ${decryptedMessage}`;
        messagesDiv.appendChild(messageElement);
    });
}

// Periodically fetch new messages
setInterval(fetchMessages, 3000);

// Encryption and Decryption (same as previous code)
const encryptionKey = "shared-secret-key"; // Example key for encryption
function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, encryptionKey).toString();
}

function decryptMessage(encryptedMessage) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

