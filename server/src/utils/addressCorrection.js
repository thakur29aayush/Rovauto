const Groq = require("groq-sdk");
const ApiError = require("./apiError");

let groq = null;
const GROQ_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS || 12000);

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(500, "Groq API not configured");
  }

  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groq;
};

/**
 * Uses Groq AI to correct/normalize an address
 * Handles typos, incomplete addresses, and alternate names
 */
const correctAddress = async (address, city, state) => {
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(500, "Groq API not configured");
  }

  try {
    const completion = await Promise.race([
      getGroqClient().chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        max_tokens: 150,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: "Return only a corrected Indian address or UNABLE_TO_CORRECT.",
          },
          {
            role: "user",
            content: `You are an address correction assistant. Given an incomplete, misspelled, or informal address, provide the corrected full address in India.

Input address: ${address}
City: ${city}
State: ${state}

Rules:
1. Correct common typos and spelling mistakes
2. Expand abbreviations and informal names
3. Include proper city and state names
4. Return ONLY the corrected address, nothing else
5. If you cannot determine a valid location, respond with "UNABLE_TO_CORRECT"

Corrected address:`,
          },
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Groq address correction timed out")), GROQ_TIMEOUT_MS)
      ),
    ]);

    const correctedAddress = completion.choices?.[0]?.message?.content?.trim() || "";

    if (correctedAddress === "UNABLE_TO_CORRECT" || !correctedAddress) {
      throw new ApiError(404, "Could not correct this address");
    }

    return correctedAddress;
  } catch (error) {
    if (error.status === 404) throw error;
    
    console.error("Groq address correction error:", error.message);
    throw new ApiError(500, "Address correction service unavailable");
  }
};

module.exports = {
  correctAddress,
};
