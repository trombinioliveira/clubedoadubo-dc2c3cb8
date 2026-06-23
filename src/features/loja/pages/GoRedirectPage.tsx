import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackClubeGo } from "../api/clube";

const FALLBACK = "/loja";

export default function GoRedirectPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t");
  const [finalUrl, setFinalUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const target = slug ?? "clube-produtos";
    trackClubeGo(target, token).then((url) => {
      if (!active) return;
      setFinalUrl(url);
      // Auto-redirect to the final destination.
      window.location.href = url;
    });
    return () => {
      active = false;
    };
  }, [slug, token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-3xl">🌱</span>
      <h1 className="text-xl font-bold text-foreground">Abrindo próximo passo...</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Se não abrir automaticamente, toque no botão abaixo.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" disabled={!finalUrl}>
          <a href={finalUrl ?? FALLBACK} rel="noopener noreferrer">
            Continuar
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/loja">Voltar para a loja</Link>
        </Button>
      </div>
    </div>
  );
}
