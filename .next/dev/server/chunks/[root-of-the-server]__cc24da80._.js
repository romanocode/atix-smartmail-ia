module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/pages/api/emails/index.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [api] (ecmascript)");
;
const DEMO_USER_EMAIL = "demo@local";
async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({
        error: "Method not allowed"
    });
    try {
        const q = req.query.q || "";
        const sort = req.query.sort || "desc"; // by receivedAt
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["prisma"].user.upsert({
            where: {
                email: DEMO_USER_EMAIL
            },
            update: {},
            create: {
                email: DEMO_USER_EMAIL,
                name: "Demo User"
            }
        });
        const where = q ? {
            userId: user.id,
            OR: [
                {
                    sender: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    subject: {
                        contains: q,
                        mode: "insensitive"
                    }
                }
            ]
        } : {
            userId: user.id
        };
        const emails = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["prisma"].email.findMany({
            where,
            orderBy: {
                receivedAt: sort === "asc" ? "asc" : "desc"
            },
            take: 500
        });
        return res.status(200).json({
            ok: true,
            emails
        });
    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            details: String(err)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cc24da80._.js.map