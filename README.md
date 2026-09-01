# rotacion-parejas-mcp

Servidor MCP (stdio) que genera la rotación semanal de parejas. Los participantes
se configuran por argumentos o variable de entorno, y se pueden cambiar en cada
llamada, sin tocar código.

## Instalación

Solo necesitas Node >= 18. `npx` descarga el paquete la primera vez y lo cachea.
Los participantes van como argumentos (sueltos o separados por comas); si no
pasas ninguno se usa `ROTACION_PARTICIPANTES` y, en su defecto, `Fran,Xabi,Dani`.

### Claude Code

```bash
claude mcp add rotacion-parejas -- npx -y github:pg-motocard/rotacion-parejas-mcp Fran Xabi Dani
```

O a mano en `~/.claude.json`, dentro de `mcpServers`:

```json
"rotacion-parejas": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
}
```

### Claude Desktop

`claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`,
Windows: `%APPDATA%\Claude\`), dentro de `mcpServers`:

```json
"rotacion-parejas": {
  "command": "npx",
  "args": ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
}
```

Reinicia la app después de guardar.

### Cursor

`~/.cursor/mcp.json` (global) o `.cursor/mcp.json` (proyecto), dentro de
`mcpServers`: mismo bloque que Claude Desktop.

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.rotacion-parejas]
command = "npx"
args = ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
```

### Otro cliente MCP

Cualquiera que hable stdio: comando `npx`, argumentos
`-y github:pg-motocard/rotacion-parejas-mcp <nombres>`. Como alternativa a los
argumentos, variable de entorno `ROTACION_PARTICIPANTES="Fran,Xabi,Dani"`.

### En local (desarrollo)

`npm install` una vez en el repo y apunta al fichero:

```json
"command": "node",
"args": ["/ruta/a/rotacion-parejas-mcp/index.js", "Fran", "Xabi", "Dani"]
```

## Uso

Herramienta `rotacion_parejas(persona1, persona2, participantes?)`:

- `persona1` y `persona2`: la pareja de la semana actual. Si una va en
  MAYÚSCULAS, esa persona repite la semana 2 con otra distinta.
- `participantes` (opcional): lista separada por comas para *esa* llamada, sin
  tocar la configuración. Útil para meter a alguien puntualmente:
  `participantes: "Fran,Xabi,Dani,Laura"`.

Mínimo 3 nombres y sin duplicados, tanto en la configuración (si no, el
servidor no arranca) como en el parámetro (si no, la llamada devuelve el error).

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
