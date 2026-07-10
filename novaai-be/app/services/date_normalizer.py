"""
Deterministic deadline-text → ISO date normalizer.

Week convention (documented):
  - Monday is the start of the week.
  - "end of this week"  → the Sunday of the current calendar week.
  - "end of next week"  → the Sunday of the next calendar week.

When meeting_date is not provided, relative expressions are returned unchanged.
Ambiguous expressions that cannot be safely resolved are returned unchanged,
with an optional warning.
"""

import re
from calendar import monthrange
from dataclasses import dataclass, field
from datetime import date, timedelta

# ---------------------------------------------------------------------------
# Public types
# ---------------------------------------------------------------------------


@dataclass
class NormalizationResult:
    normalized_date: str
    warning: str | None = field(default=None)


# ---------------------------------------------------------------------------
# Internal lookup tables
# ---------------------------------------------------------------------------

_MONTHS: dict[str, int] = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}

_WEEKDAYS: dict[str, int] = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}

_WORDS_TO_INT: dict[str, int] = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
}

# Regex: strip simple leading prepositions without touching "end of …"
_SIMPLE_PREP = re.compile(r"^(?:by|on|until|before)\s+", re.IGNORECASE)

# Regex: "end of <something>"  (handles "by the end of", "the end of", etc.)
_END_OF = re.compile(
    r"^(?:by\s+the\s+end\s+of|by\s+end\s+of|(?:the\s+)?end\s+of|before\s+the\s+end\s+of)\s+(.+)$",
    re.IGNORECASE,
)

_MONTHS_ALT = "|".join(_MONTHS)
_WEEKDAYS_ALT = "|".join(_WEEKDAYS)

