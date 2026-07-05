/** Types partagés du dashboard exportateur (module PUR). */

export type ExpTab = "analytique" | "assistant" | "config";

/** Une ligne du journal réseau simulé (onglet Configuration, Prompt 5). */
export interface LogEntry {
  id: string;
  service: string; // "Whisp API", "Gemini API", "Export", "TRACES NT"…
  label: string;
  ms: number;
  status: "ok" | "warn";
  time: string; // HH:MM:SS
}
