"use client";

import { m } from "framer-motion";
import { Download, Share2, Sparkles, Wand2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { generateOracleProphecy } from "@/lib/engines/ai/oracle-voice";
import type { UniversalProfile } from "@/lib/ontology/engine/types";

interface ViralShareProps {
  profile: UniversalProfile;
}

export function ViralShare({ profile }: ViralShareProps) {
  const locale = useLocale();
  const tOntology = useTranslations("ontology");
  const [prophecy, setProphecy] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Generate prophecy on mount (or could be on button click to save tokens)
  // Let's do it on mount but only if premium/ready.
  // For now, auto-generate for the "Viral Spell" effect.
  useEffect(() => {
    let mounted = true;

    async function fetchProphecy() {
      setLoading(true);
      try {
        // AI Server Action Call
        const text = await generateOracleProphecy(profile, locale);
        if (mounted) {
          setProphecy(text);

          // Construct OG URL
          const params = new URLSearchParams();
          params.set("name", profile.input.fullName || "Seeker");
          // Update to use new object structure (EgyptianDeity / CelticTreeSign)
          // We use English names as fallback or main value if keys are gone
          const guardian = profile.mythos?.egyptian?.patronDeity.name || "";
          const tree = profile.mythos?.celtic?.name || ""; // Celtic name e.g. 'Birch'

          params.set("guardian", guardian);
          params.set("tree", tree);
          params.set("prophecy", text);
          params.set("locale", locale);

          setImageUrl(`/api/og/origin?${params.toString()}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProphecy();
    return () => {
      mounted = false;
    };
  }, [profile, locale]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: prophecy,
          title: "My Universal Origin",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
          <Wand2 className="w-3 h-3" />
          Viral Spell
        </div>
        <h3 className="text-2xl font-serif text-white">
          {tOntology("viralShare.title", {
            defaultMessage: "Proclaim Your Mythos",
          })}
        </h3>
      </div>

      {/* Card Preview */}
      <div className="relative aspect-[1.91/1] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 text-green-400 animate-spin" />
              <span className="text-xs text-green-300 animate-pulse">
                Gemini invoking oracle...
              </span>
            </div>
          </div>
        ) : (
          imageUrl && (
            <Image
              alt="Origin Card"
              className="object-cover"
              fill
              src={imageUrl}
            />
          )
        )}

        {/* Overlay Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button
          className="bg-green-600 hover:bg-green-500 text-white rounded-full px-8"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {tOntology("viralShare.shareStory", {
            defaultMessage: "Share Story",
          })}
        </Button>

        {imageUrl && (
          <Button
            className="border-white/10 text-green-800/50 hover:bg-white/5 rounded-full px-4"
            onClick={() => window.open(imageUrl, "_blank")}
            variant="outline"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-xs text-green-600 italic">&quot;{prophecy}&quot;</p>
    </div>
  );
}
