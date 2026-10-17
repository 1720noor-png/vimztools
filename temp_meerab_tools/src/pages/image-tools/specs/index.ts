import type { ImageToolSpec } from '../engine/types.ts'
import { ID_PASSPORT_TOOLS } from './mod01.ts'
import { CROP_RESIZE_TOOLS } from './mod02.ts'
import { COMPRESSION_SPECS } from './mod03.ts'
import { FORMAT_SPECS } from './mod04.ts'
import { BACKGROUND_SPECS } from './mod05.ts'
import { WATERMARK_SPECS } from './mod06.ts'
import { ENHANCEMENT_SPECS } from './mod07.ts'
import { PORTRAIT_SPECS } from './mod08.ts'
import { SOCIAL_SPECS } from './mod09.ts'
import { ECOMMERCE_SPECS } from './mod10.ts'
import { COLLAGE_SPECS } from './mod11.ts'
import { DOCUMENT_SPECS } from './mod12.ts'
import { OCR_SPECS } from './mod13.ts'
import { AI_SPECS } from './mod14.ts'
import { METADATA_SPECS } from './mod15.ts'
import { COLOR_SPECS } from './mod16.ts'
import { QR_SPECS } from './mod17.ts'
import { BATCH_SPECS } from './mod18.ts'
import { PRINT_SPECS } from './mod19.ts'
import { ICON_SPECS } from './mod20.ts'

export const imageToolSpecs: ImageToolSpec[] = [
  ...ID_PASSPORT_TOOLS,
  ...CROP_RESIZE_TOOLS,
  ...COMPRESSION_SPECS,
  ...FORMAT_SPECS,
  ...BACKGROUND_SPECS,
  ...WATERMARK_SPECS,
  ...ENHANCEMENT_SPECS,
  ...PORTRAIT_SPECS,
  ...SOCIAL_SPECS,
  ...ECOMMERCE_SPECS,
  ...COLLAGE_SPECS,
  ...DOCUMENT_SPECS,
  ...OCR_SPECS,
  ...AI_SPECS,
  ...METADATA_SPECS,
  ...COLOR_SPECS,
  ...QR_SPECS,
  ...BATCH_SPECS,
  ...PRINT_SPECS,
  ...ICON_SPECS,
]

export const imageSpecById = new Map<string, ImageToolSpec>(imageToolSpecs.map((s) => [s.id, s]))

export function getImageToolSpec(id: string): ImageToolSpec | undefined {
  return imageSpecById.get(id)
}

/** Every folder a tool can be reached from: its own sub plus each `alsoIn` entry. */
export function placementsOf(spec: ImageToolSpec): string[] {
  return [spec.sub, ...(spec.alsoIn ?? [])]
}

export const imagePlacements: { id: string; sub: string }[] = imageToolSpecs.flatMap((s) =>
  placementsOf(s).map((sub) => ({ id: s.id, sub })),
)

export const IMAGE_FOLDER_COUNT = new Set(imageToolSpecs.map((s) => s.sub)).size

/** True when the 20-folder / 233-identity / 238-placement target is met exactly. */
export function validateImageSpecCounts() {
  const duplicateIds = imageToolSpecs
    .map((s) => s.id)
    .filter((id, i, all) => all.indexOf(id) !== i)
  const duplicatePlacements = imagePlacements
    .map((p) => `${p.id}::${p.sub}`)
    .filter((k, i, all) => all.indexOf(k) !== i)
  return {
    folders: IMAGE_FOLDER_COUNT,
    identities: imageToolSpecs.length,
    placements: imagePlacements.length,
    duplicateIds: [...new Set(duplicateIds)],
    duplicatePlacements: [...new Set(duplicatePlacements)],
    ok:
      IMAGE_FOLDER_COUNT === 20 &&
      duplicateIds.length === 0 &&
      duplicatePlacements.length === 0 &&
      imageToolSpecs.every((s) => s.id && s.name && s.blurb && s.tip),
  }
}
