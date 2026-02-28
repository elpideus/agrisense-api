/**
 * @file seed.ts
 * @description Prisma seed script — populates the Agrisense database with realistic
 *   mock data covering all models: Users, Fields, Species, Varieties, BloomStages,
 *   Crops, Problems, Devices, Readings, Reports, ReportNotes, Harvests, and Images.
 *
 * Run via:  npm run db:seed
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, DeviceType, UpdateInterval, ReportStatus, ProblemCategory, Progression } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a random element from the provided array.
 * @template T
 * @param {T[]} arr - The source array.
 * @returns {T} A random element.
 */
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a random integer between min and max (inclusive).
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} Random integer.
 */
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random float between min and max, rounded to the given decimal places.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {number} Random float.
 */
function randFloat(min: number, max: number, decimals = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * Returns a Date offset by `daysAgo` days from today.
 * @param {number} daysAgo - Number of days to go back.
 * @returns {Date} The adjusted date.
 */
function daysAgo(daysAgo: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
}

/**
 * Generates a fake MAC address in the form "XX:XX:XX:XX:XX:XX".
 * @param {number} seed - Numeric seed to produce a deterministic address.
 * @returns {string} MAC address string.
 */
function fakeMac(seed: number): string {
    const hex = seed.toString(16).padStart(12, "0");
    return hex.match(/.{2}/g)!.join(":").toUpperCase();
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    console.log("🌱  Starting seed…");

    console.log("  → Cleaning database...");
    await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE 
            "Image", "Harvest", "ReportNote", "ReportCrop", "ProblemSpecies", 
            "Report", "Reading", "Device", "Crop", "BloomStage", "Variety", 
            "Problem", "Species", "Field", "User"
        CASCADE;
    `);

    // -------------------------------------------------------------------------
    // 1. Users
    // -------------------------------------------------------------------------
    console.log("  → Users");

    const [alice, bob, carla] = await Promise.all([
        prisma.user.create({
            data: {
                name: "Alice Rossi",
                email: "alice.rossi@agrisense.dev",
                password: "$2b$10$mockhashforaliceXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                phone: "+39 333 1111111",
            },
        }),
        prisma.user.create({
            data: {
                name: "Bob Verdi",
                email: "bob.verdi@agrisense.dev",
                password: "$2b$10$mockhashforbobXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                phone: "+39 333 2222222",
            },
        }),
        prisma.user.create({
            data: {
                name: "Carla Bianchi",
                email: "carla.bianchi@agrisense.dev",
                password: "$2b$10$mockhashforcarlaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            },
        }),
    ]);

    // -------------------------------------------------------------------------
    // 2. Fields  (gps_coords is a PostGIS geography — must use raw SQL)
    // -------------------------------------------------------------------------
    console.log("  → Fields");

    /**
     * Creates a Field row using a raw SQL INSERT to handle the PostGIS geography column,
     * then retrieves it so we have the generated UUID available in JS.
     *
     * @param {string} userId - Owner user UUID.
     * @param {string} name - User-visible field name.
     * @param {number} lon - Longitude (WGS84).
     * @param {number} lat - Latitude (WGS84).
     * @param {boolean} [isBio=false] - Whether the field is certified organic.
     * @returns {Promise<{ id: string }>} An object containing the new field's UUID.
     */
    async function createField(
        userId: string,
        name: string,
        lon: number,
        lat: number,
        isBio = false,
    ): Promise<{ id: string }> {
        await prisma.$executeRawUnsafe(
            `INSERT INTO "Field" (id, created_at, name, gps_coords, is_bio, user_id)
       VALUES (gen_random_uuid(), now(), $1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5::uuid)`,
            name,
            lon,
            lat,
            isBio,
            userId,
        );
        const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
            `SELECT id::text FROM "Field" WHERE name = $1 AND user_id = $2::uuid ORDER BY created_at DESC LIMIT 1`,
            name,
            userId,
        );
        return rows[0];
    }

    const fieldAlice1 = await createField(alice.id, "North Orchard — Apple", 11.1194, 46.0664, true);
    const fieldAlice2 = await createField(alice.id, "South Vineyard — Pinot Grigio", 11.1302, 46.0591);
    const fieldBob1 = await createField(bob.id, "East Greenhouse — Tomatoes", 11.2501, 45.9812);
    const fieldBob2 = await createField(bob.id, "West Field — Wheat", 11.2389, 45.9760, true);
    const fieldCarla1 = await createField(carla.id, "Hillside Olive Grove", 11.3050, 45.8900, true);

    // -------------------------------------------------------------------------
    // 3. Species & Varieties
    // -------------------------------------------------------------------------
    console.log("  → Species & Varieties");

    const appleSpecies = await prisma.species.create({
        data: {
            common_name: "Apple",
            scientific_name: "Malus domestica",
            varieties: {
                create: [
                    { name: "Golden Delicious" },
                    { name: "Fuji" },
                    { name: "Gala" },
                ],
            },
        },
        include: { varieties: true },
    });

    const grapeSpecies = await prisma.species.create({
        data: {
            common_name: "Grapevine",
            scientific_name: "Vitis vinifera",
            varieties: {
                create: [
                    { name: "Pinot Grigio" },
                    { name: "Chardonnay" },
                ],
            },
        },
        include: { varieties: true },
    });

    const tomatoSpecies = await prisma.species.create({
        data: {
            common_name: "Tomato",
            scientific_name: "Solanum lycopersicum",
            varieties: {
                create: [
                    { name: "San Marzano" },
                    { name: "Datterini" },
                ],
            },
        },
        include: { varieties: true },
    });

    const wheatSpecies = await prisma.species.create({
        data: {
            common_name: "Common Wheat",
            scientific_name: "Triticum aestivum",
            varieties: {
                create: [{ name: "Bologna" }],
            },
        },
        include: { varieties: true },
    });

    const oliveSpecies = await prisma.species.create({
        data: {
            common_name: "Olive",
            scientific_name: "Olea europaea",
            varieties: {
                create: [
                    { name: "Frantoio" },
                    { name: "Leccino" },
                ],
            },
        },
        include: { varieties: true },
    });

    // -------------------------------------------------------------------------
    // 4. BloomStages
    // -------------------------------------------------------------------------
    console.log("  → BloomStages");

    const goldenDelicious = appleSpecies.varieties[0];
    const pinot = grapeSpecies.varieties[0];

    await prisma.bloomStage.createMany({
        data: [
            // Apple — Golden Delicious
            { name: "Dormancy", number: 1, crit_temp_10: -10.0, crit_temp_90: -15.0, variety_id: goldenDelicious.id },
            { name: "Bud Swell", number: 2, crit_temp_10: -6.0, crit_temp_90: -9.0, variety_id: goldenDelicious.id },
            { name: "Green Tip", number: 3, crit_temp_10: -4.0, crit_temp_90: -7.0, variety_id: goldenDelicious.id },
            { name: "Half-inch Green", number: 4, crit_temp_10: -2.0, crit_temp_90: -4.5, variety_id: goldenDelicious.id },
            { name: "Tight Cluster", number: 5, crit_temp_10: -2.0, crit_temp_90: -4.5, variety_id: goldenDelicious.id },
            { name: "Pink", number: 6, crit_temp_10: -2.0, crit_temp_90: -4.0, variety_id: goldenDelicious.id },
            { name: "Full Bloom", number: 7, crit_temp_10: -2.0, crit_temp_90: -3.9, variety_id: goldenDelicious.id },
            { name: "Petal Fall", number: 8, crit_temp_10: -2.0, crit_temp_90: -2.5, variety_id: goldenDelicious.id },
            // Pinot Grigio
            { name: "Bud Burst", number: 1, crit_temp_10: -3.0, crit_temp_90: -5.0, variety_id: pinot.id },
            { name: "Leaf Unfolding", number: 2, crit_temp_10: -1.5, crit_temp_90: -3.5, variety_id: pinot.id },
            { name: "Inflorescence", number: 3, crit_temp_10: -1.0, crit_temp_90: -2.5, variety_id: pinot.id },
            { name: "Flowering", number: 4, crit_temp_10: -0.5, crit_temp_90: -2.0, variety_id: pinot.id },
        ],
    });

    const appleBloomStages = await prisma.bloomStage.findMany({ where: { variety_id: goldenDelicious.id }, orderBy: { number: "asc" } });
    const grapeBloomStages = await prisma.bloomStage.findMany({ where: { variety_id: pinot.id }, orderBy: { number: "asc" } });

    // -------------------------------------------------------------------------
    // 5. Crops
    // -------------------------------------------------------------------------
    console.log("  → Crops");

    const appleCrop = await prisma.crop.create({
        data: {
            field_id: fieldAlice1.id,
            variety_id: goldenDelicious.id,
            planted_at: daysAgo(730),
            current_bloom_stage_id: appleBloomStages[5].id, // "Pink"
        },
    });

    const fujiCrop = await prisma.crop.create({
        data: {
            field_id: fieldAlice1.id,
            variety_id: appleSpecies.varieties[1].id, // Fuji
            planted_at: daysAgo(365),
        },
    });

    const pinotCrop = await prisma.crop.create({
        data: {
            field_id: fieldAlice2.id,
            variety_id: pinot.id,
            planted_at: daysAgo(1460),
            current_bloom_stage_id: grapeBloomStages[1].id, // "Leaf Unfolding"
        },
    });

    const tomatoCrop = await prisma.crop.create({
        data: {
            field_id: fieldBob1.id,
            variety_id: tomatoSpecies.varieties[0].id, // San Marzano
            planted_at: daysAgo(60),
        },
    });

    const wheatCrop = await prisma.crop.create({
        data: {
            field_id: fieldBob2.id,
            variety_id: wheatSpecies.varieties[0].id,
            planted_at: daysAgo(180),
        },
    });

    const oliveCrop = await prisma.crop.create({
        data: {
            field_id: fieldCarla1.id,
            variety_id: oliveSpecies.varieties[0].id, // Frantoio
            planted_at: daysAgo(3650),
        },
    });

    // -------------------------------------------------------------------------
    // 6. Problems & ProblemSpecies
    // -------------------------------------------------------------------------
    console.log("  → Problems");

    const fireBlightProblem = await prisma.problem.create({
        data: {
            name: "Fire Blight",
            category: ProblemCategory.DISEASE,
            description: "Bacterial disease caused by Erwinia amylovora, affecting shoots and blossoms.",
            species: { create: [{ species_id: appleSpecies.id }] },
        },
    });

    const powderyMildewProblem = await prisma.problem.create({
        data: {
            name: "Powdery Mildew",
            category: ProblemCategory.DISEASE,
            description: "Fungal disease leaving white powdery coating on leaves and young shoots.",
            species: { create: [{ species_id: grapeSpecies.id }, { species_id: appleSpecies.id }] },
        },
    });

    const aphidsProblem = await prisma.problem.create({
        data: {
            name: "Aphid Infestation",
            category: ProblemCategory.PEST,
            description: "Sap-sucking insects that can cause leaf curling, stunted growth, and sooty mould.",
            species: { create: [{ species_id: appleSpecies.id }, { species_id: tomatoSpecies.id }] },
        },
    });

    const frostProblem = await prisma.problem.create({
        data: {
            name: "Late Spring Frost",
            category: ProblemCategory.ABIOTIC,
            description: "Cold-snap below critical bloom thresholds killing blossoms.",
            species: { create: [{ species_id: appleSpecies.id }, { species_id: grapeSpecies.id }] },
        },
    });

    const nutrientDeficiencyProblem = await prisma.problem.create({
        data: {
            name: "Iron Chlorosis",
            category: ProblemCategory.ABIOTIC,
            description: "Iron deficiency causing interveinal yellowing, common in alkaline soils.",
        },
    });

    // -------------------------------------------------------------------------
    // 7. Devices
    // -------------------------------------------------------------------------
    console.log("  → Devices");

    const masterDev1 = await prisma.device.create({
        data: {
            mac: fakeMac(1),
            name: "Master Hub — North Orchard",
            device_type: DeviceType.MASTER,
            is_active: true,
            is_sold: true,
            user_id: alice.id,
            field_id: fieldAlice1.id,
        },
    });

    const slaveDev1 = await prisma.device.create({
        data: {
            mac: fakeMac(2),
            name: "Sensor Node A — North Orchard",
            device_type: DeviceType.SLAVE,
            update_interval: UpdateInterval.NORMAL,
            is_sold: true,
            user_id: alice.id,
            field_id: fieldAlice1.id,
            master_mac: masterDev1.mac,
        },
    });

    const slaveDev2 = await prisma.device.create({
        data: {
            mac: fakeMac(3),
            name: "Sensor Node B — North Orchard",
            device_type: DeviceType.SLAVE,
            update_interval: UpdateInterval.HIGH,
            is_sold: true,
            user_id: alice.id,
            field_id: fieldAlice1.id,
            master_mac: masterDev1.mac,
        },
    });

    const masterDev2 = await prisma.device.create({
        data: {
            mac: fakeMac(4),
            name: "Master Hub — South Vineyard",
            device_type: DeviceType.MASTER,
            is_active: false,
            is_sold: true,
            user_id: alice.id,
            field_id: fieldAlice2.id,
        },
    });

    const slaveDev3 = await prisma.device.create({
        data: {
            mac: fakeMac(5),
            name: "Sensor Node — South Vineyard",
            device_type: DeviceType.SLAVE,
            update_interval: UpdateInterval.LOW,
            is_sold: true,
            user_id: alice.id,
            field_id: fieldAlice2.id,
            master_mac: masterDev2.mac,
        },
    });

    const masterDev3 = await prisma.device.create({
        data: {
            mac: fakeMac(6),
            name: "Master Hub — East Greenhouse",
            device_type: DeviceType.MASTER,
            is_active: true,
            is_sold: true,
            user_id: bob.id,
            field_id: fieldBob1.id,
        },
    });

    const slaveDev4 = await prisma.device.create({
        data: {
            mac: fakeMac(7),
            name: "Sensor Node — East Greenhouse",
            device_type: DeviceType.SLAVE,
            update_interval: UpdateInterval.NORMAL,
            is_sold: true,
            user_id: bob.id,
            field_id: fieldBob1.id,
            master_mac: masterDev3.mac,
        },
    });

    // Unsold/unassigned device in inventory
    await prisma.device.create({
        data: {
            mac: fakeMac(8),
            name: "Spare Slave Unit #8",
            device_type: DeviceType.SLAVE,
            is_sold: false,
            user_id: alice.id,
        },
    });

    // -------------------------------------------------------------------------
    // 8. Readings (30 per slave device, spanning the past 2.5 hours)
    // -------------------------------------------------------------------------
    console.log("  → Readings");

    /**
     * Generates a batch of mock telemetry readings for a slave device and inserts
     * them using createMany.
     *
     * @param {string} mac - MAC address of the slave device.
     * @param {UpdateInterval} interval - Polling interval that determines timestamp spacing.
     * @param {number} count - Number of readings to generate.
     * @returns {Promise<void>}
     */
    async function seedReadings(mac: string, interval: UpdateInterval, count: number): Promise<void> {
        const minuteGap = interval === UpdateInterval.HIGH ? 1 : interval === UpdateInterval.NORMAL ? 5 : 25;
        const readings = Array.from({ length: count }, (_, i) => {
            const ts = new Date(Date.now() - (count - i) * minuteGap * 60_000);
            const baseTemp = randFloat(-2, 22);
            return {
                device_mac: mac,
                created_at: ts,
                temperature: baseTemp,
                humidity: randFloat(40, 95),
                pressure: randFloat(990, 1030),
                battery_value: randInt(15, 100),
                tbu: randFloat(0, 500, 4),
                state: interval,
                error_code: Math.random() < 0.05 ? 8 : 0, // 5% chance of low battery flag
                rssi: randInt(-100, -40),
            };
        });
        await prisma.reading.createMany({ data: readings });
    }

    await seedReadings(slaveDev1.mac, UpdateInterval.NORMAL, 30);
    await seedReadings(slaveDev2.mac, UpdateInterval.HIGH, 30);
    await seedReadings(slaveDev3.mac, UpdateInterval.LOW, 30);
    await seedReadings(slaveDev4.mac, UpdateInterval.NORMAL, 30);

    // -------------------------------------------------------------------------
    // 9. Reports, ReportNotes, ReportCrops
    // -------------------------------------------------------------------------
    console.log("  → Reports");

    const fireBlightReport = await prisma.report.create({
        data: {
            title: "Fire Blight outbreak — Row 3",
            description: "Shepherd's crook wilting observed on several Golden Delicious shoots.",
            status: ReportStatus.OPEN,
            created_at: daysAgo(14),
            problem_id: fireBlightProblem.id,
            field_id: fieldAlice1.id,
            crops: { create: [{ crop_id: appleCrop.id }] },
            notes: {
                create: [
                    {
                        created_at: daysAgo(14),
                        content: "Initial inspection: 5 shoots with shepherd's crook on row 3. Applied copper-based bactericide.",
                        progression: Progression.STABLE,
                        product_applied: "Kocide 2000",
                        dosage: "3 g/L",
                    },
                    {
                        created_at: daysAgo(7),
                        content: "Second check: no spread to adjacent rows. Affected shoots pruned and removed.",
                        progression: Progression.IMPROVING,
                    },
                ],
            },
        },
    });

    const powderyMildewReport = await prisma.report.create({
        data: {
            title: "Powdery Mildew — Pinot Grigio sector B",
            description: "White powdery layer covering young leaves on eastern rows.",
            status: ReportStatus.OPEN,
            created_at: daysAgo(21),
            problem_id: powderyMildewProblem.id,
            field_id: fieldAlice2.id,
            crops: { create: [{ crop_id: pinotCrop.id }] },
            notes: {
                create: [
                    {
                        created_at: daysAgo(21),
                        content: "Moderate infection on ~20% of canopy. Sulphur spray applied.",
                        progression: Progression.WORSENING,
                        product_applied: "Sulfocalcico",
                        dosage: "5 mL/L",
                    },
                    {
                        created_at: daysAgo(10),
                        content: "Infection area stabilised. Continuing biweekly sulphur applications.",
                        progression: Progression.STABLE,
                    },
                ],
            },
        },
    });

    const frostReport = await prisma.report.create({
        data: {
            title: "Late frost event — 3 April",
            description: "Night temperatures dropped to -3.5 °C, below Pink-stage critical threshold.",
            status: ReportStatus.CLOSED,
            created_at: daysAgo(60),
            closed_at: daysAgo(45),
            problem_id: frostProblem.id,
            field_id: fieldAlice1.id,
            crops: { create: [{ crop_id: appleCrop.id }, { crop_id: fujiCrop.id }] },
            notes: {
                create: [
                    {
                        created_at: daysAgo(60),
                        content: "Frost alert triggered at 02:14. Activated wind machines. Approx. 15% blossom loss estimated.",
                        progression: Progression.STABLE,
                    },
                    {
                        created_at: daysAgo(50),
                        content: "Post-frost assessment: actual blossom kill ~10%. Crop load still adequate.",
                        progression: Progression.IMPROVING,
                    },
                ],
            },
        },
    });

    const aphidReport = await prisma.report.create({
        data: {
            title: "Aphid colony — greenhouse tomatoes",
            description: "Dense woolly aphid colonies found on undersides of leaves in bay 4.",
            status: ReportStatus.OPEN,
            created_at: daysAgo(5),
            problem_id: aphidsProblem.id,
            field_id: fieldBob1.id,
            crops: { create: [{ crop_id: tomatoCrop.id }] },
            notes: {
                create: [
                    {
                        created_at: daysAgo(5),
                        content: "Infestation localised to bay 4. Released Aphidius colemani as biological control.",
                        progression: Progression.STABLE,
                        product_applied: "Aphidius colemani (biological)",
                        dosage: "250 adults/100 m²",
                    },
                ],
            },
        },
    });

    // -------------------------------------------------------------------------
    // 10. Harvests
    // -------------------------------------------------------------------------
    console.log("  → Harvests");

    await prisma.harvest.createMany({
        data: [
            // Apple harvest — last autumn
            {
                harvested_at: daysAgo(150),
                crop_id: appleCrop.id,
                field_id: fieldAlice1.id,
                total: 4800,
                first_quality: 3200,
                second_quality: 1200,
                garbage: 400,
                notes: "Good yield despite April frost. Sizing slightly below average.",
            },
            // Fuji apple — partial harvest
            {
                harvested_at: daysAgo(145),
                crop_id: fujiCrop.id,
                field_id: fieldAlice1.id,
                total: 2200,
                first_quality: 1800,
                second_quality: 300,
                garbage: 100,
            },
            // Wheat
            {
                harvested_at: daysAgo(20),
                crop_id: wheatCrop.id,
                field_id: fieldBob2.id,
                total: 15000,
                first_quality: 12000,
                second_quality: 2500,
                garbage: 500,
                notes: "Yield above 5-year avg. Protein content 12.8%.",
            },
            // Olive — early winter pressing
            {
                harvested_at: daysAgo(90),
                crop_id: oliveCrop.id,
                field_id: fieldCarla1.id,
                total: 8000,
                first_quality: 6500,
                second_quality: 1200,
                garbage: 300,
                notes: "Oil yield 16.4%. DOP certification pending.",
            },
        ],
    });

    // -------------------------------------------------------------------------
    // 11. Images (metadata only — no actual file upload needed for seed)
    // -------------------------------------------------------------------------
    console.log("  → Images");

    await prisma.image.createMany({
        data: [
            {
                url: "https://storage.agrisense.dev/mock/fire-blight-01.jpg",
                storage_key: "mock/fire-blight-01.jpg",
                user_id: alice.id,
                report_id: fireBlightReport.id,
            },
            {
                url: "https://storage.agrisense.dev/mock/fire-blight-02.jpg",
                storage_key: "mock/fire-blight-02.jpg",
                user_id: alice.id,
                report_id: fireBlightReport.id,
            },
            {
                url: "https://storage.agrisense.dev/mock/powdery-mildew-01.jpg",
                storage_key: "mock/powdery-mildew-01.jpg",
                user_id: alice.id,
                report_id: powderyMildewReport.id,
            },
            {
                url: "https://storage.agrisense.dev/mock/aphids-bay4-01.jpg",
                storage_key: "mock/aphids-bay4-01.jpg",
                user_id: bob.id,
                report_id: aphidReport.id,
            },
            {
                url: "https://storage.agrisense.dev/mock/harvest-apple-2024.jpg",
                storage_key: "mock/harvest-apple-2024.jpg",
                user_id: alice.id,
            },
        ],
    });

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    const counts = await Promise.all([
        prisma.user.count(),
        prisma.field.count(),
        prisma.species.count(),
        prisma.variety.count(),
        prisma.bloomStage.count(),
        prisma.crop.count(),
        prisma.problem.count(),
        prisma.device.count(),
        prisma.reading.count(),
        prisma.report.count(),
        prisma.reportNote.count(),
        prisma.harvest.count(),
        prisma.image.count(),
    ]);

    const labels = [
        "Users", "Fields", "Species", "Varieties", "BloomStages", "Crops",
        "Problems", "Devices", "Readings", "Reports", "ReportNotes", "Harvests", "Images",
    ];

    console.log("\n✅  Seed complete:");
    labels.forEach((label, i) => console.log(`   ${label.padEnd(14)}: ${counts[i]}`));
}

main()
    .catch((err) => {
        console.error("❌  Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
