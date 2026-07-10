import { z } from "zod";

export const TRANSCRIPT_MAX_LENGTH = 50_000;
export const TRANSCRIPT_MIN_LENGTH = 30;

export const transcriptSchema = z.object({
  transcript: z
    .string()
    .min(1, "Transcript is required.")
    .refine((value) => value.length >= TRANSCRIPT_MIN_LENGTH, {
      message: `Transcript must be at least ${TRANSCRIPT_MIN_LENGTH} characters.`,
    })
    .max(
      TRANSCRIPT_MAX_LENGTH,
      `Transcript must not exceed ${TRANSCRIPT_MAX_LENGTH.toLocaleString()} characters.`
    ),
  meeting_date: z
    .string()
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Enter a valid meeting date.",
    }),
});

export type TranscriptFormValues = z.infer<typeof transcriptSchema>;
