export interface Citation {
  text: string;
  citation: string;
}

export function cleanBotResponse(text: string): string {
  if (!text) return '';
  if (typeof text === 'string' && !text.includes('{') && !text.includes('"answer"')) {
    return text.trim();
  }
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.answer === 'string') {
      return parsed.answer;
    }
  } catch {}
  let cleanText = text;
  const jsonMatch = cleanText.match(/^\s*{\s*"answer":\s*"(.*?)",?\s*"citations":\s*\[[\s\S]*?\]\s*}\s*$/);
  if (jsonMatch) {
    cleanText = jsonMatch[1];
  } else {
    const answerMatch = cleanText.match(/"answer":\s*"(.*?)"(?:,\s*"citations":|$)/);
    if (answerMatch) {
      cleanText = answerMatch[1];
    }
  }
  cleanText = cleanText
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .trim();
  return cleanText;
}

export function cleanCitationText(text: string): string {
  return text ? text.trim() : '';
}

export function cleanCitationSource(citation: string): string {
  if (!citation) return '';

  // Return early for HTTP links
  if (citation.startsWith('http')) {
    return citation;
  }

  // Updated regex to find a filename and page number within the string,
  // ignoring potential surrounding OCR artifacts.
  const match = citation.match(/([\w-]+\.(?:pdf|png|jpe?g))\s+p\.(\d+)/i);

  // If a match is found, reconstruct the clean source string.
  // match[1] captures the filename (e.g., "indus-report-3.pdf")
  // match[2] captures the page number (e.g., "7")
  if (match) {
    return `${match[1]} p.${match[2]}`;
  }

  // If no match, return the original citation as a fallback.
  return citation;
}