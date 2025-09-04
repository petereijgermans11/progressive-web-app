const emailLink = document.getElementById('emailLink');
const copyEmailBtn = document.getElementById('copyBtn');

copyEmailBtn.addEventListener('click', async () => {
    try {
        const email = emailLink.href.replace('mailto:', '');
        await navigator.clipboard.writeText(email);
        alert('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
});

