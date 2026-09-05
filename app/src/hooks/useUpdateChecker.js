import { useEffect, useState } from "react";

export function useUpdateChecker() {
  const [update, setUpdate] = useState({
    status: "idle",
    percent: 0,
    version: null,
    message: null,
  });

  useEffect(() => {
    const api = window.grid;
    if (!api?.onUpdateStatus) return;
    return api.onUpdateStatus((s) =>
      setUpdate({
        status: s.status,
        percent: s.percent || 0,
        version: s.version || null,
        message: s.message || null,
      })
    );
  }, []);

  const checkForUpdates = () => window.grid?.checkForUpdates();
  const installUpdate = () => window.grid?.installUpdate();
  const dismiss = () =>
    setUpdate((prev) => ({ ...prev, status: "dismissed" }));

  return { update, checkForUpdates, installUpdate, dismiss };
}