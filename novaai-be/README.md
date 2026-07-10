# AI Meeting Action Item Extractor

Backend API that accepts meeting transcripts and extracts structured action items using OpenAI's Structured Output API.

---

## Tech Stack

- Python 3.12+
- FastAPI + Uvicorn
- Pydantic v2 + pydantic-settings
- OpenAI SDK (Structured Output)
- Pytest + HTTPX

---

## Setup

### 1. Clone and create virtual environment

```bash
git clone <repo-url>
cd novaai-be

python3.13 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -e ".[dev]"
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your OpenAI API key:

```env
OPENAI_API_KEY=sk-...
```

The application starts without an API key. Extraction returns `502` until a key is configured.

---

## Run

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Docker

### Build

```bash
docker build -t novaai-be .
```

### Run

```bash
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  novaai-be
```

---

## Test

```bash
pytest -v
```

All tests use mocked providers. No real OpenAI calls are made during testing.

---

## Lint

```bash
ruff check .
```

---

## Extraction Quality: Merging, Corrections, and Conflict Detection

### Duplicate merging

When the same task is mentioned more than once in a transcript, the system merges all references
into a single action item. The most complete and final description is preserved.

Example — two related mentions produce one item:

> "Sarah needs to prepare the release notes."
> "Sarah, make sure the release notes include the migration details."

Result:

```json
{
  "task": "Prepare the release notes including migration details",
  "owner": "Sarah",
  "due_date": "No date given",
  "warnings": []
}
```

Merging is conservative. Tasks that share words but describe different work (e.g. "review the
API docs" vs "update the API docs") are kept separate.

### Later corrections

When the transcript explicitly revises an earlier owner, deadline, or task description, the
latest agreed value is used. This is not flagged as a conflict.

Example:

> "Sarah will send the report by Friday."
> "Actually, move Sarah's report deadline to Monday."

Result:

```json
{
  "task": "Send the report",
  "owner": "Sarah",
  "due_date": "Monday",
  "warnings": []
}
```

### Unresolved conflicts

When the transcript contains contradictory information with no clear resolution, the safest
supported value is used and a `warnings` list explains the ambiguity.

**Due-date conflict example:**

> "The release notes are due Friday."
> "I thought we agreed they were due Monday."
> _(No final confirmation given.)_

```json
{
  "task": "Prepare the release notes",
  "owner": "Sarah",
  "due_date": "No date given",
  "warnings": [
    "Conflicting due dates mentioned: Friday and Monday. No final deadline was clearly confirmed."
  ]
}
```

**Owner conflict example:**

> "John will prepare the deployment checklist."
> "Emily is handling the deployment checklist."
> _(Neither assignment confirmed.)_

```json
{
  "task": "Prepare the deployment checklist",
  "owner": "Unassigned",
  "due_date": "No date given",
  "warnings": [
    "Conflicting owners mentioned: John and Emily. Final ownership was not clearly confirmed."
  ]
}
```

The system never silently guesses when ownership or deadlines remain genuinely uncertain.

---

## Priority Extraction and Deadline Normalisation

### Priority

Each action item includes a `priority` field with one of four values:

| Value | When used |
|-------|-----------|
| `"High"` | Transcript explicitly uses: urgent, critical, P0, blocking, top priority, required for launch/release, etc. |
| `"Medium"` | Transcript explicitly uses: medium priority, normal priority, P1, important but not blocking, etc. |
| `"Low"` | Transcript explicitly uses: low priority, nice to have, P2, can wait, backlog, etc. |
| `"Not specified"` | No priority language; urgency cannot be determined; or language is ambiguous. |

**Priority is never inferred from task category or deadline proximity.**
A short deadline alone does not make a task High priority.
A task about production or security is not automatically High.

Priority corrections follow the same rules as deadline corrections — the latest confirmed value
is used without a warning. Unresolved conflicts produce a warning and default to `"Not specified"`.

### Deadline fields

Each action item includes two deadline fields:

| Field | Contents |
|-------|----------|
| `due_date_text` | The original wording from the transcript (e.g. `"by next Friday"`) |
| `due_date` | ISO 8601 date when safely resolvable; otherwise the original wording |

#### Week convention

- **Monday** is the start of the week.
- `"end of this week"` → the **Sunday** of the current calendar week.
- `"end of next week"` → the **Sunday** of the next calendar week.

#### Supported deadline expressions

| Transcript phrase | Example result (meeting date 2026-07-10) |
|-------------------|------------------------------------------|
| `"2026-07-20"` (ISO) | `"2026-07-20"` |
| `"July 20"` | `"2026-07-20"` |
| `"July 20, 2026"` | `"2026-07-20"` |
| `"today"` | `"2026-07-10"` |
| `"tomorrow"` | `"2026-07-11"` |
| `"day after tomorrow"` | `"2026-07-12"` |
| `"in three days"` | `"2026-07-13"` |
| `"one week from today"` | `"2026-07-17"` |
| `"Monday"` | `"2026-07-13"` |
| `"next Friday"` | `"2026-07-17"` |
| `"end of this week"` | `"2026-07-12"` (Sunday) |
| `"end of next week"` | `"2026-07-19"` (Sunday) |
| `"end of July"` | `"2026-07-31"` |

Relative expressions require `meeting_date` to be provided in the request. When it is absent,
`due_date` preserves the original text unchanged.

Ambiguous expressions (e.g. `"by the 5th"` without a month) are returned as-is with a warning.
The system **never silently guesses** a date.

### Example request and response

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/action-items/extract \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "John, please resolve the production login failure. This is blocking the release. Have it done by Monday.",
    "meeting_date": "2026-07-10"
  }' | jq .
```

