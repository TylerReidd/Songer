"use client";

import { useSyncExternalStore } from "react";
import { greetingForHour } from "@/lib/format";

const subscribe = () => () => {};
const getClientGreeting = () => greetingForHour(new Date().getHours());
const getServerGreeting = () => "Welcome back";

/**
 * The greeting depends on the visitor's local clock, which the server cannot
 * know. useSyncExternalStore renders the neutral server value during
 * prerender and hydration, then the client value immediately after, without
 * a setState-in-effect round trip.
 */
export function Greeting({ name }: { name: string | null }) {
  const greeting = useSyncExternalStore(subscribe, getClientGreeting, getServerGreeting);
  return (
    <>
      {greeting}
      {name ? `, ${name.split(" ")[0]}` : ""}
    </>
  );
}
