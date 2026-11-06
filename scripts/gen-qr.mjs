// Generates a branded QR code for https://anxforever.cn:
// rounded modules, custom finder eyes, and the site's AX monogram centered on
// a white plate. ECC level H (30%) covers the plate comfortably.
// Run: node scripts/gen-qr.mjs
// Verify afterwards with a decoder — a styled QR that does not scan is garbage.
import QRCode from "qrcode"
import sharp from "sharp"
import { writeFileSync, mkdirSync } from "fs"

const URL_TO_ENCODE = "https://anxforever.cn"
const OUT_DIR = ".artifacts/qr"
mkdirSync(OUT_DIR, { recursive: true })

// --- 1. Module matrix -------------------------------------------------------
const qr = QRCode.create(URL_TO_ENCODE, { errorCorrectionLevel: "H" })
const size = qr.modules.size
const data = qr.modules.data // Uint8Array, 1 = dark

const get = (r, c) => r >= 0 && c >= 0 && r < size && c < size && data[r * size + c] === 1

// --- 2. Geometry ------------------------------------------------------------
const QUIET = 4 // quiet zone, modules
const total = size + QUIET * 2
const CELL = 64 // render units per module
const W = total * CELL

const INK = "#18181b" // zinc-900, the site's dark tone
const BG = "#ffffff"

const isFinder = (r, c) =>
  (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)

// --- 3. SVG parts -----------------------------------------------------------
let parts = []

// Data modules: near-solid squares with a subtle corner rounding — keeps
// adjacent modules connected, which weak decoders rely on.
const dot = CELL
const inset = 0
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (!get(r, c) || isFinder(r, c)) continue
    const x = (c + QUIET) * CELL + inset
    const y = (r + QUIET) * CELL + inset
    parts.push(
      `<rect x="${x}" y="${y}" width="${dot}" height="${dot}" rx="${dot * 0.16}" fill="${INK}"/>`
    )
  }
}

// Finder eyes: outer rounded frame + inner rounded dot, for the three corners.
const finderCorners = [
  [0, 0],
  [0, size - 7],
  [size - 7, 0],
]
for (const [r0, c0] of finderCorners) {
  const x = (c0 + QUIET) * CELL
  const y = (r0 + QUIET) * CELL
  const s7 = 7 * CELL
  // Spec-true proportions: dark 7x7, light 5x5, dark 3x3 — exact 1-module
  // ring. Only the outer silhouette gets a slight rounding.
  parts.push(
    `<rect x="${x}" y="${y}" width="${s7}" height="${s7}" rx="${s7 * 0.22}" fill="${INK}"/>`
  )
  const s5 = 5 * CELL
  parts.push(
    `<rect x="${x + CELL}" y="${y + CELL}" width="${s5}" height="${s5}" rx="${s5 * 0.22}" fill="${BG}"/>`
  )
  const s3 = 3 * CELL
  parts.push(
    `<rect x="${x + CELL * 2}" y="${y + CELL * 2}" width="${s3}" height="${s3}" rx="${s3 * 0.28}" fill="${INK}"/>`
  )
}

