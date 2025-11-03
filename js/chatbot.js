/**
 * Chatbot Interface with Claude API
 */

class Chatbot {
    constructor() {
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.toggleButton = document.getElementById('chatbotToggle');
        this.closeButton = document.getElementById('chatbotClose');
        this.container = document.getElementById('chatbotContainer');

        this.conversationHistory = [];
        this.isLoading = false;

        this.init();
    }

    init() {
        // Toggle chatbot visibility
        this.toggleButton.addEventListener('click', () => {
            this.container.style.display = 'block';
            this.input.focus();
        });

        this.closeButton.addEventListener('click', () => {
            this.container.style.display = 'none';
        });

        // Send message on button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isLoading) return;

        // Clear input
        this.input.value = '';

        // Add user message to UI
        this.addMessage(message, 'user');

        // Show loading indicator
        this.isLoading = true;
        this.sendButton.disabled = true;
        const loadingMessage = this.addLoadingMessage();

        try {
            // Send message to backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: this.conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();

            // Remove loading indicator
            this.removeLoadingMessage(loadingMessage);

            // Add bot response to UI
            this.addMessage(data.response, 'bot');

            // Update conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: data.response
            });

        } catch (error) {
            console.error('Error:', error);
            this.removeLoadingMessage(loadingMessage);
            this.addMessage('죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'bot');
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
            this.input.focus();
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('p');
        messageContent.textContent = text;

        messageDiv.appendChild(messageContent);
        this.messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.scrollToBottom();

        return messageDiv;
    }

    addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message loading';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';

        messageDiv.appendChild(typingIndicator);
        this.messagesContainer.appendChild(messageDiv);

        this.scrollToBottom();

        return messageDiv;
    }

    removeLoadingMessage(messageDiv) {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
