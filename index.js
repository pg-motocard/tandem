#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { buildCalendar, weeksFor, MAX_SHIFTS } from "./rotation.js";

// Default roster: command line arguments, then the environment variable, then
// the usual suspects. Commas and spaces both work, mix them if you like.
// Every call can override it through the `participants` parameter.
const SOURCE = process.argv.length > 2 ? "the arguments" : "ROTATION_PARTICIPANTS";

// Returns the clean list, or throws with the reason it is no good.
function parse(text, source) {
  const names = text.split(",").map((s) => s.trim()).filter(Boolean);
  if (names.length < 3) {
    throw new Error(`At least 3 names are needed in ${source} (got ${names.length}).`);
  }
  if (new Set(names.map((p) => p.toLowerCase())).size !== names.length) {
    throw new Error(`There are duplicate names in ${source}.`);
  }
  return names;
}

let PARTICIPANTS;
try {
  PARTICIPANTS = parse(
    process.argv.length > 2
      ? process.argv.slice(2).join(",")
      : process.env.ROTATION_PARTICIPANTS ?? "Fran,Xabi,Dani",
    SOURCE
  );
} catch (e) {
  console.error(e.message);
  console.error("Example: npx tandem Fran Xabi Dani");
  process.exit(1);
}

// The name as configured, matched without caring about case.
const canonical = (participants, name) =>
  participants.find((p) => p.toLowerCase() === name.trim().toLowerCase()) ?? null;

const isShouted = (name) =>
  name === name.toUpperCase() && name !== name.toLowerCase();

function mondayOfThisWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return today;
}

const format = (date) =>
  [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map((n, i) => (i < 2 ? String(n).padStart(2, "0") : n))
    .join("-");

const addDays = (date, days) => {
  const moved = new Date(date);
  moved.setDate(moved.getDate() + days);
  return moved;
};

function rotation(person1Raw, person2Raw, participantsRaw) {
  let participants = PARTICIPANTS;
  if (participantsRaw) {
    try {
      participants = parse(participantsRaw, "participants");
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }

  const p1 = canonical(participants, person1Raw);
  const p2 = canonical(participants, person2Raw);

  if (!p1 || !p2) {
    return `Error: '${person1Raw}' or '${person2Raw}' is not valid. Participants: ${participants.join(", ")}`;
  }
  if (p1 === p2) {
    return `Error: a pair is two different people.`;
  }

  let repeater = null;
  if (isShouted(person1Raw)) repeater = p1;
  else if (isShouted(person2Raw)) repeater = p2;

  const result = buildCalendar(participants, p1, p2, repeater);
  if (!result) {
    return "No calendar satisfies every constraint.";
  }

  const lines = [];
  const monday = mondayOfThisWeek();
  result.calendar.forEach(([a, b], i) => {
    const start = addDays(monday, i * 7);
    const end = addDays(start, 4);
    lines.push(`Semana ${i + 1} (${format(start)} - ${format(end)}): ${a} - ${b}`);
  });

  return lines.join("\n");
}

const server = new McpServer({ name: "tandem", version: "1.0.0" });

server.registerTool(
  "pair_rotation",
  {
    description:
      `Builds the weekly pair rotation (${weeksFor(PARTICIPANTS)} weeks, ${MAX_SHIFTS} shifts per person). ` +
      `Use it when the user asks who is on next week given the current pair (two of ${PARTICIPANTS.join("/")}). ` +
      `A person written in CAPS stays on for week 2. ` +
      `Pass 'participants' to use a different roster for this call only.`,
    inputSchema: {
      person1: z
        .string()
        .describe("First person of the current pair (CAPS forces a repeat)"),
      person2: z
        .string()
        .describe("Second person of the current pair (CAPS forces a repeat)"),
      participants: z
        .string()
        .optional()
        .describe(
          `Comma-separated roster for this call. Defaults to: ${PARTICIPANTS.join(", ")}`
        )
    }
  },
  async ({ person1, person2, participants }) => ({
    content: [{ type: "text", text: rotation(person1, person2, participants) }]
  })
);

console.error(`Starting server... participants: ${PARTICIPANTS.join(", ")}`);
await server.connect(new StdioServerTransport());
