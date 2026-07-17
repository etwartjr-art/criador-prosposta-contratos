import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = { title: string; url?: string };

export function ShareLinkButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const link = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast.success("Link copiado");
      } catch {
        toast.error("Não foi possível copiar. Copie manualmente: " + link);
      }
      document.body.removeChild(ta);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
      } catch {
        /* user canceled */
      }
    } else {
      copy();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={copy} title={link}>
        {copied ? (
          <Check className="mr-1 h-4 w-4" />
        ) : (
          <Copy className="mr-1 h-4 w-4" />
        )}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      <Button variant="outline" onClick={share}>
        <Share2 className="mr-1 h-4 w-4" /> Compartilhar
      </Button>
    </>
  );
}
