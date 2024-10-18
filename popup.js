document.addEventListener('DOMContentLoaded', async (event) => {
  const sendButton = document.getElementById('send');
  const copyButton = document.getElementById('copyResponse');

  // Retrieve the API key from local storage
  chrome.storage.local.get('openaiApiKey', (result) => {
    if (result.openaiApiKey) {
      const apiKey = result.openaiApiKey;

      sendButton.addEventListener('click', async () => {
        const prompt = document.getElementById('prompt').value;
        if (!prompt) {
          alert('Please enter a prompt.');
          return;
        }

        sendButton.disabled = true;  // Disable the button
        sendButton.textContent = 'Please Wait...';  // Update button text

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          const data = await response.json();
          const responseTextArea = document.getElementById('response');

          if (data.choices && data.choices.length > 0) {
            const responseText = data.choices[0].message.content;
            responseTextArea.value = responseText;

            // Switch to response tab using Bootstrap's Tab API
            const responseTab = new bootstrap.Tab(document.querySelector('#response-tab'));
            responseTab.show();
          } else {
            console.error('No response from OpenAI');
            responseTextArea.value = 'No response from OpenAI';
          }

        } catch (error) {
          console.error('Error:', error);
          document.getElementById('response').value = 'Error fetching response from OpenAI';
        } finally {
          sendButton.disabled = false;  // Re-enable the button
          sendButton.textContent = 'Send to OpenAI';  // Reset button text
        }
      });

      copyButton.addEventListener('click', () => {
        const responseTextArea = document.getElementById('response');
        responseTextArea.select();
        document.execCommand('copy');

        // Change button text to "Copied!" and revert back after 1 second
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy to Clipboard';
        }, 1000);
      });

    } else {
      // Redirect to setup page if API key is not found
      window.location.href = 'setup.html';
    }
  });
});