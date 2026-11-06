// Max-compatibility branded QR: the standard renderer's exact output plus a
// centered plate with the AX monogram. Covers ~4.4% of modules; ECC H (30%)
// absorbs it. Run: node scripts/gen-qr-compat.mjs
import QRCode from "qrcode"
import sharp from "sharp"
import { writeFileSync, mkdirSync } from "fs"

const URL_TO_ENCODE = "https://anxforever.cn"
const OUT_DIR = ".artifacts/qr"
mkdirSync(OUT_DIR, { recursive: true })

// Standard SVG at a large module scale.
const svgBase = await QRCode.toString(URL_TO_ENCODE, {
  type: "svg",
  errorCorrectionLevel: "H",
  margin: 4,
})

// Extract the implicit size from the generated svg tag.
const sizeMatch = svgBase.match(/viewBox="0 0 (\d+) (\d+)"/)
const W = Number(sizeMatch[1])

// AX mark (from src/components/anx-mark.tsx), viewBox 0 0 512 256.
const AX_PATH =
  "M64 0h96v32h-96zM32 32h160v32h-160zM0 64h64v32h-64zM160 64h64v32h-64zM0 96h64v32h-64zM160 96h64v32h-64zM0 128h224v32h-224zM0 160h224v32h-224zM0 192h64v32h-64zM160 192h64v32h-64zM0 224h64v32h-64zM160 224h64v32h-64zM288 0h64v32h-64zM448 0h64v32h-64zM288 32h96v32h-96zM416 32h96v32h-96zM320 64h160v32h-160zM352 96h96v32h-96zM352 128h96v32h-96zM320 160h160v32h-160zM288 192h96v32h-96zM416 192h96v32h-96zM288 224h64v32h-64zM448 224h64v32h-64z"

// Plate: 12 modules wide, 7 tall (a bit more padding for scan safety).
// Module size = W / (29 + 8 margin)... derive from the shape: modules span
// margin 4 each side. Compute module size from the data area instead:
// total viewBox W covers (modules + 2*margin) modules.
const MODULES = 29
const MARGIN = 4
const CELL = W / (MODULES + MARGIN * 2)
const PLATE_W = 12 * CELL
const PLATE_H = 7 * CELL
const plateX = (W - PLATE_W) / 2
const plateY = (W - PLATE_H) / 2
const markW = PLATE_W - 1.6 * CELL
const markH = markW / 2
const markX = plateX + (PLATE_W - markW) / 2
const markY = plateY + (PLATE_H - markH) / 2

const plateGroup = `
  <g>
    <rect x="${plateX}" y="${plateY}" width="${PLATE_W}" height="${PLATE_H}" rx="${CELL}" fill="#ffffff"/>
    <g transform="translate(${markX},${markY}) scale(${markW / 512})">
      <path fill="#18181b" d="${AX_PATH}"/>
    </g>
  </g>`

const branded = svgBase.replace("</svg>", `${plateGroup}</svg>`)
writeFileSync(`${OUT_DIR}/anxforever.cn-logo.svg`, branded)

await sharp(Buffer.from(branded), { density: 300 })
  .resize(2048, 2048)
  .png()
  .toFile(`${OUT_DIR}/anxforever.cn-logo.png`)

console.log(`plate ${(PLATE_W * PLATE_H) / (W * W) * 100}% of area`)
console.log("written: anxforever.cn-logo.{svg,png}")
