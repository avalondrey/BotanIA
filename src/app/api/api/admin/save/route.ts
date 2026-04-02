import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "public", "data", "custom-cards.json");

function readCustomCards() {
  if (!existsSync(DATA_FILE)) {
    const empty = { shops: [], varieties: [], plantules: [], seeds: [] };
    writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
  const raw = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeCustomCards(data: any) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  try {
    const { type, card } = await request.json();

    if (!type || !card) {
      return NextResponse.json({ success: false, error: "Type et card requis" }, { status: 400 });
    }

    const data = readCustomCards();

    if (type === "boutique") {
      // Check duplicate
      const idx = data.shops.findIndex((s: any) => s.id === card.id);
      if (idx >= 0) {
        data.shops[idx] = { ...data.shops[idx], ...card };
      } else {
        data.shops.push(card);
      }
    } else if (type === "variete") {
      const idx = data.varieties.findIndex((v: any) => v.id === card.id);
      if (idx >= 0) {
        data.varieties[idx] = { ...data.varieties[idx], ...card };
      } else {
        data.varieties.push(card);
      }
    } else if (type === "plantule") {
      const idx = data.plantules.findIndex((p: any) => p.id === card.id);
      if (idx >= 0) {
        data.plantules[idx] = { ...data.plantules[idx], ...card };
      } else {
        data.plantules.push(card);
      }
    } else if (type === "graine") {
      const idx = data.seeds.findIndex((s: any) => s.id === card.id);
      if (idx >= 0) {
        data.seeds[idx] = { ...data.seeds[idx], ...card };
      } else {
        data.seeds.push(card);
      }
    } else {
      return NextResponse.json({ success: false, error: "Type invalide" }, { status: 400 });
    }

    writeCustomCards(data);

    return NextResponse.json({
      success: true,
      message: `${type} "${card.id}" sauvegardé !`,
      cards: data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = readCustomCards();
    return NextResponse.json({ success: true, cards: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
