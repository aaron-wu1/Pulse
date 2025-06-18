import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";


export function useProcessUpdateState(paused: boolean) {
  const previousPaused = useRef(paused);
  useEffect(() => {
    const handleProcessUpdate = async () => {
      if (paused !== previousPaused.current) {
        if (paused) {
          await invoke("pause_updates");
        } else {
          await invoke("resume_updates");
        }
        previousPaused.current = paused
      }
    };
    handleProcessUpdate();
  }, [paused]);
}