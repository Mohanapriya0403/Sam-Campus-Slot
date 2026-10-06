import { Router } from 'express';
import User from '../models/User.js';
import Classroom from '../models/Classroom.js';
import { requireAuth } from '../middleware/auth.js';
import {
  classifyIntent,
  handleGeneralConversation,
  handleCampusQuery,
} from '../services/chatbot.service.js';

const router = Router();

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

// POST /api/chatbot and POST /api/chatbot/message
async function handleChat(req, res) {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'message is required.' });
    }

    const trimmedMsg = message.trim();

    // 1. Retrieve authenticated user context from database
    const doc = await User.findById(req.auth.id);
    const user = {
      id: req.auth.id,
      name: doc?.name || 'Campus Member',
      role: doc?.role || req.auth.role || 'student',
      department: doc?.department || 'CSE',
      year: doc?.year || 'III Year',
    };

    // 2. Intent Classification Layer
    const intent = classifyIntent(trimmedMsg, history);

    // 3. Category A: General Conversation (Bypasses database search entirely!)
    const generalReply = handleGeneralConversation(intent, trimmedMsg, user);
    if (generalReply) {
      return res.json({
        success: true,
        intent,
        reply: generalReply,
        message: generalReply,
        data: null,
      });
    }

    // 4. Category B: Campus-Related Queries (Grounded in MongoDB)
    if (intent !== 'CAMPUS_UNKNOWN') {
      const campusResult = await handleCampusQuery(intent, trimmedMsg, user, history);
      return res.json({
        success: true,
        intent,
        reply: campusResult.message,
        message: campusResult.message,
        data: campusResult.data,
      });
    }

    // 5. If LLM is configured, ground query with live campus context
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const rooms = await Classroom.find({ department: user.department });
        const availableCount = rooms.filter((r) => r.status === 'available').length;
        const smartCount = rooms.filter((r) => r.smart).length;

        const systemPrompt = `You are the SAM CAMPUS SLOT Assistant, an intelligent campus guide for college students and faculty.
Signed-in user: ${user.name} (${user.role}), Department: ${user.department}, Year: ${user.year}.
Today is Monday, 17 August 2026.
Campus status: ${rooms.length} total ${user.department} rooms, ${availableCount} available, ${smartCount} smart classrooms.
Keep answers conversational, concise (2-3 sentences), and friendly. Never invent fictitious room numbers or timetable bookings.`;

        const cleanHistory = Array.isArray(history)
          ? history
              .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
              .slice(-6)
              .map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) }))
          : [];

        const apiRes = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 300,
            system: systemPrompt,
            messages: [...cleanHistory, { role: 'user', content: trimmedMsg }],
          }),
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const reply = (data.content || [])
            .filter((b) => b.type === 'text')
            .map((b) => b.text)
            .join('\n')
            .trim();
          if (reply) {
            return res.json({
              success: true,
              intent: 'LLM_ASSISTED',
              reply,
              message: reply,
              data: null,
            });
          }
        }
      } catch (err) {
        console.warn('Anthropic API call failed:', err.message);
      }
    }

    // 6. Helpful fallback when no specific match is found in database
    const fallbackMsg = `I couldn't find matching campus records for that request in the ${user.department} database. You can try asking about your next class, available classrooms at 2 PM, smart classrooms, or venue changes!`;
    return res.json({
      success: true,
      intent: 'CAMPUS_UNKNOWN',
      reply: fallbackMsg,
      message: fallbackMsg,
      data: null,
    });
  } catch (err) {
    console.error('Chatbot route error:', err);
    return res.status(500).json({
      success: false,
      error: "I'm having trouble connecting to the campus system right now. Please try again.",
    });
  }
}

router.post('/', requireAuth, handleChat);
router.post('/message', requireAuth, handleChat);

export default router;
