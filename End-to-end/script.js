// Configuration
const WORKER_URL = 'https://onlinechat.hanfu2022.workers.dev'; // 替换为你的 Worker URL

// Generate a random anonymous ID
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// Store user ID locally
if (!localStorage.getItem('anonymousId')) {
    localStorage.setItem('anonymousId', generateId());
}
const anonymousId = localStorage.getItem('anonymousId');

// Set user ID in the input field (on index.html)
const userIdInput = document.getElementById('userId');
if (userIdInput) userIdInput.value = anonymousId;

// Handle chat initiation (on index.html)
const startChatButton = document.getElementById('startChat');
if (startChatButton) {
    startChatButton.addEventListener('click', () => {
        const friendId = document.getElementById('friendId').value.trim();
        if (friendId) {
            window.location.href = `chat.html?friendId=${friendId}`;
        } else {
            alert('Please enter a friend ID.');
        }
    });
}

// Chat functionality (on chat.html)
const sendMessageButton = document.getElementById('sendMessage');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

if (sendMessageButton) {
    const urlParams = new URLSearchParams(window.location.search);
    const friendId = urlParams.get('friendId');

    // Fetch messages from server
  data.messages.forEach(({ senderId, encryptedMessage }) => {
    const decryptedMessage = decryptMessage(encryptedMessage);
    const messageElement = document.createElement('div');
    messageElement.textContent = `${senderId}: ${decryptedMessage}`;
    messagesDiv.appendChild(messageElement);
});


    // Send a message to the server
    sendMessageButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message) {
            await fetch(`${WORKER_URL}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: anonymousId,
                    recipientId: friendId,
                    encryptedMessage: message
                })
            });
            messageInput.value = '';
            const messageElement = document.createElement('div');
            messageElement.textContent = `You: ${message}`;
            messagesDiv.appendChild(messageElement);
        }
    });

    // Periodically fetch new messages
    setInterval(fetchMessages, 3000);
}

const encryptionKey = "shared-secret-key"; // 共享密钥 (双方约定)

function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, encryptionKey).toString();
}

function decryptMessage(encryptedMessage) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Generate shareable link
const generateLinkButton = document.getElementById('generateLink');
const shareLinkInput = document.getElementById('shareLink');

if (generateLinkButton) {
    generateLinkButton.addEventListener('click', () => {
        const shareLink = `${window.location.origin}/chat.html?friendId=${anonymousId}`;
        shareLinkInput.value = shareLink;
        shareLinkInput.style.display = 'block';
        alert('Share this link with your friend to start chatting!');
    });
}

function generateEncryptedLink(friendId) {
    const encryptedId = encryptMessage(friendId);
    return `${window.location.origin}/chat.html?data=${encodeURIComponent(encryptedId)}`;
}

// Decrypt the link in the Worker:
const encryptedId = new URL(request.url).searchParams.get('data');
const friendId = decryptMessage(encryptedId);
