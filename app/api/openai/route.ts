import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, currentTodos } = await request.json(); // Catch the current list

    const systemPrompt = `
    You are the "System Architect" for a smart To-Do list. 
    The user will provide a command, and you must translate it into a structured list update.

    ### CURRENT DATA STATE:
    ${JSON.stringify(currentTodos)}

    ### THE GOLDEN RULE:
    - NEVER delete an item unless the user explicitly asks to "remove", "delete", or "clear".
    - When adding a task, you MUST take the CURRENT DATA STATE and APPEND the new task to it.
    - Your output 'newList' must contain ALL previous items PLUS the new ones.

    ### OPERATIONAL RULES:
    1. IDENTIFY INTENT: Determine if the user wants to ADD, REMOVE, TOGGLE (check/uncheck), or EDIT a task.
    2. REFERENCE BY CONTEXT: 
      - "First", "Top", "Number 1" refers to index 0.
      - "Last", "Bottom" refers to the final index.
      - If they name a task (e.g., "Buy milk"), find the item with that exact or similar text.
    3. ID MANAGEMENT: 
      - When ADDING: Generate a unique ID using the current timestamp: ${Date.now()}.
      - When REMOVING/EDITING: Preserve the existing IDs of all other items.
    4. CALCULATE NEW STATE:
      - You must perform the logic (filter, map, or push) on the CURRENT DATA STATE provided above.
      - You must return the ENTIRE resulting array, not just the change.
    5. MANDATORY TOOL CALL: 
      - If the list changes in ANY way, you MUST call 'update_todo_list'.
      - In the 'response' field, give a short, punchy confirmation (e.g., "Task removed!").

    ### EXAMPLES:
    - User: "Delete the second one" -> Filter out the item at index 1 -> Call tool with the new array.
    - User: "I finished the milk task" -> Find "milk", set completed: true -> Call tool.
    - User: "Clear everything" -> Call tool with an empty array [].
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Better & cheaper than 3.5-turbo
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "update_todo_list",
            description: "Update the user's todo list",
            parameters: {
              type: "object",
              properties: {
                newList: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      text: { type: "string" },
                      completed: { type: "boolean" },
                    },
                  },
                },
              },
              required: ["newList"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const aiMessage = completion.choices[0].message;

    // Check if the AI decided to update the list
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      // Use 'as' to tell TypeScript exactly what this is
      const toolCall = aiMessage.tool_calls[0] as any;

      // Now 'function' will definitely be recognized
      const args = JSON.parse(toolCall.function.arguments);
      const newList = args.newList;

      return NextResponse.json({
        response: "I've updated your list!",
        updatedTodos: newList,
      });
    }

    // If no tool was called, just return the text
    return NextResponse.json({
      response: aiMessage.content,
    });
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
