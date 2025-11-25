import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

// Decode gmail base64url payload
function decodeBase64Url(str: string) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

function extractHeaders(headers: any[], name: string) {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function walkPartsForBody(part: any, out: { text: string; html: string }) {
  if (!part) return;
  if (part.mimeType === "text/plain" && part.body?.data) {
    out.text += decodeBase64Url(part.body.data);
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    out.html += decodeBase64Url(part.body.data);
  }
  if (part.parts && Array.isArray(part.parts)) {
    for (const p of part.parts) walkPartsForBody(p, out);
  }
}

export async function importUserGmail(refreshToken: string, userId: string, opts?: { pageSize?: number; maxTotal?: number; after?: string }) {
  const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const pageSize = Math.min(Math.max(1, opts?.pageSize ?? 200), 500);
    const maxTotal = opts?.maxTotal ?? 1000; // default limit to avoid huge imports

    let imported = 0;
    const errors: Array<{ id: string; error: string }> = [];
    let allMessages: Array<{ id?: string }> = [];

    let nextPageToken: string | undefined = undefined;
    do {
      // Si se especifica after, usar query para filtrar por fecha
      let q = undefined;
      if (opts?.after) {
        // Gmail query: after:YYYY/MM/DD
        const afterDate = new Date(opts.after);
        const y = afterDate.getFullYear();
        const m = String(afterDate.getMonth() + 1).padStart(2, '0');
        const d = String(afterDate.getDate()).padStart(2, '0');
        q = `after:${y}/${m}/${d}`;
      }
      const listRes = await gmail.users.messages.list({ userId: "me", maxResults: pageSize, pageToken: nextPageToken, q });
      const msgs = listRes.data.messages || [];
      allMessages.push(...(msgs as any));
      nextPageToken = listRes.data.nextPageToken as string | undefined;
      if (allMessages.length >= maxTotal) break;
    } while (nextPageToken);

    // Trim to maxTotal
    const messages = allMessages.slice(0, maxTotal);

    for (const m of messages) {
      if (!m.id) continue;
      try {
        const msg = await gmail.users.messages.get({ userId: "me", id: m.id, format: "full" });
        const payload = msg.data.payload as any;
        const headers = payload?.headers || [];
        const from = extractHeaders(headers, "From") || extractHeaders(headers, "Sender") || "";
        const subject = extractHeaders(headers, "Subject") || "(sin asunto)";
        const dateHeader = extractHeaders(headers, "Date");
        const receivedAt = dateHeader ? new Date(dateHeader) : new Date();

        // Filtrar por fecha si se especifica opts.after
        if (opts?.after) {
          const afterDate = new Date(opts.after);
          if (receivedAt < afterDate) continue;
        }

        const out = { text: "", html: "" };
        walkPartsForBody(payload, out);
        let body = out.text || out.html || (msg.data.snippet || "");

        try {
          await prisma.email.create({
            data: {
              userId,
              externalId: m.id,
              sender: from,
              receivedAt,
              subject,
              body,
            },
          });
          imported += 1;
        } catch (dbErr: any) {
          const code = dbErr?.code || dbErr?.message;
          if (String(code).toLowerCase().includes("p2002") || String(dbErr?.message || "").toLowerCase().includes("unique")) {
            // duplicate - ignore
          } else {
            errors.push({ id: m.id, error: String(dbErr?.message || dbErr) });
          }
        }
      } catch (err) {
        errors.push({ id: m.id, error: String(err) });
      }
    }

    return { imported, totalFound: allMessages.length, errors };
}
