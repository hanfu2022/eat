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
            window.location.href = `chat.html?userId=${anonymousId}&friendId=${friendId}`;
        } else {
            alert('Please enter a friend ID.');
        }
    });
}

// Generate shareable link (on index.html)
const generateLinkButton = document.getElementById('generateLink');
const shareLinkInput = document.getElementById('shareLink');

if (generateLinkButton) {
    generateLinkButton.addEventListener('click', () => {
        const shareLink = `${window.location.origin}/chat.html?userId=${anonymousId}&friendId=${anonymousId}`;
        shareLinkInput.value = shareLink;
        shareLinkInput.style.display = 'block';
        alert('Share this link with your friend to start chatting!');
    });
}
