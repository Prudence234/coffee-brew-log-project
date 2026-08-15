require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

function validateBrew(body) {
  const { name, method, coffeeGrams, waterGrams, rating } = body;
  if (!String(name || "").trim() || !String(method || "").trim()) return "Name and method are required";
  const coffee = Number(coffeeGrams), water = Number(waterGrams), score = Number(rating);
  if (!Number.isInteger(coffee) || coffee <= 0) return "Coffee grams must be a positive whole number";
  if (!Number.isInteger(water) || water <= 0) return "Water grams must be a positive whole number";
  if (!Number.isInteger(score) || score < 1 || score > 5) return "Rating must be a whole number from 1 to 5";
  return null;
}

function normalizeBrew(body) {
  return {
    name: String(body.name).trim(),
    method: String(body.method).trim(),
    coffeeGrams: Number(body.coffeeGrams),
    waterGrams: Number(body.waterGrams),
    rating: Number(body.rating)
  };
}

// Seven starter brews for the Coffee Brew Log demo.
// Once loaded, normal add/edit/delete behaviour is preserved.
async function ensureStarterBrews() {
  const count = await prisma.brew.count();
  if (count === 0 || count === 2 || count === 7) {
    await prisma.brew.deleteMany();

    const starters = [
      { name: "Ethiopian Yirgacheffe", method: "French Press", coffeeGrams: 20, waterGrams: 210, rating: 4 },
      { name: "67 gyb", method: "Chemex", coffeeGrams: 20, waterGrams: 300, rating: 2 },
      { name: "Sumatra Mandheling", method: "Cold Brew", coffeeGrams: 80, waterGrams: 900, rating: 3 },
      { name: "Kenyan AA", method: "Chemex", coffeeGrams: 22, waterGrams: 330, rating: 5 },
      { name: "Italian Espresso Blend", method: "Espresso", coffeeGrams: 18, waterGrams: 36, rating: 4 },
      { name: "Colombian Supremo", method: "French Press", coffeeGrams: 24, waterGrams: 360, rating: 4 },
      { name: "Morning V60", method: "V60", coffeeGrams: 22, waterGrams: 300, rating: 5 }
    ];

    await prisma.brew.createMany({ data: starters });
  }
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api", (_req, res) => res.json({ message: "Coffee Brew API is running" }));

app.get("/api/brews", async (req, res) => {
  try {
    const method = String(req.query.method || "").trim();
    const brews = await prisma.brew.findMany({ where: method ? { method } : undefined, orderBy: { id: "desc" } });
    res.json(brews);
  } catch (error) {
    console.error("GET BREWS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch brews" });
  }
});

app.post("/api/brews", async (req, res) => {
  try {
    const validationError = validateBrew(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const brew = await prisma.brew.create({ data: normalizeBrew(req.body) });
    res.status(201).json(brew);
  } catch (error) {
    console.error("CREATE BREW ERROR:", error);
    res.status(500).json({ error: "Failed to create brew" });
  }
});

app.put("/api/brews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid brew id" });
    const validationError = validateBrew(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const brew = await prisma.brew.update({ where: { id }, data: normalizeBrew(req.body) });
    res.json(brew);
  } catch (error) {
    console.error("UPDATE BREW ERROR:", error);
    if (error.code === "P2025") return res.status(404).json({ error: "Brew not found" });
    res.status(500).json({ error: "Failed to update brew" });
  }
});

app.delete("/api/brews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid brew id" });
    await prisma.brew.delete({ where: { id } });
    res.json({ message: "Brew deleted successfully" });
  } catch (error) {
    console.error("DELETE BREW ERROR:", error);
    if (error.code === "P2025") return res.status(404).json({ error: "Brew not found" });
    res.status(500).json({ error: "Failed to delete brew" });
  }
});

const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) res.status(404).json({ error: "Frontend not built" });
  });
});

let server;

async function startServer() {
  await prisma.$connect();
  await ensureStarterBrews();
  server = app.listen(PORT, () => console.log(`Coffee Brew API running on http://localhost:${PORT}`));
}

async function shutdown() {
  await prisma.$disconnect();
  if (server) server.close(() => process.exit(0));
  else process.exit(0);
}

startServer().catch(async (error) => {
  console.error("STARTUP ERROR:", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
