import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";


export function useProcessUpdateState(paused: boolean) {
  useEffect(() => {
    if (paused) {
      invoke('pause_updates')
    } else {
      invoke('resume_updates')
    }
  }, [paused])
}