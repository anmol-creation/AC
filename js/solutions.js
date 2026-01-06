document.addEventListener('DOMContentLoaded', () => {
    // 1. Accordion Logic
    const accordions = document.querySelectorAll('.accordion');

    accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.accordion-item');

        items.forEach(item => {
            const header = item.querySelector('.accordion-header');

            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all other items in this accordion
                items.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                        const content = otherItem.querySelector('.accordion-content');
                        // content.style.maxHeight = null; // Handled by CSS
                    }
                });

                // Toggle current item
                item.classList.toggle('open');
            });
        });
    });

    // 2. Smooth Scroll Logic
    const navButtons = document.querySelectorAll('a[href^="#"]');

    navButtons.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
