import { NextResponse } from "next/server";

// Free APIs that work everywhere — no config needed!
const WIKI_API = "https://fr.wikipedia.org/w/api.php";
const DUCKDUCKGO = "https://api.duckduckgo.com";

async function fetchPageMeta(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BotanIA/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    // Extract meta description
    const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    if (metaMatch) return metaMatch[1].trim();
    // Extract first <p> with decent length
    const pMatch = html.match(/<p[^>]*>([^<]{60,400})<\/p>/i);
    if (pMatch) return pMatch[1].replace(/\s+/g, " ").trim();
    return "";
  } catch {
    return "";
  }
}

async function searchWikipedia(query: string): Promise<any[]> {
  try {
    const url = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1&srlimit=5&origin=*`;
    const res = await fetch(url, { headers: { "User-Agent": "BotanIA/1.0" } });
    const data = await res.json();
    return (data.query?.search || []).map((item: any) => ({
      url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
      name: item.title,
      snippet: item.snippet.replace(/<[^>]*>/g, ""),
      host_name: "fr.wikipedia.org",
    }));
  } catch {
    return [];
  }
}

async function searchDuckDuckGo(query: string): Promise<any[]> {
  try {
    const url = `${DUCKDUCKGO}/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { headers: { "User-Agent": "BotanIA/1.0" } });
    const data = await res.json();
    const results: any[] = [];
    if (data.Abstract) {
      results.push({
        url: data.AbstractURL || "",
        name: data.Heading || query,
        snippet: data.Abstract,
        host_name: (() => { try { return new URL(data.AbstractURL || "https://duckduckgo.com").hostname; } catch { return "duckduckgo.com"; } })(),
      });
    }
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            url: topic.FirstURL,
            name: topic.Text.slice(0, 80),
            snippet: topic.Text,
            host_name: (() => { try { return new URL(topic.FirstURL).hostname; } catch { return "duckduckgo.com"; } })(),
          });
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function askAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    // Try Pollinations.ai OpenAI-compatible endpoint
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        seed: 42,
      }),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Check it's actually JSON/text, not HTML
    if (text.trim().startsWith("<")) return null;
    return text;
  } catch {
    return null;
  }
}

