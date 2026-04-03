import { tool } from "ai";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const readData = tool({
  description: "Execute SELECT queries against the Neon database. Only allows reading data.",
  inputSchema: z.object({
    query: z.string().describe("The SQL SELECT query to execute."),
  }),
  execute: async ({ query }) => {
    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return { error: "Only SELECT queries are allowed in the readData tool." };
    }
    try {
      const result = await sql([query] as unknown as TemplateStringsArray);
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  },
});

export const writeData = tool({
  description: "Execute INSERT, UPDATE, or DELETE queries against the Neon database. Does not allow DROP, CREATE, or ALTER.",
  inputSchema: z.object({
    query: z.string().describe("The SQL INSERT, UPDATE, or DELETE query to execute."),
  }),
  execute: async ({ query }) => {
    const upperQuery = query.trim().toUpperCase();
    if (!upperQuery.startsWith("INSERT") && !upperQuery.startsWith("UPDATE") && !upperQuery.startsWith("DELETE")) {
      return { error: "Only INSERT, UPDATE, or DELETE queries are allowed in the writeData tool." };
    }
    if (upperQuery.includes("DROP ") || upperQuery.includes("ALTER ") || upperQuery.includes("CREATE ") || upperQuery.includes("TRUNCATE ")) {
      return { error: "DDL operations (DROP, ALTER, CREATE) are forbidden in the writeData tool." };
    }
    try {
      const result = await sql([query] as unknown as TemplateStringsArray);
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  },
});

