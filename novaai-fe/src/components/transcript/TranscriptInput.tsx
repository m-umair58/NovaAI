import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, FileText, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/common";
import { Button, Card, CardContent } from "@/components/common";
import { cn } from "@/lib/utils";
import {
  TRANSCRIPT_MAX_LENGTH,
  transcriptSchema,
  type TranscriptFormValues,
} from "./schema";
import type { SampleTranscript } from "@/mocks/transcripts";

export interface TranscriptInputProps {
  loading: boolean;
  onSubmit: (transcript: string, meetingDate?: string) => void;
  sampleTranscripts?: SampleTranscript[];
  className?: string;
}

function getCounterColor(length: number): string {
  const ratio = length / TRANSCRIPT_MAX_LENGTH;
  if (ratio >= 0.95) return "text-danger";
  if (ratio >= 0.8) return "text-warning";
  return "text-muted";
}

type Difficulty = SampleTranscript["difficulty"];

function getDifficultyVariant(
  difficulty: Difficulty
): "success" | "warning" | "danger" {
  switch (difficulty) {
    case "Easy":
      return "success";
    case "Medium":
      return "warning";
    case "Hard":
      return "danger";
  }
}

const transcriptBarClassName =
  "flex h-[4.375rem] shrink-0 items-center border-border bg-surface-container-low px-5 sm:px-6";

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TranscriptInput({
  loading,
  onSubmit,
  sampleTranscripts,
  className,
}: TranscriptInputProps) {
  const errorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const samples = sampleTranscripts ?? [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<TranscriptFormValues>({
    resolver: zodResolver(transcriptSchema),
    mode: "onChange",
    defaultValues: { transcript: "", meeting_date: getTodayDateString() },
  });

  const transcript = useWatch({ control, name: "transcript", defaultValue: "" }) ?? "";
  const characterCount = transcript.length;
  const isEmpty = characterCount === 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { ref: registerRef, ...registerRest } = register("transcript");

  const handleFormSubmit = (data: TranscriptFormValues) => {
    onSubmit(data.transcript, data.meeting_date || undefined);
  };

  const handleClear = () => {
    reset({ transcript: "", meeting_date: getTodayDateString() });
  };

  const handleLoadSample = (sample: SampleTranscript) => {
    setValue("transcript", sample.content, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsDropdownOpen(false);
    toast.success("Sample transcript loaded.");
  };

  return (
    <Card
      hover={false}
      glass={false}
      className={cn(
        "flex h-full min-h-0 flex-col bg-surface-container-low",
        className,
      )}
    >
      {/* Header — icon + title + load sample */}
      <div
        className={cn(
          transcriptBarClassName,
          "justify-between gap-3 rounded-t-[var(--radius-card)] border-b",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <FileText className="size-5" strokeWidth={1.75} />
          </div>
          <h2 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-headline-md">
            Meeting Transcript
          </h2>
        </div>

        <div ref={dropdownRef} className="relative shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            aria-label="Load sample transcript"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            onClick={() => setIsDropdownOpen((open) => !open)}
          >
            Load Sample
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isDropdownOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>

          {isDropdownOpen && (
            <ul
              role="listbox"
              aria-label="Sample transcripts"
              className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2.5rem,320px)] overflow-hidden rounded-[var(--radius-card)] border border-border bg-dropdown py-1 shadow-[var(--shadow-card-hover)] sm:w-80"
            >
              {samples.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted">
                  No samples available.
                </li>
              ) : (
                samples.map((sample: SampleTranscript) => (
                  <li key={sample.id} role="option">
                    <button
                      type="button"
                      className="w-full px-3 py-3 text-left hover:bg-hover"
                      onClick={() => handleLoadSample(sample)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {sample.title}
                        </span>
                        <Badge
                          variant={getDifficultyVariant(sample.difficulty)}
                        >
                          {sample.difficulty}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {sample.description}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <CardContent className="flex min-h-0 flex-1 flex-col bg-surface py-5">
        <form
          id="transcript-extract-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <label htmlFor="meeting-transcript" className="sr-only">
              Meeting transcript
            </label>

            <textarea
              id="meeting-transcript"
              ref={(element) => {
                registerRef(element);
                textareaRef.current = element;
              }}
              {...registerRest}
              disabled={loading}
              aria-invalid={errors.transcript ? "true" : "false"}
              aria-describedby={errors.transcript ? errorId : undefined}
              placeholder={`John: Can everyone see my screen?
Sarah: Yes, we see the Q4 roadmap.
Mike: Great, Sarah you need to finish the API docs by Friday...`}
              className={cn(
                "min-h-0 w-full flex-1 resize-none overflow-y-auto rounded-[var(--radius-input)] border bg-surface-container-low",
                "px-4 py-4 text-sm leading-relaxed text-foreground",
                "placeholder:text-muted",
                "border-outline-variant/60",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20",
                "disabled:cursor-not-allowed disabled:opacity-60",
                errors.transcript &&
                  "border-danger focus:border-danger focus:ring-danger/20",
              )}
            />

            {errors.transcript && (
              <p id={errorId} className="mt-2 text-sm text-danger" role="alert">
                {errors.transcript.message}
              </p>
            )}

            <div className="mt-2 flex justify-end">
              <span
                className={cn(
                  "text-xs tabular-nums",
                  getCounterColor(characterCount),
                )}
                aria-live="polite"
              >
                {characterCount.toLocaleString()} /{" "}
                {TRANSCRIPT_MAX_LENGTH.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="shrink-0 space-y-2">
            <label
              htmlFor="meeting-date"
              className="text-sm font-medium text-foreground"
            >
              Meeting date
              <span className="ml-1 text-xs font-normal text-muted">
                (defaults to today — improves relative deadlines like
                &ldquo;tomorrow&rdquo;)
              </span>
            </label>
            <input
              id="meeting-date"
              type="date"
              disabled={loading}
              {...register("meeting_date")}
              className={cn(
                "h-11 w-full rounded-[var(--radius-input)] border bg-surface-container-low px-4 text-sm text-foreground",
                "border-outline-variant/60",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20",
                "disabled:cursor-not-allowed disabled:opacity-60",
                errors.meeting_date &&
                  "border-danger focus:border-danger focus:ring-danger/20",
              )}
            />
            {errors.meeting_date && (
              <p className="text-sm text-danger" role="alert">
                {errors.meeting_date.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>

      {/* Footer actions — Extract (wide) + Clear */}
      <div
        className={cn(
          transcriptBarClassName,
          "gap-3 rounded-b-[var(--radius-card)] border-t",
        )}
      >
        <Button
          type="submit"
          form="transcript-extract-form"
          disabled={loading || !isValid}
          isLoading={loading}
          aria-label="Extract tasks from transcript"
          className="h-11 flex-1 rounded-[var(--radius-button)]"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Analyzing...
            </>
          ) : (
            "Extract Tasks"
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={loading || isEmpty}
          aria-label="Clear transcript"
          onClick={handleClear}
          className="h-11 shrink-0 rounded-[var(--radius-button)] px-6"
        >
          Clear
        </Button>
      </div>
    </Card>
  );
}
