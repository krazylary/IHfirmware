// background/orchestrator.js

export function parseOrchestratorResponse(text) {
  const startMarker = 'BEGIN_DEBATE_JSON';
  const endMarker = 'END_DEBATE_JSON';

  const startIndex = text.indexOf(startMarker);
  const endIndex = text.lastIndexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('JSON markers not found in Orchestrator response');
  }

  const jsonString = text.substring(startIndex + startMarker.length, endIndex).trim();

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON Parse Error:', e);
    throw new Error('Invalid JSON content');
  }
}

export function constructParticipantPrompt(template, data) {
  let prompt = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    const replacement = Array.isArray(value) ? value.map(v => `- ${v}`).join('\n') : value;
    prompt = prompt.replace(placeholder, replacement);
  }
  return prompt;
}
