const WORKER_URL = 'https://onlinechat.hanfu2022.workers.dev';

// Generate unique anonymous ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Store user ID locally
if (!localStorage.getItem('anonymousId')) {
    localStorage.setItem('anonymousId', generateId());
}
const anonymousId = localStorage.getItem('anonymousId');

// Handle chat initiation
const startChatButton = document.getElementById('startChat');
if (startChatButton) {
    startChatButton.addEventListener('click', () => {
        const friendId = document.getElementById('friendId').value.trim();
        if (friendId) {
            const encryptedLink = generateEncryptedLink(friendId);
            window.location.href = encryptedLink;
        } else {
            alert('Please enter a friend ID.');
        }
    });
}

// Chat functionality
const sendMessageButton = document.getElementById('sendMessage');
if (sendMessageButton) {
    const friendId = decryptMessage(new URLSearchParams(window.location.search).get('data'));
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');

    sendMessageButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message) {
            const encryptedMessage = encryptMessage(message);
            await fetch(`${WORKER_URL}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderId: anonymousId, recipientId: friendId, encryptedMessage })
            });
            messageInput.value = '';
        }
    });

    setInterval(async () => {
        const response = await fetch(`${WORKER_URL}/getMessages?recipientId=${anonymousId}`);
        const messages = await response.json();
        messages.forEach((encryptedMessage) => {
            const decryptedMessage = decryptMessage(encryptedMessage);
            const messageElement = document.createElement('div');
            messageElement.textContent = decryptedMessage;
            messagesDiv.appendChild(messageElement);
        });
    }, 3000);
}

// Generate encrypted shareable link
function generateEncryptedLink(friendId) {
    const encryptedId = encryptMessage(friendId);
    return `${window.location.origin}/chat.html?data=${encodeURIComponent(encryptedId)}`;
}

// Encryption functions
function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, 'shared-secret-key').toString();
}

function decryptMessage(encryptedMessage) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, 'shared-secret-key');
    return bytes.toString(CryptoJS.enc.Utf8);
}