**Response:**
```json
{
  "action_items": [
    {
      "task": "Resolve the production login failure",
      "owner": "John",
      "due_date": "2026-07-13",
      "due_date_text": "by Monday",
      "priority": "High",
      "warnings": []
    }
  ],
  "count": 1
}
```

---

## API Reference

### `GET /health`

Health check.

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Meeting Action Item Extractor",
  "version": "0.1.0"
}
```

---

### `POST /api/v1/action-items/extract`

Extract action items from a meeting transcript.

**Request:**
```json
{
  "transcript": "Sarah will send the report by Friday. James needs to update the docs.",
  "meeting_date": "2026-07-10"
}
```

- `transcript` — required, plain text meeting transcript
- `meeting_date` — optional ISO date string, provides temporal context to the model

**Response:**
```json
{
  "action_items": [
    {
      "task": "Send the report",
      "owner": "Sarah",
      "due_date": "Friday"
    },
    {
      "task": "Update the docs",
      "owner": "James",
      "due_date": "No date given"
    }
  ],
  "count": 2
}
```

**Error responses:**

| Status | Code | Cause |
|--------|------|-------|
| 400 | `INVALID_TRANSCRIPT` | Empty, whitespace-only, too short, or too long transcript |
| 502 | `AI_PROVIDER_ERROR` | OpenAI key missing, timeout, or API error |
| 502 | `INVALID_AI_RESPONSE` | Unparseable model response |

---

### `POST /api/v1/action-items/send-to-tracker`

Send extracted action items to the mock tracker. Logs them server-side and returns a success confirmation.

**Request:**
```json
{
  "action_items": [
    {
      "task": "Send the report",
      "owner": "Sarah",
      "due_date": "Friday"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Action items sent to mock tracker"
}
```

---

## Demo Walkthrough

### Step 1 — Start the server

```bash
uvicorn app.main:app --reload
```

### Step 2 — Open Swagger UI

Navigate to http://localhost:8000/docs

### Step 3 — Run the simple transcript

```bash
curl -s -X POST http://localhost:8000/api/v1/action-items/extract \
  -H "Content-Type: application/json" \
  -d "{\"transcript\": \"$(cat sample_transcripts/simple.txt)\"}" | jq .
```

Expected: 5 clearly assigned action items with owners and dates.

### Step 4 — Run the complex transcript

```bash
curl -s -X POST http://localhost:8000/api/v1/action-items/extract \
  -H "Content-Type: application/json" \
  -d "{\"transcript\": \"$(cat sample_transcripts/complex.txt)\"}" | jq .
```

Expected: 8–10 action items across multiple participants.

### Step 5 — Run the curveball transcript

```bash
curl -s -X POST http://localhost:8000/api/v1/action-items/extract \
  -H "Content-Type: application/json" \
  -d "{\"transcript\": \"$(cat sample_transcripts/curveball.txt)\"}" | jq .
```

Expected:
- Prompt injection text is ignored
- Completed tasks (data pipeline fix, legal submission) are excluded
- Vague suggestions (case study blog post) are excluded
- Missing owners default to `"Unassigned"`
- Missing dates default to `"No date given"`
- Only real, actionable, assigned tasks are returned

### Step 6 — Send to mock tracker

Take the response from Step 3 and POST it to the tracker:

```bash
curl -s -X POST http://localhost:8000/api/v1/action-items/send-to-tracker \
  -H "Content-Type: application/json" \
  -d '{
    "action_items": [
      {"task": "Send the report", "owner": "Sarah", "due_date": "Friday"}
    ]
  }' | jq .
```

Expected:
```json
{
  "success": true,
  "message": "Action items sent to mock tracker"
}
```

---

## Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `AI Meeting Action Item Extractor` | Service name |
| `APP_ENV` | `development` | Environment label |
| `DEBUG` | `false` | FastAPI debug mode |
| `API_V1_PREFIX` | `/api/v1` | API route prefix |
| `ALLOWED_ORIGINS` | `["http://localhost:3000"]` | CORS allowed origins (JSON array) |
| `MIN_TRANSCRIPT_LENGTH` | `10` | Minimum transcript characters |
| `MAX_TRANSCRIPT_LENGTH` | `50000` | Maximum transcript characters |
| `LOG_LEVEL` | `INFO` | Logging level |
| `AI_PROVIDER` | `openai` | AI provider selection |
| `OPENAI_API_KEY` | _(empty)_ | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o` | OpenAI model name |
| `OPENAI_TIMEOUT_SECONDS` | `30` | Request timeout |
| `OPENAI_MAX_RETRIES` | `2` | SDK retry count |

---

## Project Structure

```
app/
├── main.py                    # App factory (create_app)
├── dependencies.py            # FastAPI DI functions
├── api/router.py              # Route registration
├── routes/
│   ├── health.py              # GET /health
│   └── action_items.py        # POST /extract, POST /send-to-tracker
├── services/
│   ├── action_item_service.py # Orchestration + normalization
│   ├── date_normalizer.py     # Deterministic deadline → ISO date converter
│   └── ai/
│       ├── base.py            # AIProvider ABC
│       ├── openai_provider.py # OpenAI Structured Output implementation
│       └── prompts.py         # System prompt + message builder
├── models/
│   ├── requests.py            # Request schemas
│   └── responses.py           # Response schemas
├── core/
│   ├── config.py              # pydantic-settings Settings
│   ├── exceptions.py          # Application exceptions
│   ├── exception_handlers.py  # FastAPI exception handlers
│   └── logging.py             # Logging configuration
└── utils/
    └── text.py                # Transcript validation

tests/
├── conftest.py                # Fixtures + MockAIProvider
├── helpers.py                 # Shared test utilities
├── test_health.py
├── test_action_items.py
├── test_ai_extraction.py
├── test_warnings.py           # Merging, corrections, conflict tests
└── test_priority_and_dates.py # Priority + deadline normalisation tests

sample_transcripts/
├── simple.txt                 # Clean transcript, clear owners + dates
├── complex.txt                # Multi-participant technical meeting
└── curveball.txt              # Noise, injection, missing fields, edge cases
```
