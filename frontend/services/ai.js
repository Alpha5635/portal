(function () {
  const client = window.portalApiClient;

  window.portalAiApi = {
    ask(prompt) {
      if (!prompt || !prompt.trim()) {
        return Promise.reject(new Error('Please enter a question before sending.'));
      }
      return client.post('/api/ai/ask', { prompt: prompt.trim() });
    },
    analyzeResume(resumeText) {
      if (!resumeText || !resumeText.trim()) {
        return Promise.reject(new Error('Please provide your resume content or profile text to analyze.'));
      }
      return client.post('/api/ai/resume-analyze', { resumeText: resumeText.trim() });
    },
    suggestOpportunities(params = {}) {
      return client.post('/api/ai/suggest-opportunities', params);
    }
  };
})();
