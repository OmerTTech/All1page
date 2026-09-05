import { useEffect, useState } from "react";
import { REVEAL_ZONE, HIDE_THRESHOLD } from "../utils/helpers";

export function useElectronBridge(autoHide, setBarVisible) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const api = window.grid;
    if (!api?.onFullscreenState) return;
    return api.onFullscreenState((v) => setIsFullscreen(v));
  }, []);

  useEffect(() => {
    const api = window.grid;
    if (api?.setAutoHide) api.setAutoHide(autoHide);
    if (!autoHide) setBarVisible(true);
  }, [autoHide, setBarVisible]);

  useEffect(() => {
    const api = window.grid;
    if (api?.onToolbarState) return api.onToolbarState((v) => setBarVisible(v));
    if (!autoHide) {
      setBarVisible(true);
      return;
    }
    let hideTimer = null;
    const onMove = (e) => {
      if (e.clientY <= REVEAL_ZONE) {
        clearTimeout(hideTimer);
        setBarVisible(true);
      } else if (e.clientY >= HIDE_THRESHOLD) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setBarVisible(false), 400);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(hideTimer);
    };
  }, [autoHide, setBarVisible]);

  return { isFullscreen };
}
