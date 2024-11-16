// Configuration
const WORKER_URL = 'https://onlinechat.hanfu2022.workers.dev'; // 替换为你的 Worker URL
const encryptionKey = "shared-secret-key"; // 共享密钥 (双方约定)

const sendMessageButton = document.getElementById('sendMessage');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

// Get friend ID from URL params
const urlParams = new URLSearchParams(window.location.search);
const friendId = urlParams.get('friendId');

// Fetch messages from server and decrypt them
async function fetchMessages() {
    const response = await fetch(`${WORKER_URL}/getMessages?friendId=${friendId}`);
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
        
        await fetch(`${WORKER_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: friendId,
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
    return CryptoJS.AES.encrypt(message, encryptionKey).toString();
}

// Decrypt message with AES
function decryptMessage(encryptedMessage) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Periodically fetch new messages
setInterval(fetchMessages, 3000);
