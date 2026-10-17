import type { ComponentType } from 'react'
import type { RegistryTool } from '../../lib/toolRegistry'
import { ConverterFormTemplate, TextManipulatorTemplate } from './CalculatorTemplates'
import { DocumentGeneratorTemplate } from './DocumentGeneratorTemplate'
import { ImageProcessorTemplate } from './ImageProcessorTemplate'
import { PdfToolTemplate } from './PdfToolTemplate'
import { ChecklistTrackerTemplate } from './ChecklistTrackerTemplate'
import { TimerTrackerTemplate } from './TimerTrackerTemplate'
import { QrBarcodeTemplate } from './QrBarcodeTemplate'
import { UnitConverterTemplate } from './UnitConverterTemplate'
import { GeneratorUtilityTemplate } from './GeneratorUtilityTemplate'
import { HealthFitnessTemplate } from './HealthFitnessTemplate'
import { SmartToolTemplate } from './SmartToolTemplate'

export type TemplateType =
  | 'calculator_basic'
  | 'calculator_form'
  | 'converter_form'
  | 'text_manipulator'
  | 'document_generator'
  | 'image_processor'
  | 'pdf_tool'
  | 'checklist_tracker'
  | 'timer_tracker'
  | 'qr_barcode'
  | 'unit_converter'
  | 'generator_utility'
  | 'health_fitness'
  | 'smart_form'
  | 'static'

export const templateRegistry: Record<string, ComponentType<{ tool: RegistryTool }>> = {
  calculator_basic: SmartToolTemplate,
  calculator_form: SmartToolTemplate,
  converter_form: ConverterFormTemplate,
  text_manipulator: TextManipulatorTemplate,
  document_generator: DocumentGeneratorTemplate,
  image_processor: ImageProcessorTemplate,
  pdf_tool: PdfToolTemplate,
  checklist_tracker: ChecklistTrackerTemplate,
  timer_tracker: TimerTrackerTemplate,
  qr_barcode: QrBarcodeTemplate,
  unit_converter: UnitConverterTemplate,
  generator_utility: GeneratorUtilityTemplate,
  health_fitness: HealthFitnessTemplate,
  smart_form: SmartToolTemplate,
}

export const fallbackTemplate = SmartToolTemplate