// Alignment pattern(s) (version >= 2): keep them crisp squares-in-squares.
// Find them: 5x5 patterns not inside finder areas.
const alignCenters = []
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    // A 5x5 alignment pattern: dark border ring around light ring around dark center.
    if (
      get(r, c) && get(r, c + 4) && get(r + 4, c) && get(r + 4, c + 4) &&
      !get(r + 1, c + 1) && get(r + 2, c + 2) &&
      get(r, c + 1) && get(r, c + 2) && get(r, c + 3) &&
      !isFinder(r, c) && !isFinder(r, c + 4) && !isFinder(r + 4, c + 4) &&
      r + 4 < size && c + 4 < size
    ) {
      const overlapsFinder = [0, 4].some((d) =>
        isFinder(r + d, c) || isFinder(r, c + d) || isFinder(r + d, c + 4) || isFinder(r + 4, c + d)
      )
      if (!overlapsFinder && !alignCenters.some(([ar, ac]) => Math.abs(ar - r) < 5 && Math.abs(ac - c) < 5)) {
        alignCenters.push([r, c])
      }
    }
  }
}
for (const [r0, c0] of alignCenters) {
  const x = (c0 + QUIET) * CELL
  const y = (r0 + QUIET) * CELL
  const s5 = 5 * CELL
  parts.push(
    `<rect x="${x}" y="${y}" width="${s5}" height="${s5}" rx="${s5 * 0.3}" fill="${INK}"/>`
  )
  const i1 = CELL * 0.75
  const s3 = s5 - i1 * 2
  parts.push(
    `<rect x="${x + i1}" y="${y + i1}" width="${s3}" height="${s3}" rx="${s3 * 0.3}" fill="${BG}"/>`
  )
  const i2 = CELL * 0.7
  const s1 = s3 - i2 * 2
  parts.push(
    `<rect x="${x + i1 + i2}" y="${y + i1 + i2}" width="${s1}" height="${s1}" rx="${s1 * 0.35}" fill="${INK}"/>`
  )
}

// --- 4. Center plate with the AX monogram -----------------------------------
// Plate: 10 modules wide, 6 tall (AX is 2:1), centered on the symbol.
const PLATE_W = 10 * CELL
const PLATE_H = 6 * CELL
const plateX = (W - PLATE_W) / 2
const plateY = (W - PLATE_H) / 2

// AX mark viewBox 0 0 512 256 (2:1) — inset it inside the plate.
const markW = PLATE_W - 1.6 * CELL
const markH = markW / 2
const markX = plateX + (PLATE_W - markW) / 2
const markY = plateY + (PLATE_H - markH) / 2
const markScale = markW / 512

parts.push(
  `<rect x="${plateX}" y="${plateY}" width="${PLATE_W}" height="${PLATE_H}" rx="${CELL * 0.9}" fill="${BG}"/>`,
  `<rect x="${plateX}" y="${plateY}" width="${PLATE_W}" height="${PLATE_H}" rx="${CELL * 0.9}" fill="none" stroke="${INK}" stroke-opacity="0.12" stroke-width="${CELL * 0.12}"/>`,
  `<g transform="translate(${markX},${markY}) scale(${markScale})"><path fill="${INK}" d="M64 0h96v32h-96zM32 32h160v32h-160zM0 64h64v32h-64zM160 64h64v32h-64zM0 96h64v32h-64zM160 96h64v32h-64zM0 128h224v32h-224zM0 160h224v32h-224zM0 192h64v32h-64zM160 192h64v32h-64zM0 224h64v32h-64zM160 224h64v32h-64zM288 0h64v32h-64zM448 0h64v32h-64zM288 32h96v32h-96zM416 32h96v32h-96zM320 64h160v32h-160zM352 96h96v32h-96zM352 128h96v32h-96zM320 160h160v32h-160zM288 192h96v32h-96zM416 192h96v32h-96zM288 224h64v32h-64zM448 224h64v32h-64z"/></g>`
)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}"><rect width="${W}" height="${W}" fill="${BG}"/>${parts.join("")}</svg>`

writeFileSync(`${OUT_DIR}/anxforever.cn-branded.svg`, svg)

await sharp(Buffer.from(svg), { density: 300 })
  .resize(2048, 2048)
  .png()
  .toFile(`${OUT_DIR}/anxforever.cn-branded.png`)

console.log(`symbol version: ${qr.version}, modules: ${size}x${size}`)
console.log(`plate covers ${((PLATE_W * PLATE_H) / (W * W) * 100).toFixed(1)}% of area (ECC H tolerates ~30% loss)`)
console.log(`written: ${OUT_DIR}/anxforever.cn-branded.{svg,png}`)