function extractDataFromSnippets(snippets: string[], type: string): Record<string, any> {
  // Simple extraction without AI — parse keywords from search results
  const fullText = snippets.join(" ");

  const data: Record<string, any> = {};

  if (type === "boutique") {
    // Try to detect shop type
    if (fullText.toLowerCase().includes("association")) data.type = "Association";
    else if (fullText.toLowerCase().includes("coopérative") || fullText.toLowerCase().includes("cooperative")) data.type = "Coopérative";
    else if (fullText.toLowerCase().includes("entreprise")) data.type = "Entreprise";
    else if (fullText.toLowerCase().includes("familial")) data.type = "Semencier familial";
    else data.type = "Semencier";

    // Detect origin
    if (fullText.toLowerCase().includes("ariège") || fullText.toLowerCase().includes("occitanie")) data.origine = "Ariège, Occitanie, France";
    else if (fullText.toLowerCase().includes("france")) data.origine = "France";
    else data.origine = "France";

    // Detect specialties
    const specs: string[] = [];
    if (fullText.toLowerCase().includes("tomate")) specs.push("Tomates");
    if (fullText.toLowerCase().includes("légume") || fullText.toLowerCase().includes("potager")) specs.push("Légumes");
    if (fullText.toLowerCase().includes("ancien") || fullText.toLowerCase().includes("variétés anciennes")) specs.push("Variétés anciennes");
    if (fullText.toLowerCase().includes("bio") || fullText.toLowerCase().includes("biologique")) specs.push("Agriculture biologique");
    if (fullText.toLowerCase().includes("aromatique")) specs.push("Aromatiques");
    if (fullText.toLowerCase().includes("fleur")) specs.push("Fleurs comestibles");
    if (specs.length === 0) specs.push("Semences potagères");
    data.specialites = specs;

    // Detect variety count
    const numMatch = fullText.match(/(\d[\d\s.]*)\s*(variétés|références|espèces|variétés au)/i);
    if (numMatch) data.nbVarietes = numMatch[1].replace(/\s/g, "");

    data.color = "from-orange-50 to-amber-50";
    data.borderColor = "border-orange-200";

  } else {
    // For plantes / varietes
    const harvestMatch = fullText.match(/(\d+)\s*(jours?|j)\s*(récolte|de culture|de croissance|à maturité)/i)
      || fullText.match(/récolte.*?(\d+)/i);
    if (harvestMatch) data.harvestDays = parseInt(harvestMatch[1]);

    const tempMatch = fullText.match(/(\d+)\s*[àa-]\s*(\d+)\s*°C/i);
    if (tempMatch) {
      data.tempMin = parseInt(tempMatch[1]);
      data.tempMax = parseInt(tempMatch[2]);
    }

    data.waterNeed = 4;
    data.lightNeed = 8;
    data.diseaseRes = 40;
    data.pestRes = 40;
    data.optimalMonths = [2, 3, 4];
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const { query, type } = await request.json();

    if (!query) {
      return NextResponse.json({ success: false, error: "Query requis" }, { status: 400 });
    }

    // Search from multiple free sources in parallel
    let searchQuery = query;
    if (type === "boutique") {
      searchQuery = `${query} semences graines boutique France`;
    } else if (type === "variete") {
      searchQuery = `${query} variété graine semence caractéristiques`;
    } else {
      searchQuery = `${query} culture potager semis récolte`;
    }

    const [wikiResults, ddgResults] = await Promise.all([
      searchWikipedia(searchQuery),
      searchDuckDuckGo(searchQuery),
    ]);

    // Combine and deduplicate
    const allResults = [...wikiResults, ...ddgResults];
    const seen = new Set<string>();
    const searchResults = allResults.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return r.url && r.name;
    }).slice(0, 8);

    // Gather all snippets — filter out Wikipedia citations/references
    const allSnippets = searchResults
      .map((r: any) => r.snippet)
      .filter((s: string) => {
        if (!s || s.length < 40) return false;
        if (s.startsWith("<")) return false;
        if (/^p\.\s*\d/.test(s)) return false;
        if (/^«\s*.*\s*»,\s*sur/i.test(s)) return false;
        if (/consulté le/i.test(s)) return false;
        return true;
      });

    // Get DuckDuckGo abstract as best description source
    const ddgAbstract = ddgResults.find((r: any) => r.snippet && r.snippet.length > 50);
    let bestSnippet = ddgAbstract?.snippet || "";

    // Try scraping the first non-Wikipedia result for meta description
    if (!bestSnippet || bestSnippet.length < 50) {
      const firstReal = searchResults.find((r: any) => r.host_name !== "fr.wikipedia.org" && r.url);
      if (firstReal) {
        const meta = await fetchPageMeta(firstReal.url);
        if (meta && meta.length > 30) bestSnippet = meta;
      }
    }
    // Also try Wikipedia extracts API for a clean summary
    if (wikiResults.length > 0 && (!bestSnippet || bestSnippet.length < 50)) {
      try {
        const title = wikiResults[0].name;
        const extractUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
        const extRes = await fetch(extractUrl, { headers: { "User-Agent": "BotanIA/1.0" } });
        const extData = await extRes.json();
        const pages = extData.query?.pages;
        if (pages) {
          const page = Object.values(pages)[0] as any;
          if (page?.extract && page.extract.length > 50) bestSnippet = page.extract.slice(0, 400);
        }
      } catch { /* ignore */ }
    }

    // Try AI extraction first, fallback to keyword extraction
    let aiData: Record<string, any> = {};
    const aiSource = await askAI(
      "Tu extrais des données structurées. Réponds UNIQUEMENT en JSON valide sans markdown ni backticks.",
      `Extrais des données sur "${query}" (type: ${type}) depuis ces résultats:\n\n${allSnippets.join("\n\n")}`
    );

    if (aiSource) {
      try {
        const cleaned = aiSource.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) aiData = JSON.parse(jsonMatch[0]);
      } catch { /* AI failed, use fallback */ }
    }

    // If AI didn't return useful data, use keyword extraction
    const badDesc = !aiData.description || aiData.description.startsWith("<") || aiData.description.startsWith("p.") || aiData.description.includes("consulté le");
    if (badDesc) {
      aiData = { ...aiData, ...extractDataFromSnippets(allSnippets, type) };
      if (bestSnippet && bestSnippet.length > 50) {
        let desc = bestSnippet.slice(0, 400).replace(/\s+/g, " ").trim();
        if (!desc.endsWith(".")) {
          const lastDot = desc.lastIndexOf(".");
          if (lastDot > 0) desc = desc.slice(0, lastDot + 1);
        }
        aiData.description = desc;
      } else {
        aiData.description = `${query} — données extraites des résultats de recherche`;
      }
    }

    aiData._source = aiSource && !badDesc ? "ai" : "keywords";

    return NextResponse.json({
      success: true,
      searchResults,
      aiData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
