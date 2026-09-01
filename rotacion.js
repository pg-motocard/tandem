// Rotación semanal de parejas.
//
// Reglas:
// - N participantes -> 2N semanas, cada persona aparece exactamente 4 veces.
// - La semana 1 es la pareja indicada.
// - Carry-over exacto: 1 persona de la semana anterior continúa en la siguiente
//   (esto ya impide repetir la misma pareja dos semanas seguidas).
// - Nadie aparece 3 semanas seguidas.
// - Si se pasa un repetidor, esa persona repite la semana 2 con otra distinta.

export const USO_MAX = 4;

export const semanasPara = (participantes) => 2 * participantes.length;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function apareceTresSemanasSeguidas(calendario, semana, persona) {
  if (semana < 2) return false;
  const prev1 = calendario[semana - 1];
  const prev2 = calendario[semana - 2];
  return Boolean(prev1 && prev2 && prev1.includes(persona) && prev2.includes(persona));
}

function backtracking(participantes, calendario, uso, semana, repetidor) {
  if (semana === semanasPara(participantes)) return true;

  const anterior = calendario[semana - 1];

  // Candidatos: con repetidor en la semana 1, solo parejas que lo incluyan.
  const candidatos = [];
  for (let i = 0; i < participantes.length; i++) {
    for (let j = i + 1; j < participantes.length; j++) {
      candidatos.push([participantes[i], participantes[j]]);
    }
  }
  shuffle(candidatos);

  for (const [p1, p2] of candidatos) {
    if (repetidor && semana === 1 && p1 !== repetidor && p2 !== repetidor) continue;

    // Carry-over: exactamente uno de los dos venía de la semana anterior.
    if (anterior.filter((p) => p === p1 || p === p2).length !== 1) continue;

    if (uso[p1] >= USO_MAX || uso[p2] >= USO_MAX) continue;
    if (apareceTresSemanasSeguidas(calendario, semana, p1)) continue;
    if (apareceTresSemanasSeguidas(calendario, semana, p2)) continue;

    calendario[semana] = [p1, p2];
    uso[p1] += 1;
    uso[p2] += 1;

    if (backtracking(participantes, calendario, uso, semana + 1, repetidor)) return true;

    uso[p1] -= 1;
    uso[p2] -= 1;
    calendario[semana] = null;
  }

  return false;
}

/**
 * Devuelve { calendario, uso } o null si no existe calendario válido.
 * p1/p2 deben ser nombres canónicos de `participantes`.
 */
export function generarCalendario(participantes, p1, p2, repetidor = null) {
  const calendario = new Array(semanasPara(participantes)).fill(null);
  const uso = Object.fromEntries(participantes.map((p) => [p, 0]));

  calendario[0] = [p1, p2];
  uso[p1] += 1;
  uso[p2] += 1;

  if (!backtracking(participantes, calendario, uso, 1, repetidor)) return null;
  return { calendario, uso };
}
