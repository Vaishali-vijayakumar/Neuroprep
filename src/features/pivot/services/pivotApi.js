/**
 * pivotApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Frontend client service for Pivot: Evidence-Grounded Placement Recovery RAG.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8000';

export async function sendPivotMessage({ message, conversation_id = null, history = [], preferred_support = null }) {
  const cleanMessage = (message || '').trim();
  if (!cleanMessage) {
    throw new Error('Please enter a message.');
  }

  const payload = {
    message: cleanMessage,
    conversation_id,
    history: history.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    })),
    preferred_support
  };

  const response = await fetch(`${API_BASE_URL}/api/pivot/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Pivot could not respond. Please try again.');
  }

  return response.json();
}

export async function clearPivotConversation(conversation_id) {
  if (!conversation_id) return { success: true };
  try {
    const response = await fetch(`${API_BASE_URL}/api/pivot/conversation/${conversation_id}`, {
      method: 'DELETE',
    });
    return response.json();
  } catch (err) {
    console.warn('[PivotApi] Clear conversation warning:', err);
    return { success: false };
  }
}

export async function getPivotCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pivot/categories`);
    if (response.ok) return response.json();
  } catch (err) {
    console.warn('[PivotApi] Categories fetch warning:', err);
  }
  return { categories: [] };
}
