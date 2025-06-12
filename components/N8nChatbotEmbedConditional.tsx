"use client";
import { usePathname } from "next/navigation";
import { N8nChatbotEmbed } from "./N8nChatbotEmbed";

export function N8nChatbotEmbedConditional() {
  const pathname = usePathname();
  const hideChatbot =
    pathname === "/sign-up" ||
    pathname === "/(auth)/sign-up" ||
    pathname === "/sign-in" ||
    pathname === "/(auth)/sign-in";
  if (hideChatbot) return null;
  return <N8nChatbotEmbed />;
}