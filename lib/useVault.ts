"use client";

import { useEffect, useReducer, useCallback } from "react";
import { VaultState, VerifyResult } from "./types";
import { api } from "./api";

interface State {
  vaultState: VaultState | null;
  verifyResult: VerifyResult | null;
  isLoading: boolean;
  isIngesting: boolean;
  error: string | null;
  selectedFileId: string | null;
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_INGESTING"; payload: boolean }
  | { type: "SET_STATE"; payload: VaultState }
  | { type: "SET_VERIFY_RESULT"; payload: VerifyResult | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SELECTED_FILE"; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_INGESTING":
      return { ...state, isIngesting: action.payload };
    case "SET_STATE":
      return {
        ...state,
        vaultState: action.payload,
        // If selected file no longer exists, select first available file
        selectedFileId:
          action.payload.files.find((f) => f.id === state.selectedFileId)?.id ||
          action.payload.files[0]?.id ||
          null,
      };
    case "SET_VERIFY_RESULT":
      return { ...state, verifyResult: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SELECTED_FILE":
      return { ...state, selectedFileId: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  vaultState: null,
  verifyResult: null,
  isLoading: true,
  isIngesting: false,
  error: null,
  selectedFileId: null,
};

export function useVault() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshState = useCallback(async () => {
    try {
      const snap = await api.state();
      dispatch({ type: "SET_STATE", payload: snap });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message || "Failed to fetch vault state" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const ingestFiles = useCallback(
    async (files: { name: string; base64: string }[]) => {
      try {
        dispatch({ type: "SET_INGESTING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        // 1. Enqueue all files
        for (const file of files) {
          await api.enqueue(file.name, file.base64);
        }
        await refreshState();

        // 2. Stepwise ingestion: dequeue -> process -> update state every 600ms
        let hasMore = true;
        while (hasMore) {
          await new Promise((r) => setTimeout(r, 600));
          const res = await api.processNext();
          await refreshState();
          hasMore = res.processed;
        }
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message || "Ingestion failed" });
      } finally {
        dispatch({ type: "SET_INGESTING", payload: false });
      }
    },
    [refreshState]
  );

  const runVerify = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const result = await api.verify();
      dispatch({ type: "SET_VERIFY_RESULT", payload: result });
      await refreshState();
      return result;
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message || "Verify failed" });
      return null;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [refreshState]);

  const tamperFile = useCallback(
    async (fileId: string) => {
      try {
        await api.tamperFile(fileId);
        // Note: verifyResult is intentionally NOT cleared or updated yet,
        // so the user sees the file as "secured" until they run integrity check!
        await refreshState();
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message || "Tamper failed" });
      }
    },
    [refreshState]
  );

  const tamperBlock = useCallback(
    async (index: number, details: string) => {
      try {
        await api.tamperBlock(index, details);
        await refreshState();
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message || "Block tamper failed" });
      }
    },
    [refreshState]
  );

  const undo = useCallback(async () => {
    try {
      await api.undo();
      await refreshState();
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message || "Undo failed" });
    }
  }, [refreshState]);

  const flagUrgent = useCallback(
    async (fileId: string) => {
      try {
        await api.flagUrgent(fileId);
        await refreshState();
      } catch (err: any) {
        dispatch({ type: "SET_ERROR", payload: err.message || "Flag urgent failed" });
      }
    },
    [refreshState]
  );

  const processUrgent = useCallback(async () => {
    try {
      await api.processUrgent();
      await refreshState();
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message || "Process urgent failed" });
    }
  }, [refreshState]);

  const resetVault = useCallback(async () => {
    try {
      await api.reset();
      dispatch({ type: "SET_VERIFY_RESULT", payload: null });
      await refreshState();
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message || "Reset failed" });
    }
  }, [refreshState]);

  const selectFile = useCallback((fileId: string | null) => {
    dispatch({ type: "SET_SELECTED_FILE", payload: fileId });
  }, []);

  return {
    ...state,
    refreshState,
    ingestFiles,
    runVerify,
    tamperFile,
    tamperBlock,
    undo,
    flagUrgent,
    processUrgent,
    resetVault,
    selectFile,
  };
}
