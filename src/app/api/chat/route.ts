// import { NextResponse } from "next/server";

// export const maxDuration = 30;
// export const dynamic = "force-dynamic";

// // Define your hardcoded Q&A
// const hardcodedQA: Record<string, string> = {
//   "what is this product?": "Paris.",
//   "How it actually works?": "As of 2025, it's Joe Biden.",
//   "what is 2 + 2?": "2 + 2 is 4.",
//   "what is the color of the sky?": "The sky is usually blue during the day.",
//   "who created javascript?": "JavaScript was created by Brendan Eich.",
//   "what is react?": "React is a JavaScript library for building user interfaces.",
//   "how to center a div in css?": "Use 'margin: auto' or Flexbox with 'justify-content' and 'align-items'.",
// };

// export async function POST(req: Request) {
//   try {
//     const { messages } = await req.json();

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
//     }

//     const lastUserMessage = messages
//       .filter((msg: any) => msg.role === "user")
//       .pop()?.content.trim().toLowerCase();

//     if (lastUserMessage && hardcodedQA[lastUserMessage]) {
//       return NextResponse.json({
//         role: "assistant",
//         content: hardcodedQA[lastUserMessage],
//       });
//     }

//     // Fallback to AI API
//     const response = await fetch("https://api.together.xyz/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "mistralai/Mistral-7B-Instruct-v0.1",
//         messages,
//         temperature: 0.7,
//         max_tokens: 150,
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       console.error("Together.ai error:", error);
//       return NextResponse.json({ error: "AI model failed to respond." }, { status: response.status });
//     }

//     const data = await response.json();
//     const reply = data.choices?.[0]?.message?.content?.trim() || "No response";

//     return NextResponse.json({ role: "assistant", content: reply });

//   } catch (error) {
//     console.error("Chat API error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

// Define your hardcoded WMS Q&A
const hardcodedQA: Record<string, string> = {
  "what is wms?": "WMS stands for Warranty Management System, designed to manage warranty claims, trouble tickets, service reporting, and escalations.",
  "how does the trouble ticket system work?": "Users submit product-specific forms for trouble tickets, which are dynamically generated and stored in the database.",
  "what is the oem module responsible for?": "It allows manufacturers to perform L1 claim analysis, approve claims, and monitor reports related to their products.",
  "how are slas monitored in wms?": "The system tracks SLA breaches and highlights them with alerts and color-coded indicators in the dashboard.",
  "how can users submit dynamic forms in wms?": "Admins can add new product forms dynamically and users can submit them via the client dashboard without developer involvement.",
  "what is included in service reporting?": "Service reports include solved/unsolved ticket stats.",
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const lastUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop()?.content.trim().toLowerCase();

    if (lastUserMessage && hardcodedQA[lastUserMessage]) {
      return NextResponse.json({
        role: "assistant",
        content: hardcodedQA[lastUserMessage],
      });
    }

    // Fallback to AI API
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.1",
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Together.ai error:", error);
      return NextResponse.json({ error: "AI model failed to respond." }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "No response";

    return NextResponse.json({ role: "assistant", content: reply });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
