document.addEventListener('DOMContentLoaded', async (event) => {
    const generateMetaButton = document.getElementById('generateMeta');
    const copyMetaButton = document.getElementById('copyMeta');
    const metaDescriptionTextarea = document.getElementById('metaDescription');

    async function getMetaDescription(content) {
        try {
            const apiKey = await new Promise((resolve) => {
                chrome.storage.local.get('openaiApiKey', (result) => {
                    resolve(result.openaiApiKey);
                });
            });

            if (!apiKey) {
                alert('API key is missing');
                return;
            }

            const prompt = `Generate a meta description for the following content: ${content}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            return data.choices[0].message.content;

        } catch (error) {
            console.error("Error in getMetaDescription:", error);
        }
    }

    generateMetaButton.addEventListener('click', async () => {
        generateMetaButton.disabled = true;
        generateMetaButton.textContent = 'Generating...';

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (!tabs || !tabs.length) {
                console.error("No active tabs found");
                alert("No active tab found.");
                generateMetaButton.disabled = false;
                generateMetaButton.textContent = 'Generate Meta Description';
                return;
            }

            const tab = tabs[0];

            if (tab.url.startsWith('chrome://')) {
                console.error("Cannot access a chrome:// URL");
                alert('Cannot access content of chrome:// pages');
                generateMetaButton.disabled = false;
                generateMetaButton.textContent = 'Generate Meta Description';
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText
            }, async (results) => {
                if (chrome.runtime.lastError) {
                    console.error('chrome.runtime.lastError:', chrome.runtime.lastError);
                    alert('Failed to retrieve page content. Error: ' + chrome.runtime.lastError.message);
                    generateMetaButton.disabled = false;
                    generateMetaButton.textContent = 'Generate Meta Description';
                    return;
                }

                if (!results || !results[0]) {
                    console.error('Script execution returned no results');
                    alert('Failed to retrieve page content');
                    generateMetaButton.disabled = false;
                    generateMetaButton.textContent = 'Generate Meta Description';
                    return;
                }

                const pageContent = results[0].result;

                try {
                    const metaDescription = await getMetaDescription(pageContent);
                    metaDescriptionTextarea.value = metaDescription || 'No meta description generated.';
                } catch (error) {
                    console.error('Error:', error);
                    metaDescriptionTextarea.value = 'Error generating meta description';
                } finally {
                    generateMetaButton.disabled = false;
                    generateMetaButton.textContent = 'Generate Meta Description';
                }
            });
        });
    });

    copyMetaButton.addEventListener('click', () => {
        metaDescriptionTextarea.select();
        document.execCommand('copy');

        const originalText = copyMetaButton.textContent;
        copyMetaButton.textContent = 'Copied!';
        setTimeout(() => {
            copyMetaButton.textContent = originalText;
        }, 1000);
    });
});