"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import {
  FaFacebook,
  FaGithub,
  FaSquareInstagram,
  FaLinkedin,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { Bold, Mail } from "lucide-react";
import toast from "react-hot-toast";

type SubscribeResponse = {
  message?: string;
  error?: string;
};

export default function Footer() {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(true);
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (theme) {
      setIsDarkMode(theme === "dark");
    }
  }, [theme]);
  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    await toast.promise(
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(async (res) => {
        const data = (await res.json()) as SubscribeResponse;

        if (!res.ok) {
          return Promise.reject(
            new Error(data.error ?? "Something went wrong."),
          );
        }

        return data;
      }),
      {
        loading: "Subscribing...",
        success: "You've Successfully Subscribed!",
        error: (err: unknown) =>
          err instanceof Error ? err.message : String(err),
      },
    );

    setEmail("");
  };

  return (
    <footer className="w-full overflow-hidden bg-gradient-to-b from-[#F3F5FF] to-[#A599CE] px-6 py-10 pt-16 text-white dark:from-[#070114] dark:to-[#1F0234] md:pt-20 lg:pt-36">
      <div className="mx-auto mb-16 flex max-w-7xl flex-col justify-between gap-y-10 text-center lg:flex-row lg:text-left">
        {/* Branding & Socials */}
        <div className="flex w-full flex-col gap-4 lg:w-[30%]">
          <h1 className="bg-gradient-to-r from-[#562EE7] to-[rgba(116,128,255,0.8)] bg-clip-text font-jost text-5xl font-bold text-transparent dark:to-[#FFC6E8]">
            Papers
          </h1>
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {[
              [
                "https://www.instagram.com/codechefvit/",
                <FaSquareInstagram size={18} key="instagram" />,
              ],
              [
                "https://www.linkedin.com/company/codechefvit/",
                <FaLinkedin size={18} key="linkedin" />,
              ],
              [
                "https://www.youtube.com/@CodeChefVIT",
                <FaYoutube size={18} key="youtube" />,
              ],
              [
                "https://github.com/CodeChefVIT",
                <FaGithub size={18} key="github" />,
              ],
              [
                "https://www.facebook.com/codechefvit/",
                <FaFacebook size={18} key="facebook" />,
              ],
              [
                "https://x.com/codechefvit",
                <FaXTwitter size={18} key="twitter" />,
              ],
            ].map(([href, icon], index) => (
              <Link href={href as string} key={index} target="_blank">
                <Button variant="ghost" className="aspect-square h-10 w-10 p-0">
                  <span className="text-black dark:text-white">{icon}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="flex w-full flex-col gap-2 text-black dark:text-white lg:w-[15%]">
          <h3 className="font-jost text-xl font-semibold">Events</h3>
          <Link href="https://devsoc25.codechefvit.com" target="_blank">
            DevSoc
          </Link>
          <Link href="https://gravitas.codechefvit.com" target="_blank">
            CookOff
          </Link>
          <Link href="https://gravitas.codechefvit.com" target="_blank">
            Clueminati
          </Link>
        </div>
        {/* Projects */}
        <div className="flex w-full flex-col gap-2 text-black dark:text-white lg:w-[20%]">
          <h3 className="font-jost text-xl font-semibold">Our Projects</h3>
          <Link href="https://papers.codechefvit.com" target="_blank">
            Papers
          </Link>
          <Link href="https://contactify.codechefvit.com" target="_blank">
            Contactify
          </Link>
          <Link href="https://ffcs.codechefvit.com" target="_blank">
            FFCS-inator
          </Link>
        </div>

        {/* Suggestions */}
        <div className="flex w-full flex-col items-center gap-1 text-black dark:text-white lg:w-[25%] lg:items-start">
          <Link
            href={`mailto:codechefvit@gmail.com`}
            className="mb-2 flex items-center gap-2 font-jost text-xl font-semibold"
          >
            <Mail size={20} fontWeight="Bold" />
            <span>codechefvit@gmail.com</span>
          </Link>

          <h3 className="my-2 font-jost text-xl font-semibold">
            Subscribe For Updates:
          </h3>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="Enter Your Email"
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={handleSubscribe}
              className="rounded-md bg-[#562EE7] px-4 text-white hover:bg-[#4531b3]"
            >
              Subscribe!
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-8 border-t border-[#130E1F] pt-12 text-center font-play text-lg text-black dark:border-white/10 dark:text-white">
        Made with 💜 by Codechef-VIT
      </p>
    </footer>
  );
}
