import { test } from "node:test";
import assert from "node:assert/strict";
import { generarCalendario, semanasPara, USO_MAX } from "./rotacion.js";

function comprobarInvariantes(participantes, calendario) {
  assert.equal(calendario.length, semanasPara(participantes), "número de semanas = 2N");

  const uso = Object.fromEntries(participantes.map((p) => [p, 0]));
  calendario.forEach((par, i) => {
    assert.equal(par.length, 2);
    assert.notEqual(par[0], par[1], `semana ${i + 1}: pareja repetida consigo misma`);
    par.forEach((p) => (uso[p] += 1));

    if (i > 0) {
      const comunes = par.filter((p) => calendario[i - 1].includes(p)).length;
      assert.equal(comunes, 1, `semana ${i + 1}: carry-over debe ser exactamente 1`);
    }
    if (i > 1) {
      for (const p of par) {
        const tresSeguidas = calendario[i - 1].includes(p) && calendario[i - 2].includes(p);
        assert.ok(!tresSeguidas, `semana ${i + 1}: ${p} aparece 3 semanas seguidas`);
      }
    }
  });

  for (const p of participantes) {
    assert.equal(uso[p], USO_MAX, `${p} debe aparecer ${USO_MAX} veces`);
  }
}

// Aleatorio: repetimos para no depender de una tirada afortunada.
for (const participantes of [
  ["Pablo", "Fran", "Xabi", "Dani"],
  ["Ana", "Bea", "Carla", "Dani", "Eva"],
  ["Uno", "Dos", "Tres"]
]) {
  test(`calendario válido con ${participantes.length} participantes`, () => {
    for (let i = 0; i < 20; i++) {
      const resultado = generarCalendario(participantes, participantes[0], participantes[1]);
      assert.ok(resultado, "debe existir calendario");
      comprobarInvariantes(participantes, resultado.calendario);
    }
  });

  test(`repetidor repite la semana 2 con ${participantes.length} participantes`, () => {
    for (let i = 0; i < 20; i++) {
      const rep = participantes[0];
      const resultado = generarCalendario(participantes, rep, participantes[1], rep);
      assert.ok(resultado, "debe existir calendario");
      assert.ok(resultado.calendario[1].includes(rep), "el repetidor va en la semana 2");
      assert.ok(!resultado.calendario[1].includes(participantes[1]), "con otra persona");
      comprobarInvariantes(participantes, resultado.calendario);
    }
  });
}
