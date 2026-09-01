# rotacion-parejas-mcp

Somebody has to be on duty this week, and next week, and the week after that.
Left to a group chat, that argument runs forever. This is a stdio MCP server
that settles it: give it this week's pair, get back the whole calendar.

No database, no config file, no cron. Names go in as arguments, the rotation
comes out. That's the entire product.

## Install

Node >= 18 is all you need. `npx` fetches the package the first time and caches
it. Participants are plain arguments (spaces or commas, your call); with none,
it falls back to `ROTATION_PARTICIPANTS`, and then to `Fran,Xabi,Dani`.

### Claude Code

```bash
claude mcp add -s user rotacion-parejas -- npx -y github:pg-motocard/rotacion-parejas-mcp Fran Xabi Dani
```

`-s user` makes it available from any directory. Drop the flag and the scope is
`local`, meaning it only exists inside the folder you ran the command from.

Or by hand in `~/.claude.json`, under the top-level `mcpServers` (the one nested
inside `projects` is the local scope):

```json
"rotacion-parejas": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
}
```

### Claude Desktop

`claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`,
Windows: `%APPDATA%\Claude\`), under `mcpServers`:

```json
"rotacion-parejas": {
  "command": "npx",
  "args": ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
}
```

Restart the app after saving.

### Cursor

`~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project), under
`mcpServers`:

```json
"rotacion-parejas": {
  "command": "npx",
  "args": ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
}
```

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.rotacion-parejas]
command = "npx"
args = ["-y", "github:pg-motocard/rotacion-parejas-mcp", "Fran", "Xabi", "Dani"]
```

### Any other MCP client

If it speaks stdio, it works: command `npx`, arguments
`-y github:pg-motocard/rotacion-parejas-mcp <names>`. Instead of arguments you
can set `ROTATION_PARTICIPANTS="Fran,Xabi,Dani"`.

### Local development

`npm install` once in the repo, then point the client at the file:

```json
"command": "node",
"args": ["/path/to/rotacion-parejas-mcp/index.js", "Fran", "Xabi", "Dani"]
```

## Usage

One tool, `pair_rotation(person1, person2, participants?)`:

- `person1` and `person2`: this week's pair. Type one of them in CAPS and that
  person stays on for week 2 with somebody else. Shouting is the API.
- `participants` (optional): a comma-separated list for *this call only*,
  leaving your config alone. Handy when someone joins for a fortnight:
  `participants: "Fran,Xabi,Dani,Laura"`.

Three names minimum, no duplicates — in the config (or the server refuses to
boot) and in the parameter (or the call comes back with the error).

## The rules

With N participants:

- The calendar runs `2N` weeks and everybody shows up 4 times.
- Week 1 is the pair you handed over.
- Exactly one person carries over from each week into the next, so the same pair
  never happens twice in a row.
- Nobody works three weeks straight.
- Dates start on the Monday of the current week.

The search is randomised, so the same arguments can produce different calendars.
Both are correct. Pick your battles.

## Tests

```bash
npm test
```

Checks the invariants — week count, appearances, carry-over, no three in a row,
the CAPS repeater — with 3, 4 and 5 participants.
