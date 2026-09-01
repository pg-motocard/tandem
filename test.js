import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCalendar, weeksFor, MAX_SHIFTS } from "./rotation.js";

function checkInvariants(participants, calendar) {
  assert.equal(calendar.length, weeksFor(participants), "week count = 2N");

  const shifts = Object.fromEntries(participants.map((p) => [p, 0]));
  calendar.forEach((pair, i) => {
    assert.equal(pair.length, 2);
    assert.notEqual(pair[0], pair[1], `week ${i + 1}: somebody paired with themselves`);
    pair.forEach((p) => (shifts[p] += 1));

    if (i > 0) {
      const shared = pair.filter((p) => calendar[i - 1].includes(p)).length;
      assert.equal(shared, 1, `week ${i + 1}: carry-over must be exactly 1`);
    }
    if (i > 1) {
      for (const p of pair) {
        const threeStraight = calendar[i - 1].includes(p) && calendar[i - 2].includes(p);
        assert.ok(!threeStraight, `week ${i + 1}: ${p} works three weeks straight`);
      }
    }
  });

  for (const p of participants) {
    assert.equal(shifts[p], MAX_SHIFTS, `${p} must show up ${MAX_SHIFTS} times`);
  }
}

// It is randomised, so we run it a few times instead of trusting one lucky roll.
for (const participants of [
  ["Pablo", "Fran", "Xabi", "Dani"],
  ["Ana", "Bea", "Carla", "Dani", "Eva"],
  ["One", "Two", "Three"]
]) {
  test(`valid calendar with ${participants.length} participants`, () => {
    for (let i = 0; i < 20; i++) {
      const result = buildCalendar(participants, participants[0], participants[1]);
      assert.ok(result, "a calendar must exist");
      checkInvariants(participants, result.calendar);
    }
  });

  test(`the repeater stays on for week 2 with ${participants.length} participants`, () => {
    for (let i = 0; i < 20; i++) {
      const rep = participants[0];
      const result = buildCalendar(participants, rep, participants[1], rep);
      assert.ok(result, "a calendar must exist");
      assert.ok(result.calendar[1].includes(rep), "the repeater is on week 2");
      assert.ok(!result.calendar[1].includes(participants[1]), "with somebody else");
      checkInvariants(participants, result.calendar);
    }
  });
}
