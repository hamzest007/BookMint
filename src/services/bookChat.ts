import { generateWithGemini, hasGeminiKey } from './gemini';
import { apiService } from './api';

export type ChatScope = 'chapter' | 'previous' | 'book';
export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; isSpoiler?: boolean };

type BookChatRequest = {
  title: string;
  description?: string;
  chapterLabel: string;
  scope: ChatScope;
  spoilerFree: boolean;
  context: string;
  messages: ChatMessage[];
  question: string;
};

const scopeLabel: Record<ChatScope, string> = {
  chapter: 'the current chapter only',
  previous: 'the current chapter and earlier chapters only',
  book: 'the full book',
};

export const askBookAssistant = async ({ title, description, chapterLabel, scope, spoilerFree, context, messages, question }: BookChatRequest) => {
  if (!context.trim()) {
    return "I couldn't find readable text for this part of the book. Import a text-based book or open a chapter with readable content first.";
  }

  // Try backend API first
  try {
    const response = await apiService.post('/ai/chat', {
      message: question,
      bookContext: {
        title,
        description,
        currentChapter: chapterLabel,
        content: context
      },
      scope,
      allowSpoilers: !spoilerFree
    });
    return response.response;
  } catch (error) {
    console.log('Backend AI failed, falling back to direct Gemini:', error);

    // Fallback to direct Gemini call
    if (!hasGeminiKey()) {
      return answerOfflineBookQuestion(context, question, chapterLabel);
    }

    const recentConversation = messages.slice(-8).map(message => `${message.role === 'user' ? 'Reader' : 'Assistant'}: ${message.text}`).join('\n');
    const systemInstruction = `You are BookMint's careful AI reading companion. Answer only from the supplied book context. Never invent names, events, quotes, motivations, or facts. If the answer is absent, say exactly: "I couldn't find this information in the book." Be clear, natural, concise by default, and use simple language when asked. The reader is currently at ${chapterLabel}. Your allowed scope is ${scopeLabel[scope]}. ${spoilerFree ? 'SPOILER-FREE MODE IS ON: do not mention, hint at, or infer anything beyond the supplied context. If the reader asks about later events, say exactly: "Iska answer aage ke chapters mein reveal hota hai. Kya aap spoiler dekhna chahte hain?"' : 'Spoilers are allowed. Clearly begin any answer relying on later events with "⚠️ Spoiler:".'}`;
    const prompt = `BOOK TITLE: ${title}\nBOOK DESCRIPTION: ${description || 'Not available'}\n\nALLOWED BOOK PASSAGES:\n${context}\n\nRECENT CONVERSATION:\n${recentConversation || 'No previous messages.'}\n\nREADER QUESTION: ${question}`;
    return generateWithGemini(prompt, systemInstruction);
  }
};

const cleanPassage = (text: string) => text.replace(/\s+/g, ' ').trim();
const sentencesFrom = (text: string) => cleanPassage(text)
  .split(/(?<=[.!?])\s+/)
  .map(sentence => sentence.trim())
  .filter(sentence => sentence.length > 18);

const shortList = (items: string[], max = 3) => items.slice(0, max).map(item => `• ${item}`).join('\n');

const findCharacters = (text: string) => {
  const matches = cleanPassage(text).match(/\b[A-Z][a-z]{2,}\b/g) || [];
  const ignored = new Set(['The', 'This', 'That', 'With', 'When', 'What', 'There', 'Chapter', 'Book', 'Page', 'After', 'Before', 'Then', 'And', 'But', 'For', 'From', 'His', 'Her', 'She', 'He', 'They', 'You', 'I']);
  const counts = matches.reduce<Record<string, number>>((all, name) => {
    if (!ignored.has(name)) all[name] = (all[name] || 0) + 1;
    return all;
  }, {});
  return Object.entries(counts).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]).map(([name]) => name).slice(0, 8);
};

const relevantSentences = (sentences: string[], question: string) => {
  const keywords = question.toLowerCase().match(/[a-z]{3,}/g) || [];
  const ignored = new Set(['this', 'that', 'with', 'what', 'when', 'why', 'who', 'chapter', 'book', 'simple', 'explain', 'about', 'mein', 'kya', 'hai', 'aur', 'the', 'and', 'for']);
  const useful = keywords.filter(word => !ignored.has(word));
  return sentences
    .map(sentence => ({ sentence, score: useful.reduce((score, word) => score + (sentence.toLowerCase().includes(word) ? 1 : 0), 0) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.sentence);
};

/**
 * A private, offline fallback for readers who have not configured Gemini.
 * It only selects and rearranges exact sentences from supplied book text.
 */
export const answerOfflineBookQuestion = (context: string, question: string, chapterLabel: string) => {
  const sentences = sentencesFrom(context);
  if (!sentences.length) return "I couldn't find this information in the book.";
  const normalized = question.toLowerCase();
  const characters = findCharacters(context);
  const matching = relevantSentences(sentences, question);
  const summary = sentences.slice(0, 3);

  if (/character|characters|kaun hai|who is|villain/.test(normalized)) {
    if (!characters.length) return "I couldn't find this information in the book.";
    return `Based on ${chapterLabel}, the names that appear most in the available text are: ${characters.join(', ')}.\n\n${shortList(matching.length ? matching : summary, 2)}`;
  }
  if (/quote|quotes|citation/.test(normalized)) {
    const quotes = sentences.filter(sentence => /[“”"']/.test(sentence));
    return quotes.length ? `Important lines from ${chapterLabel}:\n${shortList(quotes, 3)}` : "I couldn't find this information in the book.";
  }
  if (/why|kyun|aisa|decision|goal|want|motive/.test(normalized)) {
    const reasons = sentences.filter(sentence => /\b(because|so that|therefore|decided|wanted|needed|felt|chose|reason)\b/i.test(sentence));
    const evidence = matching.length ? matching : reasons;
    if (!evidence.length) return "I couldn't find this information in the book.";
    return `The book gives this context:\n${shortList(evidence, 3)}\n\nThis is based only on the available passage, so it does not assume anything not stated in the book.`;
  }
  if (/key event|important point|points|kya hua|what happened|summary|summarize|simple|explain|samjha/.test(normalized)) {
    const evidence = matching.length >= 2 ? matching : summary;
    return `${chapterLabel} in simple words:\n${shortList(evidence, 3)}`;
  }
  if (matching.length) return `Here is what the book says:\n${shortList(matching, 3)}`;
  return `${chapterLabel} covers:\n${shortList(summary, 3)}`;
};
