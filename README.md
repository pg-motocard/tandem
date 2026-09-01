# rotacion-parejas-mcp

Servidor MCP (stdio) que genera la rotación semanal de parejas. Los participantes
se configuran por variable de entorno, sin tocar código.

## Registro en Claude Code

Sin instalar nada: en `~/.claude.json` (o donde registres tus servidores MCP),

```json
"rotacion-parejas": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "github:motocard/rotacion-parejas-mcp"],
  "env": { "ROTACION_PARTICIPANTES": "Pablo,Fran,Xabi,Dani" }
}
```

`npx` descarga el paquete y sus dependencias la primera vez y luego lo cachea.
Solo necesitas Node >= 18.

Para desarrollar en local, apunta directamente al fichero:

```json
"args": ["/ruta/a/rotacion-parejas-mcp/index.js"], "command": "node"
```

(en ese caso, `npm install` una vez en el repo).

`ROTACION_PARTICIPANTES`: nombres separados por comas. Si no se define, usa
`Pablo,Fran,Xabi,Dani`. Mínimo 3 nombres y sin duplicados; si no, el servidor
no arranca.

## Uso

Herramienta `rotacion_parejas(persona1, persona2)`: `persona1` y `persona2` son
la pareja de la semana actual. Si una va en MAYÚSCULAS, esa persona repite la
semana 2 con otra distinta.

## Reglas de rotación

Con N participantes:

- El calendario tiene `2N` semanas y cada persona aparece 4 veces.
- La semana 1 es la pareja indicada.
- Carry-over exacto: 1 persona de la semana anterior continúa en la siguiente
  (por tanto nunca se repite la misma pareja dos semanas seguidas).
- Nadie aparece 3 semanas seguidas.
- Las fechas parten del lunes de la semana actual.

La búsqueda usa aleatoriedad, así que dos llamadas con los mismos argumentos
pueden dar calendarios distintos (ambos válidos).

## Tests

```bash
npm test
```

Comprueba las invariantes del calendario (semanas, apariciones, carry-over,
3 semanas seguidas, repetidor) con 3, 4 y 5 participantes.
