#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { generarCalendario, semanasPara, USO_MAX } from "./rotacion.js";

const PARTICIPANTES = (process.env.ROTACION_PARTICIPANTES ?? "Pablo,Fran,Xabi,Dani")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (PARTICIPANTES.length < 3) {
  console.error(
    `ROTACION_PARTICIPANTES necesita al menos 3 nombres separados por comas (hay ${PARTICIPANTES.length}).`
  );
  process.exit(1);
}
if (new Set(PARTICIPANTES.map((p) => p.toLowerCase())).size !== PARTICIPANTES.length) {
  console.error("ROTACION_PARTICIPANTES tiene nombres duplicados.");
  process.exit(1);
}

// Nombre tal y como está configurado, buscando sin distinguir mayúsculas.
const canonico = (nombre) =>
  PARTICIPANTES.find((p) => p.toLowerCase() === nombre.trim().toLowerCase()) ?? null;

const esMayusculas = (nombre) =>
  nombre === nombre.toUpperCase() && nombre !== nombre.toLowerCase();

function lunesDeEstaSemana() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  hoy.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  return hoy;
}

const formatea = (fecha) =>
  [fecha.getDate(), fecha.getMonth() + 1, fecha.getFullYear()]
    .map((n, i) => (i < 2 ? String(n).padStart(2, "0") : n))
    .join("-");

const sumaDias = (fecha, dias) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
};

function rotacion(persona1Raw, persona2Raw) {
  const p1 = canonico(persona1Raw);
  const p2 = canonico(persona2Raw);

  if (!p1 || !p2) {
    return `Error: '${persona1Raw}' o '${persona2Raw}' no es válido. Participantes: ${PARTICIPANTES.join(", ")}`;
  }
  if (p1 === p2) {
    return `Error: la pareja debe ser de dos personas distintas.`;
  }

  let repetidor = null;
  if (esMayusculas(persona1Raw)) repetidor = p1;
  else if (esMayusculas(persona2Raw)) repetidor = p2;

  const resultado = generarCalendario(PARTICIPANTES, p1, p2, repetidor);
  if (!resultado) {
    return "No se encontró un calendario válido con todas las restricciones.";
  }

  const lineas = [];
  if (repetidor) {
    lineas.push(`Nota: ${repetidor} en MAYUSCULAS repite la semana 2 con otra persona.`, "");
  }

  const lunes = lunesDeEstaSemana();
  resultado.calendario.forEach(([a, b], i) => {
    const inicio = sumaDias(lunes, i * 7);
    const fin = sumaDias(inicio, 4);
    lineas.push(`Semana ${i + 1} (${formatea(inicio)} - ${formatea(fin)}): ${a} - ${b}`);
  });

  lineas.push("", "Participaciones totales:");
  for (const persona of PARTICIPANTES) {
    lineas.push(`${persona}: ${resultado.uso[persona]}`);
  }

  return lineas.join("\n");
}

const server = new McpServer({ name: "rotacion-parejas", version: "1.0.0" });

server.registerTool(
  "rotacion_parejas",
  {
    description:
      `Genera la rotación semanal de parejas (${semanasPara(PARTICIPANTES)} semanas, ${USO_MAX} apariciones por persona). ` +
      `Úsalo cuando el usuario pregunte quién va la semana siguiente a partir de una pareja dada (dos de ${PARTICIPANTES.join("/")}). ` +
      `Si una persona va en MAYUSCULAS, esa persona repite la semana 2.`,
    inputSchema: {
      persona1: z
        .string()
        .describe("Primera persona de la pareja actual (en MAYUSCULAS fuerza repeticion)"),
      persona2: z
        .string()
        .describe("Segunda persona de la pareja actual (en MAYUSCULAS fuerza repeticion)")
    }
  },
  async ({ persona1, persona2 }) => ({
    content: [{ type: "text", text: rotacion(persona1, persona2) }]
  })
);

console.error(`Starting server... participantes: ${PARTICIPANTES.join(", ")}`);
await server.connect(new StdioServerTransport());
