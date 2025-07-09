interface BlackboxMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface BlackboxResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
  }>
}

interface ConversationHistory {
  messages: BlackboxMessage[]
  lastUpdated: number
}

// System prompt for consistent AI behavior
const SYSTEM_PROMPT = `You are a music AI assistant specialized in Strudel live coding and music generation. 

Your role:
- Help users create music with Strudel Mini notation
- Suggest musical patterns, rhythms, and melodies
- Explain music theory concepts simply
- Generate Strudel code examples
- Be encouraging and creative with music suggestions
- Remember previous conversations and build upon them
- Provide context-aware responses based on conversation history

Strudel Mini examples you can suggest:
- Drums: "bd sd bd sd" (kick, snare pattern)
- Bass: "c2 f2 g2 c2" (bass line)
- Melody: "c4 e4 g4 c5" (simple melody)
- Complex: "stack(bd sd bd sd, c3 e3 g3 c4)" (layered patterns)

Always respond in a helpful, musical, and encouraging tone. Include relevant Strudel code when appropriate.
Remember the conversation context and refer to previous exchanges when relevant.`

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: BlackboxMessage[] = [],
): Promise<{ response: string; updatedHistory: BlackboxMessage[] }> {
  const API_URL = "https://api.blackbox.ai/chat/completions"
  const API_KEY = "sk-jiRlzjnwD8-xyslAX0dvXA"

  // Build complete conversation context
  const messages: BlackboxMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ]

  try {
    console.log("Sending conversation to Blackbox AI:", {
      messageCount: messages.length,
      lastUserMessage: userMessage,
      historyLength: conversationHistory.length,
    })

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "blackboxai/openai/gpt-4",
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data: BlackboxResponse = await response.json()

    if (data.choices && data.choices.length > 0) {
      const aiResponse = data.choices[0].message.content

      // Update conversation history with both user message and AI response
      const updatedHistory: BlackboxMessage[] = [
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content: aiResponse,
        },
      ]

      console.log("Blackbox AI response received:", {
        responseLength: aiResponse.length,
        updatedHistoryLength: updatedHistory.length,
      })

      return {
        response: aiResponse,
        updatedHistory: updatedHistory,
      }
    } else {
      throw new Error("No response from AI")
    }
  } catch (error) {
    console.error("Blackbox AI API error:", error)

    // Still update history with user message and error response
    const errorResponse =
      "Sorry, I can't respond right now. Please try again later, or try some Strudel code directly in the editor!"
    const updatedHistory: BlackboxMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
      {
        role: "assistant",
        content: errorResponse,
      },
    ]

    return {
      response: errorResponse,
      updatedHistory: updatedHistory,
    }
  }
}

// Extract Strudel code from AI response
export function extractStrudelCode(aiResponse: string): string | null {
  // Look for code blocks or Strudel patterns in the response
  const codeBlockRegex = /```(?:strudel|javascript|js)?\s*([\s\S]*?)```/i
  const codeMatch = aiResponse.match(codeBlockRegex)

  if (codeMatch) {
    return codeMatch[1].trim()
  }

  // Look for inline code patterns
  const inlinePatterns = [
    /(?:bd|sd|hh|oh|cp|mt|ht|lt|cy|cr|cb|ch|oh|rs|cl|ma|ag|ba|dr|if|jv|pe|ri|ro|ul|ar|br|co|di|ea|fe|ge|ha|ic|ja|ka|la|mi|ne|oc|pa|qu|re|se|ta|ul|vo|wa|xi|yo|zu)/,
    /stack\s*\(/,
    /c[1-8]|d[1-8]|e[1-8]|f[1-8]|g[1-8]|a[1-8]|b[1-8]/,
  ]

  for (const pattern of inlinePatterns) {
    if (pattern.test(aiResponse)) {
      // Try to extract a reasonable Strudel pattern
      const lines = aiResponse.split("\n")
      const strudelLines = lines.filter((line) => pattern.test(line) && !line.includes("//"))

      if (strudelLines.length > 0) {
        return strudelLines.join("\n").trim()
      }
    }
  }

  return null
}

// Helper function to get conversation summary for debugging
export function getConversationSummary(history: BlackboxMessage[]): string {
  const userMessages = history.filter((msg) => msg.role === "user").length
  const assistantMessages = history.filter((msg) => msg.role === "assistant").length
  const totalMessages = history.length

  return `Conversation: ${userMessages} user messages, ${assistantMessages} AI responses (${totalMessages} total)`
}

// Helper function to trim conversation history if it gets too long
export function trimConversationHistory(history: BlackboxMessage[], maxMessages = 20): BlackboxMessage[] {
  if (history.length <= maxMessages) {
    return history
  }

  // Keep the most recent messages, but ensure we maintain user-assistant pairs
  const trimmed = history.slice(-maxMessages)

  // If we start with an assistant message, remove it to maintain proper flow
  if (trimmed.length > 0 && trimmed[0].role === "assistant") {
    return trimmed.slice(1)
  }

  return trimmed
}
