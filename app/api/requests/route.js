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
  if (!process.env.ADMIN_PASSWORD || request.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) return unauthorized();
  const db = getRedis();
  if (!db) return NextResponse.json({ error: "Upstash Redis is not configured." }, { status: 503 });
  const raw = await db.zrange("dj-scorpion:requests", 0, -1, { rev: true });
  const requests = raw.map((item) => typeof item === "string" ? JSON.parse(item) : item);
  return NextResponse.json({ requests });
}

export async function DELETE(request) {
  if (!process.env.ADMIN_PASSWORD || request.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) return unauthorized();
  const db = getRedis();
  if (!db) return NextResponse.json({ error: "Upstash Redis is not configured." }, { status: 503 });
  const { id } = await request.json();
  if (typeof id !== "string" || !id) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const raw = await db.zrange("dj-scorpion:requests", 0, -1);
  const match = raw.find((item) => {
    const parsed = typeof item === "string" ? JSON.parse(item) : item;
    return parsed.id === id;
  });
  if (match) await db.zrem("dj-scorpion:requests", typeof match === "string" ? match : JSON.stringify(match));
  return NextResponse.json({ ok: true });
}
