/**
 * Hotel Guide FAQ Accordion
 */

// Load and display hotel guide
async function loadHotelGuide() {
    try {
        const response = await fetch('data/hotel-guide.json');
        const data = await response.json();
        const guide = data.hotelGuide;

        // Set description
        const descriptionEl = document.getElementById('hotelDescription');
        if (descriptionEl) {
            descriptionEl.textContent = guide.description;
        }

        // Create FAQ items
        const faqContainer = document.getElementById('faqContainer');
        if (faqContainer) {
            guide.faqs.forEach((faq, index) => {
                const faqItem = createFAQItem(faq, index);
                faqContainer.appendChild(faqItem);
            });
        }
    } catch (error) {
        console.error('Failed to load hotel guide:', error);
    }
}

// Create FAQ accordion item
function createFAQItem(faq, index) {
    const item = document.createElement('div');
    item.className = 'faq-item';

    const question = document.createElement('button');
    question.className = 'faq-question';
    question.setAttribute('aria-expanded', 'false');
    question.innerHTML = `
        <span>${faq.question}</span>
        <span class="faq-icon">▼</span>
    `;

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.innerHTML = `
        <div class="faq-answer-content">${faq.answer}</div>
    `;

    // Toggle functionality
    question.addEventListener('click', () => {
        const isActive = question.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-question').forEach(q => {
            q.classList.remove('active');
            q.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('.faq-answer').forEach(a => {
            a.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            question.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
            answer.classList.add('active');
        }
    });

    item.appendChild(question);
    item.appendChild(answer);

    return item;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadHotelGuide);
