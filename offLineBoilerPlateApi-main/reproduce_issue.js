require('rootpath')();
const aiProvider = require('./_helpers/ai-provider');

async function test() {
    console.log('Testing AI Provider...');
    console.log('Provider configured:', aiProvider.provider);
    console.log('API Key present:', aiProvider.isConfigured());

    try {
        const response = await aiProvider.generateResponse([
            { role: 'user', content: 'Hello, are you working?' }
        ]);
        console.log('Response:', response);
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