_ISO_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_IN_N_DAYS_RE = re.compile(r"^in\s+(\w+)\s+days?$", re.IGNORECASE)
_N_WEEKS_FROM_TODAY_RE = re.compile(r"^(\w+)\s+weeks?\s+from\s+today$", re.IGNORECASE)
_WEEKDAY_RE = re.compile(rf"^(next\s+)?({_WEEKDAYS_ALT})$", re.IGNORECASE)
_MONTH_DAY_YEAR_RE = re.compile(
    rf"^({_MONTHS_ALT})\s+(\d{{1,2}}),?\s+(\d{{4}})$", re.IGNORECASE
)
_MONTH_DAY_RE = re.compile(rf"^({_MONTHS_ALT})\s+(\d{{1,2}})$", re.IGNORECASE)
_ORDINAL_RE = re.compile(r"^(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)$", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def normalize_date(deadline_text: str, meeting_date: date | None) -> NormalizationResult:
    """
    Normalize *deadline_text* to an ISO 8601 date string when possible.

    Returns the original text when:
    - meeting_date is required but absent.
    - the phrase is ambiguous and cannot be safely resolved.

    A non-None ``warning`` is set when the text is partially recognisable but
    cannot be fully resolved (e.g. ordinal without a month).
    """
    text = deadline_text.strip()

    if not text or text.lower() == "no date given":
        return NormalizationResult("No date given")

    # Strip simple leading prepositions ("by Monday" → "Monday").
    # Does NOT strip "end of" — that is handled by _END_OF below.
    core = _SIMPLE_PREP.sub("", text).strip()
    c = core.lower()

    # ── 1. Already ISO ──────────────────────────────────────────────────────
    if _ISO_RE.match(core):
        return NormalizationResult(core)

    # ── 2. Simple keywords ──────────────────────────────────────────────────
    if c == "today":
        return NormalizationResult(meeting_date.isoformat() if meeting_date else text)

    if c == "tomorrow":
        return NormalizationResult(
            (meeting_date + timedelta(days=1)).isoformat() if meeting_date else text
        )

    if c in ("day after tomorrow", "the day after tomorrow"):
        return NormalizationResult(
            (meeting_date + timedelta(days=2)).isoformat() if meeting_date else text
        )

    if c in ("one week from today", "a week from today"):
        return NormalizationResult(
            (meeting_date + timedelta(weeks=1)).isoformat() if meeting_date else text
        )

    # ── 3. "in N days" ──────────────────────────────────────────────────────
    m = _IN_N_DAYS_RE.match(c)
    if m:
        n = _to_int(m.group(1))
        if n is not None:
            return NormalizationResult(
                (meeting_date + timedelta(days=n)).isoformat() if meeting_date else text
            )

    # ── 4. "N weeks from today" ─────────────────────────────────────────────
    m = _N_WEEKS_FROM_TODAY_RE.match(c)
    if m:
        n = _to_int(m.group(1))
        if n is not None:
            return NormalizationResult(
                (meeting_date + timedelta(weeks=n)).isoformat() if meeting_date else text
            )

    # ── 5. Weekday (optional "next" prefix) ─────────────────────────────────
    m = _WEEKDAY_RE.match(c)
    if m:
        target = _WEEKDAYS[m.group(2).lower()]
        if not meeting_date:
            return NormalizationResult(text)
        return NormalizationResult(_next_weekday(meeting_date, target).isoformat())

    # ── 6. "end of …" ───────────────────────────────────────────────────────
    m = _END_OF.match(c)
    if m:
        return _resolve_end_of(m.group(1).strip(), text, meeting_date)

    # ── 7. Month Day Year: "July 20, 2026" ──────────────────────────────────
    m = _MONTH_DAY_YEAR_RE.match(core)
    if m:
        month_num = _MONTHS[m.group(1).lower()]
        day, year = int(m.group(2)), int(m.group(3))
        return _safe_date(year, month_num, day, text)

    # ── 8. Month Day: "July 20" ─────────────────────────────────────────────
    m = _MONTH_DAY_RE.match(core)
    if m:
        month_num = _MONTHS[m.group(1).lower()]
        day = int(m.group(2))
        if not meeting_date:
            return NormalizationResult(text)
        year = meeting_date.year
        result = _safe_date(year, month_num, day, text)
        # If the date is already in the past relative to the meeting, use next year.
        if result.warning is None and result.normalized_date < meeting_date.isoformat():
            return _safe_date(year + 1, month_num, day, text)
        return result

    # ── 9. Ordinal without month: "the 5th" — ambiguous ────────────────────
    if _ORDINAL_RE.match(c):
        return NormalizationResult(
            text,
            warning="Deadline could not be normalized because the month was not specified.",
        )

    # ── 10. Cannot normalize — return original unchanged ────────────────────
    return NormalizationResult(text)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _resolve_end_of(
    what: str, original: str, meeting_date: date | None
) -> NormalizationResult:
    """Resolve 'end of <what>' to an ISO date."""
    w = what.lower()

    if w in ("this week", "the week"):
        if not meeting_date:
            return NormalizationResult(original)
        # Week is Mon–Sun; find the Sunday of the current week.
        days_to_sunday = (6 - meeting_date.weekday()) % 7
        return NormalizationResult(
            (meeting_date + timedelta(days=days_to_sunday)).isoformat()
        )

    if w in ("next week", "the next week"):
        if not meeting_date:
            return NormalizationResult(original)
        days_to_sunday = (6 - meeting_date.weekday()) % 7
        this_sunday = meeting_date + timedelta(days=days_to_sunday)
        return NormalizationResult((this_sunday + timedelta(weeks=1)).isoformat())

    if w in ("this month", "the month"):
        if not meeting_date:
            return NormalizationResult(original)
        last_day = monthrange(meeting_date.year, meeting_date.month)[1]
        return NormalizationResult(
            date(meeting_date.year, meeting_date.month, last_day).isoformat()
        )

    if w == "next month":
        if not meeting_date:
            return NormalizationResult(original)
        year, month = meeting_date.year, meeting_date.month + 1
        if month > 12:
            year, month = year + 1, 1
        last_day = monthrange(year, month)[1]
        return NormalizationResult(date(year, month, last_day).isoformat())

    if w in _MONTHS:
        if not meeting_date:
            return NormalizationResult(original)
        month_num = _MONTHS[w]
        year = meeting_date.year
        # If this month has already passed in the current year, use next year.
        if month_num < meeting_date.month:
            year += 1
        last_day = monthrange(year, month_num)[1]
        return NormalizationResult(date(year, month_num, last_day).isoformat())

    return NormalizationResult(original)


def _next_weekday(from_date: date, target_weekday: int) -> date:
    """Return the next occurrence of *target_weekday* strictly after *from_date*."""
    days_ahead = target_weekday - from_date.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return from_date + timedelta(days=days_ahead)


def _safe_date(year: int, month: int, day: int, original: str) -> NormalizationResult:
    try:
        return NormalizationResult(date(year, month, day).isoformat())
    except ValueError:
        return NormalizationResult(original, warning=f"Could not parse date: {original}")


def _to_int(word: str) -> int | None:
    try:
        return int(word)
    except ValueError:
        return _WORDS_TO_INT.get(word.lower())
