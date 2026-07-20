import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(120),
  artist: z.string().trim().max(100).optional().default(""),
  note: z.string().trim().max(240).optional().default(""),
  website: z.string().max(0).optional(),
});

function unauthorized() {
  return NextResponse.json({ error: "Incorrect DJ password." }, { status: 401 });
}

function parseItem(item) {
  if (!item) return null;
  return typeof item === "string" ? JSON.parse(item) : item;
}

function memberValue(item) {
  return typeof item === "string" ? item : JSON.stringify(item);
}

function isAdmin(request) {
  return Boolean(process.env.ADMIN_PASSWORD) && request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(request) {
  try {
    const data = requestSchema.parse(await request.json());
    const db = getRedis();
    if (!db) return NextResponse.json({ error: "Requests aren’t connected yet. Please tell the DJ." }, { status: 503 });

    const forwarded = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwarded.split(",")[0].trim();
    const rateKey = `request-rate:${ip}`;
    const count = await db.incr(rateKey);
    if (count === 1) await db.expire(rateKey, 60);
    if (count > 4) return NextResponse.json({ error: "Easy there—please wait a minute before sending more." }, { status: 429 });

    const id = randomUUID();
    const songRequest = {
      id,
      name: data.name,
      title: data.title,
      artist: data.artist,
      note: data.note,
      createdAt: new Date().toISOString(),
    };

    await db.zadd("dj-scorpion:requests", { score: Date.now(), member: JSON.stringify(songRequest) });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET(request) {
  const suppliedPassword = request.headers.get("x-admin-password");
  if (suppliedPassword && !isAdmin(request)) return unauthorized();
  const db = getRedis();
  if (!db) return NextResponse.json({ error: "Upstash Redis is not configured." }, { status: 503 });
  const [rawRequests, rawNowPlaying] = await Promise.all([
    db.zrange("dj-scorpion:requests", 0, -1),
    db.get("dj-scorpion:now-playing"),
  ]);
  const requests = rawRequests.map(parseItem);
  const nowPlaying = parseItem(rawNowPlaying);

  if (!isAdmin(request)) {
    return NextResponse.json(
      { requests, nowPlaying },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const rawPlayed = await db.zrange("dj-scorpion:played", 0, -1, { rev: true });
  return NextResponse.json({ requests, nowPlaying, played: rawPlayed.map(parseItem) });
}

export async function PATCH(request) {
  if (!isAdmin(request)) return unauthorized();
  const db = getRedis();
  if (!db) return NextResponse.json({ error: "Upstash Redis is not configured." }, { status: 503 });
  const { action } = await request.json();

  if (action === "play") {
    const current = await db.get("dj-scorpion:now-playing");
    if (current) return NextResponse.json({ error: "Stop the current song before playing another." }, { status: 409 });

    const first = (await db.zrange("dj-scorpion:requests", 0, 0))[0];
    if (!first) return NextResponse.json({ error: "The request queue is empty." }, { status: 409 });

    const song = parseItem(first);
    await db.multi()
      .zrem("dj-scorpion:requests", memberValue(first))
      .set("dj-scorpion:now-playing", JSON.stringify({ ...song, startedAt: new Date().toISOString() }))
      .exec();
    return NextResponse.json({ ok: true });
  }

  if (action === "stop") {
    const current = await db.get("dj-scorpion:now-playing");
    if (!current) return NextResponse.json({ error: "No song is currently playing." }, { status: 409 });

    const song = parseItem(current);
    const playedSong = { ...song, playedAt: new Date().toISOString() };
    await db.multi()
      .del("dj-scorpion:now-playing")
      .zadd("dj-scorpion:played", { score: Date.now(), member: JSON.stringify(playedSong) })
      .exec();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown queue action." }, { status: 400 });
}

export async function DELETE(request) {
  if (!process.env.ADMIN_PASSWORD || request.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) return unauthorized();
  const db = getRedis();
  if (!db) return NextResponse.json({ error: "Upstash Redis is not configured." }, { status: 503 });
  const { id } = await request.json();
  if (typeof id !== "string" || !id) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const raw = await db.zrange("dj-scorpion:requests", 0, -1);
  const match = raw.find((item) => {
    const parsed = parseItem(item);
    return parsed.id === id;
  });
  if (match) await db.zrem("dj-scorpion:requests", memberValue(match));
  return NextResponse.json({ ok: true });
}
