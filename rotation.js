// Weekly pair rotation.
//
// The rules:
// - N participants -> 2N weeks, everybody shows up exactly 4 times.
// - Week 1 is the pair you handed over.
// - Exact carry-over: one person from last week continues into the next one
//   (which already rules out the same pair happening twice in a row).
// - Nobody works three weeks straight.
// - Given a repeater, that person stays on for week 2 with somebody else.

export const MAX_SHIFTS = 4;

export const weeksFor = (participants) => 2 * participants.length;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function worksThreeWeeksStraight(calendar, week, person) {
  if (week < 2) return false;
  const prev1 = calendar[week - 1];
  const prev2 = calendar[week - 2];
  return Boolean(prev1 && prev2 && prev1.includes(person) && prev2.includes(person));
}

function backtrack(participants, calendar, shifts, week, repeater) {
  if (week === weeksFor(participants)) return true;

  const previous = calendar[week - 1];

  // Candidates: with a repeater on week 1, only pairs that include them.
  const candidates = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      candidates.push([participants[i], participants[j]]);
    }
  }
  shuffle(candidates);

  for (const [p1, p2] of candidates) {
    if (repeater && week === 1 && p1 !== repeater && p2 !== repeater) continue;

    // Carry-over: exactly one of the two came from last week.
    if (previous.filter((p) => p === p1 || p === p2).length !== 1) continue;

    if (shifts[p1] >= MAX_SHIFTS || shifts[p2] >= MAX_SHIFTS) continue;
    if (worksThreeWeeksStraight(calendar, week, p1)) continue;
    if (worksThreeWeeksStraight(calendar, week, p2)) continue;

    calendar[week] = [p1, p2];
    shifts[p1] += 1;
    shifts[p2] += 1;

    if (backtrack(participants, calendar, shifts, week + 1, repeater)) return true;

    shifts[p1] -= 1;
    shifts[p2] -= 1;
    calendar[week] = null;
  }

  return false;
}

/**
 * Returns { calendar, shifts }, or null when no valid calendar exists.
 * p1/p2 must be canonical names from `participants`.
 */
export function buildCalendar(participants, p1, p2, repeater = null) {
  const calendar = new Array(weeksFor(participants)).fill(null);
  const shifts = Object.fromEntries(participants.map((p) => [p, 0]));

  calendar[0] = [p1, p2];
  shifts[p1] += 1;
  shifts[p2] += 1;

  if (!backtrack(participants, calendar, shifts, 1, repeater)) return null;
  return { calendar, shifts };
}
