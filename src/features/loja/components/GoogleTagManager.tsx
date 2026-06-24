import { useEffect } from "react";

/**
 * Carrega o Google Tag Manager apenas se o ID estiver configurado via
 * variável de ambiente `VITE_GTM_ID` (formato GTM-XXXXXXX).
 *
 * Enquanto o ID não existir, nada é injetado — a página continua leve.
 */
export function GoogleTagManager() {
  const gtmId = import.meta.env.VITE_GTM_ID as string | undefined;

  useEffect(() => {
    if (!gtmId || document.getElementById("gtm-script")) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const script = document.createElement("script");
    script.id = "gtm-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);
  }, [gtmId]);

  return null;
}

export default GoogleTagManager;
