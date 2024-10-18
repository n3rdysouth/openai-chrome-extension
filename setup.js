document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('save').addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value;
        if (!apiKey) {
            alert('Please enter your API key.');
            return;
        }

        // Test the API key
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (response.ok) {
                // Store the API key in local storage
                chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
                    alert('API key saved successfully!');
                    chrome.action.setPopup({ popup: 'popup.html' });
                    window.location.href = 'popup.html';
                });
            } else {
                alert('Invalid API key. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error validating API key. Please try again.');
        }
    });
});