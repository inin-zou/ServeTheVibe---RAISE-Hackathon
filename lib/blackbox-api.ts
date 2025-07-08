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

export async function generateAIResponse(userMessage: string, context?: string): Promise<string> {
  const API_URL = "https://api.blackbox.ai/chat/completions"
  const API_KEY = "sk-jiRlzjnwD8-xyslAX0dvXA"

  const systemPrompt = `You are a music AI assistant specialized in Strudel live coding and music generation. 

Your role:
- Help users create music with Strudel Mini notation
- Suggest musical patterns, rhythms, and melodies
- Explain music theory concepts simply
- Generate Strudel code examples
- Be encouraging and creative with music suggestions

Strudel Mini examples you can suggest:
- Drums: "bd sd bd sd" (kick, snare pattern)
- Bass: "c2 f2 g2 c2" (bass line)
- Melody: "c4 e4 g4 c5" (simple melody)
- Complex: "stack(bd sd bd sd, c3 e3 g3 c4)" (layered patterns)

Always respond in a helpful, musical, and encouraging tone. Include relevant Strudel code when appropriate.
${context ? `\n\nContext: ${context}` : ""}`

  const messages: BlackboxMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userMessage,
    },
  ]

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "blackboxai/openai/gpt-4",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data: BlackboxResponse = await response.json()

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content
    } else {
      throw new Error("No response from AI")
    }
  } catch (error) {
    console.error("Blackbox AI API error:", error)
    return "Sorry, I can't respond right now. Please try again later, or try some Strudel code directly in the editor!"
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

// Generate context for AI based on recent messages
export function generateContextFromMessages(messages: any[]): string {
  const recentMessages = messages.slice(-3) // Last 3 messages
  const context = recentMessages.map((msg) => `${msg.type}: ${msg.content}`).join("\n")

  return context
}
