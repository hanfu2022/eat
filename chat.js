document.addEventListener('DOMContentLoaded', function () {
    // 获取 URL 参数中的 userId 和 roomId
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const roomId = urlParams.get('roomId');  // 注意：替换为 roomId

    // 检查 userId 和 roomId 是否有效
    console.log(userId, roomId);  // 调试用

    // 获取 DOM 元素
    const chatWithElement = document.getElementById('chatWith');  // 获取 chatWith 元素

    if (chatWithElement) {
        // 显示聊天对象
        if (roomId) {
            chatWithElement.innerText = `Chat in room: ${roomId}`;  // 显示房间 ID
        } else {
            chatWithElement.innerText = "No valid room selected";
        }
    } else {
        console.error('Element with id "chatWith" not found');
    }

    // 获取 DOM 元素
    const sendMessageButton = document.getElementById('sendMessage');
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');

    // 获取消息并解密显示
    async function fetchMessages() {
        try {
            const response = await fetch(`https://onlinechat.hanfu2022.workers.dev/getMessages?userId=${userId}&roomId=${roomId}`);  // 使用 roomId 而不是 friendId
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();

            messagesDiv.innerHTML = ''; // 清空旧消息
            data.messages.forEach(({ senderId, encryptedMessage }) => {
                const decryptedMessage = decryptMessage(encryptedMessage);
                const messageElement = document.createElement('div');
                messageElement.textContent = `${senderId}: ${decryptedMessage}`;
                messagesDiv.appendChild(messageElement);
            });
        } catch (error) {
            console.error(error);
            messagesDiv.innerHTML = 'Failed to load messages.';
        }
    }

    // 发送消息到服务器
    sendMessageButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message) {
            const encryptedMessage = encryptMessage(message);

            try {
                await fetch('https://onlinechat.hanfu2022.workers.dev/sendMessage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        senderId: userId,
                        roomId: roomId,  // 使用 roomId 而不是 friendId
                        encryptedMessage: encryptedMessage
                    })
                });

                // 清空输入框并显示已发送的消息
                messageInput.value = '';
                const messageElement = document.createElement('div');
                messageElement.textContent = `You: ${message}`;
                messagesDiv.appendChild(messageElement);
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    });

    // 使用 AES 加密消息
    function encryptMessage(message) {
        return CryptoJS.AES.encrypt(message, 'shared-secret-key').toString();
    }

    // 使用 AES 解密消息
    function decryptMessage(encryptedMessage) {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, 'shared-secret-key');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // 定期获取新消息
    setInterval(fetchMessages, 3000); // 每 3 秒更新一次

    // 启动时先获取一次消息
    fetchMessages();
});
