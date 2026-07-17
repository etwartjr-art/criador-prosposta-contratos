import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, Mail, MessageCircle } from "lucide-react";
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

  const email = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
      `Olá,\n\nSegue o link do documento "${title}":\n${link}\n\nAtenciosamente,\nETW Art Contabilidade`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const whatsapp = () => {
    const text = encodeURIComponent(
      `Olá! 👋\n\nSegue o link do documento *${title}* da ETW Art Contabilidade:\n${link}\n\nQualquer dúvida, estamos à disposição.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
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
      <Button variant="outline" onClick={whatsapp} className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border-[#25D366]/30">
        <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
      </Button>
      <Button variant="outline" onClick={email}>
        <Mail className="mr-1 h-4 w-4" /> Enviar por e-mail
      </Button>
      <Button variant="outline" onClick={share}>
        <Share2 className="mr-1 h-4 w-4" /> Compartilhar
      </Button>
    </>
  );
}
