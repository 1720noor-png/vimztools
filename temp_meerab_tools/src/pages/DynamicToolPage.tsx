import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import NotFoundPage from './NotFoundPage'
import ImageToPdf from './tools/pdf/core/ImageToPdf'
import PdfToImage from './tools/pdf/core/PdfToImage'
import PdfMergeSplit from './tools/pdf/core/PdfMergeSplit'
import PdfCompress from './tools/pdf/core/PdfCompress'
import WordToPdf from './tools/pdf/core/WordToPdf'
import PdfToWord from './tools/pdf/core/PdfToWord'
import PdfWatermark from './tools/pdf/watermark-stamp/PdfWatermark'
import PdfSplit from './tools/pdf/page-management/PdfSplit'
import PdfPageReorder from './tools/pdf/page-management/PdfPageReorder'
import PdfPageNumberer from './tools/pdf/watermark-stamp/PdfPageNumberer'
import PdfPageCrop from './tools/pdf/page-management/PdfPageCrop'
import PdfPasswordProtect from './tools/pdf/security-privacy/PdfPasswordProtect'
import PdfPasswordRemove from './tools/pdf/security-privacy/PdfPasswordRemove'
import PdfRedactor from './tools/pdf/security-privacy/PdfRedactor'
import PdfOcr from './tools/pdf/extraction-smart/PdfOcr'
import PdfTableExtract from './tools/pdf/extraction-smart/PdfTableExtract'
import PdfFormFill from './tools/pdf/forms/PdfFormFill'
import PdfAiSummarizer from './tools/pdf/ai-ml/PdfSummarizer'
import WordDocumentFixer from './tools/document-word/WordDocumentFixer'
import DocumentWordToolPage from './tools/document-word/DocumentWordToolPage'
import { DOCUMENT_WORD_TOOLS } from './document-word/documentWordConfig'
import { AI_TOOLS } from './ai-tools/aiToolsConfig'
import AiToolPage from './tools/ai/AiToolPage'
import { DEV_CLOUD_TOOLS } from './dev-cloud/devCloudConfig'
import DevCloudToolPage from './tools/dev-cloud/DevCloudToolPage'
import { CYBER_SECURITY_TOOLS } from './cyber-security/cyberSecurityConfig'
import CyberSecurityToolPage from './tools/cyber/CyberSecurityToolPage'
import { GREEN_ENERGY_TOOLS } from './green-energy/greenEnergyConfig'
import GreenEnergyToolPage from './tools/green/GreenEnergyToolPage'
import { FINTECH_TOOLS } from './fintech-venture/fintechConfig'
import FintechToolPage from './tools/fintech/FintechToolPage'
import { CIVIC_TOOLS } from './civic-lifestyle/civicConfig'
import CivicToolPage from './tools/civic/CivicToolPage'
import PassportPhoto from './tools/image/PassportPhoto'
import BackgroundRemover from './tools/image/BackgroundRemover'
import ImageResizer from './tools/image/ImageResizer'
import Watermark from './tools/image/Watermark'
import FormatConverter from './tools/image/FormatConverter'
import ResumeBuilder from './tools/documents/ResumeBuilder'
import InvoiceGenerator from './tools/documents/InvoiceGenerator'
import CoverLetter from './tools/documents/CoverLetter'
import PregnancyCalculator from './tools/life/PregnancyCalculator'
import OvulationTracker from './tools/life/OvulationTracker'
import WaterCalorie from './tools/life/WaterCalorie'
import VaccinationPlanner from './tools/life/VaccinationPlanner'
import BudgetTracker from './tools/life/BudgetTracker'
import MaximumHeartRate from './tools/health/MaximumHeartRate'
import HeartHealthScore from './tools/health/HeartHealthScore'
import SleepDebtCalculator from './tools/health/SleepDebtCalculator'
import IdealBedtimePlanner from './tools/health/IdealBedtimePlanner'
import BloodSugarConverter from './tools/health/BloodSugarConverter'
import HomaIrCalculator from './tools/health/HomaIrCalculator'
import BurnoutSelfCheck from './tools/health/BurnoutSelfCheck'
import WellnessDailyCheckIn from './tools/health/WellnessDailyCheckIn'
import MedicationScheduler from './tools/health/MedicationScheduler'
import MedicationHalfLife from './tools/health/MedicationHalfLife'
import GlasgowComaScale from './tools/health/GlasgowComaScale'
import Curb65Score from './tools/health/Curb65Score'
import ToothBrushingTimer from './tools/health/ToothBrushingTimer'
import DentalCheckupPlanner from './tools/health/DentalCheckupPlanner'
import FeverAssessment from './tools/health/FeverAssessment'
import SymptomDurationLog from './tools/health/SymptomDurationLog'
import HealthGenericTool, { allHealthToolConfigs } from './tools/health/healthNewRegistry'
import TextToSpeech from './tools/utilities/TextToSpeech'
import WordCounter from './tools/utilities/WordCounter'
import QRCodeGenerator from './tools/utilities/QRCodeGenerator'
import BillTracker from './tools/money/BillTracker'
import CurrencyConverter from './tools/money/CurrencyConverter'
import DailyBudget from './tools/money/DailyBudget'
import DebtPayoffPlanner from './tools/money/DebtPayoffPlanner'
import DiscountCalculator from './tools/money/DiscountCalculator'
import EmiCalculator from './tools/money/EmiCalculator'
import EmergencyFundPlanner from './tools/money/EmergencyFundPlanner'
import ExpenseTracker from './tools/money/ExpenseTracker'
import GoldValueCalculator from './tools/money/GoldValueCalculator'
import HourlyPayCalculator from './tools/money/HourlyPayCalculator'
import LoanCalculator from './tools/money/LoanCalculator'
import MarkupCalculator from './tools/money/MarkupCalculator'
import MonthlyBudget from './tools/money/MonthlyBudget'
import SalePriceCalculator from './tools/money/SalePriceCalculator'
import SavingsGoal from './tools/money/SavingsGoal'
import TaxEstimator from './tools/money/TaxEstimator'
import ProfitCalculator from './tools/money/ProfitCalculator'
import ZakatCalculator from './tools/money/ZakatCalculator'
import FreelanceRateCalculator from './tools/money/FreelanceRateCalculator'
import SalaryCalculator from './tools/money/SalaryCalculator'
import FreezerInventory from './tools/home/FreezerInventory'
import FridgeInventory from './tools/home/FridgeInventory'
import KitchenInventory from './tools/home/KitchenInventory'
import CleaningSchedule from './tools/home/CleaningSchedule'
import DeclutterChecklist from './tools/home/DeclutterChecklist'
import GroceryListMaker from './tools/home/GroceryListMaker'
import HomeExpenseSplitter from './tools/home/HomeExpenseSplitter'
import HomeMaintenancePlanner from './tools/home/HomeMaintenancePlanner'
import HomeStockChecklist from './tools/home/HomeStockChecklist'
import HouseholdChorePlanner from './tools/home/HouseholdChorePlanner'
import LaundryPlanner from './tools/home/LaundryPlanner'
import MealPlanner from './tools/home/MealPlanner'
import MonthlyHomePlanner from './tools/home/MonthlyHomePlanner'
import PantryTracker from './tools/home/PantryTracker'
import PlantCarePlanner from './tools/home/PlantCarePlanner'
import RoomCleaningTimer from './tools/home/RoomCleaningTimer'
import ShoppingBudget from './tools/home/ShoppingBudget'
import UtilityBillSplitter from './tools/home/UtilityBillSplitter'
import WateringSchedule from './tools/home/WateringSchedule'
import WeeklyMenuMaker from './tools/home/WeeklyMenuMaker'
import BakingTimer from './tools/cooking/BakingTimer'
import BreakfastPlanner from './tools/cooking/BreakfastPlanner'
import CookingMeasurementConverter from './tools/cooking/CookingMeasurementConverter'
import CookingTimer from './tools/cooking/CookingTimer'
import DinnerPlanner from './tools/cooking/DinnerPlanner'
import GroceryCostEstimator from './tools/cooking/GroceryCostEstimator'
import IngredientConverter from './tools/cooking/IngredientConverter'
import IngredientSubstituteFinder from './tools/cooking/IngredientSubstituteFinder'
import KitchenShoppingList from './tools/cooking/KitchenShoppingList'
import KitchenUnitConverter from './tools/cooking/KitchenUnitConverter'
import LeftoverPlanner from './tools/cooking/LeftoverPlanner'
import LunchboxPlanner from './tools/cooking/LunchboxPlanner'
import MealPrepPlanner from './tools/cooking/MealPrepPlanner'
import OvenTemperatureConverter from './tools/cooking/OvenTemperatureConverter'
import PortionCalculator from './tools/cooking/PortionCalculator'
import RecipeCostCalculator from './tools/cooking/RecipeCostCalculator'
import RecipeOrganizer from './tools/cooking/RecipeOrganizer'
import RecipeScaler from './tools/cooking/RecipeScaler'
import ServingCalculator from './tools/cooking/ServingCalculator'
import SpiceSubstituteFinder from './tools/cooking/SpiceSubstituteFinder'
import AssignmentPlanner from './tools/study/AssignmentPlanner'
import CgpaCalculator from './tools/study/CgpaCalculator'
import CitationChecklist from './tools/study/CitationChecklist'
import ClassTimetable from './tools/study/ClassTimetable'
import CoursePlanner from './tools/study/CoursePlanner'
import EssayWordCounter from './tools/study/EssayWordCounter'
import ExamCountdown from './tools/study/ExamCountdown'
import FlashcardMaker from './tools/study/FlashcardMaker'
import GpaCalculator from './tools/study/GpaCalculator'
import GradeCalculator from './tools/study/GradeCalculator'
import HomeworkTracker from './tools/study/HomeworkTracker'
import PercentageCalculator from './tools/study/PercentageCalculator'
import PomodoroTimer from './tools/study/PomodoroTimer'
import PresentationPlanner from './tools/study/PresentationPlanner'
import QuizMaker from './tools/study/QuizMaker'
import ReadingTimer from './tools/study/ReadingTimer'
import RevisionPlanner from './tools/study/RevisionPlanner'
import ScholarshipChecklist from './tools/study/ScholarshipChecklist'
import StudyHoursTracker from './tools/study/StudyHoursTracker'
import StudyPlanner from './tools/study/StudyPlanner'
import CvBuilder from './tools/career/CvBuilder'
import CareerGoalPlanner from './tools/career/CareerGoalPlanner'
import CoverLetterBuilder from './tools/career/CoverLetterBuilder'
import FreelanceInvoiceMaker from './tools/career/FreelanceInvoiceMaker'
import FreelanceProposalMaker from './tools/career/FreelanceProposalMaker'
import InterviewQuestionGenerator from './tools/career/InterviewQuestionGenerator'
import InterviewTimer from './tools/career/InterviewTimer'
import JobApplicationTracker from './tools/career/JobApplicationTracker'
import LeaveBalanceCalculator from './tools/career/LeaveBalanceCalculator'
import LinkedInBioMaker from './tools/career/LinkedInBioMaker'
import MeetingAgendaMaker from './tools/career/MeetingAgendaMaker'
import OvertimeCalculator from './tools/career/OvertimeCalculator'
import PortfolioChecklist from './tools/career/PortfolioChecklist'
import ProfessionalBioGenerator from './tools/career/ProfessionalBioGenerator'
import ResumeChecker from './tools/career/ResumeChecker'
import SalaryNegotiationCalculator from './tools/career/SalaryNegotiationCalculator'
import SkillGapChecker from './tools/career/SkillGapChecker'
import WorkHoursCalculator from './tools/career/WorkHoursCalculator'
import WorkTaskPlanner from './tools/career/WorkTaskPlanner'
import WorkdayPlanner from './tools/career/WorkdayPlanner'
import BmiCalculator from './tools/fitness/BmiCalculator'
import BodyFatUsNavy from './tools/fitness/BodyFatUsNavy'
import WaistToHeightRatio from './tools/fitness/WaistToHeightRatio'
import IdealBodyWeight from './tools/fitness/IdealBodyWeight'
import LeanBodyMassFfmi from './tools/fitness/LeanBodyMassFfmi'
import WaistToHipRatio from './tools/fitness/WaistToHipRatio'
import BodySurfaceArea from './tools/fitness/BodySurfaceArea'
import BmrTdeeCalculator from './tools/fitness/BmrTdeeCalculator'
import CaloricDeficitPlanner from './tools/fitness/CaloricDeficitPlanner'
import CalorieBurnEstimator from './tools/fitness/CalorieBurnEstimator'
import TargetHeartRateZone from './tools/fitness/TargetHeartRateZone'
import HydrationCalculator from './tools/fitness/HydrationCalculator'
import MacroSplitter from './tools/fitness/MacroSplitter'
import MacroSwapPlanner from './tools/fitness/MacroSwapPlanner'
import IntermittentFastingPlanner from './tools/fitness/IntermittentFastingPlanner'
import MealCalorieSplitter from './tools/fitness/MealCalorieSplitter'
import PregnancyLactationCalories from './tools/fitness/PregnancyLactationCalories'
import PediatricGrowthChecker from './tools/fitness/PediatricGrowthChecker'
import MuscleGeneticPotential from './tools/fitness/MuscleGeneticPotential'
import WeightLossPlateauDiagnoser from './tools/fitness/WeightLossPlateauDiagnoser'
import StainRemovalSolver from './tools/household/StainRemovalSolver'
import StitchingFabricEstimator from './tools/household/StitchingFabricEstimator'
import WashingLoadDetergent from './tools/household/WashingLoadDetergent'
import LaundryDryingTime from './tools/household/LaundryDryingTime'
import FabricCareIroning from './tools/household/FabricCareIroning'
import PlantWateringScheduler from './tools/household/PlantWateringScheduler'
import RugCarpetSize from './tools/household/RugCarpetSize'
import CurtainRodPleat from './tools/household/CurtainRodPleat'
import StorageBinCapacity from './tools/household/StorageBinCapacity'
import SurfaceSafeCleaner from './tools/household/SurfaceSafeCleaner'
import RoomDeepCleaningTime from './tools/household/RoomDeepCleaningTime'
import HomeMaintenanceTracker from './tools/household/HomeMaintenanceTracker'
import SunscreenReapplicationTimer from './tools/beauty/SunscreenReapplicationTimer'
import SkincareLayeringPlanner from './tools/beauty/SkincareLayeringPlanner'
import ActiveIngredientConflictChecker from './tools/beauty/ActiveIngredientConflictChecker'
import HydrationBarrierScore from './tools/beauty/HydrationBarrierScore'
import ComedogenicScanner from './tools/beauty/ComedogenicScanner'
import SkinCyclingPlanner from './tools/beauty/SkinCyclingPlanner'
import CosmeticExpiryTracker from './tools/beauty/CosmeticExpiryTracker'
import FoundationShadeMatcher from './tools/beauty/FoundationShadeMatcher'
import UndertoneShadeMatcher from './tools/beauty/UndertoneShadeMatcher'
import BrushSanitationTracker from './tools/beauty/BrushSanitationTracker'
import PerfumeLayeringMatcher from './tools/beauty/PerfumeLayeringMatcher'
import ContourEyelinerGuide from './tools/beauty/ContourEyelinerGuide'
import HairPorositySelector from './tools/beauty/HairPorositySelector'
import HeatStylingTempAdvisor from './tools/beauty/HeatStylingTempAdvisor'
import ScalpOilDosageEstimator from './tools/beauty/ScalpOilDosageEstimator'
import HairDyeDeveloperCalculator from './tools/beauty/HairDyeDeveloperCalculator'
import HardWaterHairAdvisor from './tools/beauty/HardWaterHairAdvisor'
import DiyMaskFormulator from './tools/beauty/DiyMaskFormulator'
import FerrimanGallweyScore from './tools/femhealth/FerrimanGallweyScore'
import PcosInsulinResistance from './tools/femhealth/PcosInsulinResistance'
import PmosCaloricAdjuster from './tools/femhealth/PmosCaloricAdjuster'
import PcosSeedCycling from './tools/femhealth/PcosSeedCycling'
import PcosSupplementAdvisor from './tools/femhealth/PcosSupplementAdvisor'
import CortisolBellyScore from './tools/femhealth/CortisolBellyScore'
import EstrogenDominanceChecker from './tools/femhealth/EstrogenDominanceChecker'
import DiastasisRectiSafety from './tools/femhealth/DiastasisRectiSafety'
import PostpartumWellnessChecker from './tools/femhealth/PostpartumWellnessChecker'
import EndometriosisPelvicPainTracker from './tools/femhealth/EndometriosisPelvicPainTracker'
import SqlExcelFormulaGenerator from './tools/office/SqlExcelFormulaGenerator'
import JsonCsvParserValidator from './tools/office/JsonCsvParserValidator'
import RegexVisualizerTester from './tools/office/RegexVisualizerTester'
import ApiHttpHeaderFormatter from './tools/office/ApiHttpHeaderFormatter'
import CronGeneratorHumanizer from './tools/office/CronGeneratorHumanizer'
import JwtBase64Inspector from './tools/office/JwtBase64Inspector'
import CodeDiffComparer from './tools/office/CodeDiffComparer'
import FreelanceRateMarginCalculator from './tools/office/FreelanceRateMarginCalculator'
import CorporateTaxSalaryDeduction from './tools/office/CorporateTaxSalaryDeduction'
import AreaUnitConverter from './tools/student/AreaUnitConverter'
import BarcodeGenerator from './tools/student/BarcodeGenerator'
import Base64EncoderDecoder from './tools/student/Base64EncoderDecoder'
import BinaryDecimalHexConverter from './tools/student/BinaryDecimalHexConverter'
import AiStudyPlanner from './tools/student/AiStudyPlanner'
import NotesSummarizer from './tools/student/NotesSummarizer'
import PdfSummarizer from './tools/student/PdfSummarizer'
import LectureNotesGenerator from './tools/student/LectureNotesGenerator'
import FlashcardGenerator from './tools/student/FlashcardGenerator'
import QuizGenerator from './tools/student/QuizGenerator'
import McqGenerator from './tools/student/McqGenerator'
import QuestionPaperGenerator from './tools/student/QuestionPaperGenerator'
import AnswerExplainer from './tools/student/AnswerExplainer'
import ChapterSummarizer from './tools/student/ChapterSummarizer'
import EssayWriter from './tools/student/EssayWriter'
import AssignmentHelper from './tools/student/AssignmentHelper'
import GrammarChecker from './tools/student/GrammarChecker'
import ParaphrasingTool from './tools/student/ParaphrasingTool'
import CitationGenerator from './tools/student/CitationGenerator'
import ReferenceGenerator from './tools/student/ReferenceGenerator'
import EmailLetterWriter from './tools/student/EmailLetterWriter'
import PresentationContentGenerator from './tools/student/PresentationContentGenerator'
import ResearchTopicGenerator from './tools/student/ResearchTopicGenerator'
import ResearchQuestionGenerator from './tools/student/ResearchQuestionGenerator'
import LiteratureReviewHelper from './tools/student/LiteratureReviewHelper'
import AbstractGenerator from './tools/student/AbstractGenerator'
import ThesisStatementGenerator from './tools/student/ThesisStatementGenerator'
import SurveyQuestionGenerator from './tools/student/SurveyQuestionGenerator'
import QuestionnaireGenerator from './tools/student/QuestionnaireGenerator'
import MathProblemSolver from './tools/student/MathProblemSolver'
import EquationSolver from './tools/student/EquationSolver'
import ChemistryEquationBalancer from './tools/student/ChemistryEquationBalancer'
import PhysicsProblemSolver from './tools/student/PhysicsProblemSolver'
import UnitConverter from './tools/student/UnitConverter'
import StatisticsCalculator from './tools/student/StatisticsCalculator'
import GraphGenerator from './tools/student/GraphGenerator'
import CvResumeBuilder from './tools/student/CvResumeBuilder'
import CoverLetterGenerator from './tools/student/CoverLetterGenerator'
import LinkedinBioGenerator from './tools/student/LinkedinBioGenerator'
import StudentInterviewQuestionGenerator from './tools/student/InterviewQuestionGenerator'
import InterviewPracticeSimulator from './tools/student/InterviewPracticeSimulator'
import CareerPathFinder from './tools/student/CareerPathFinder'
import TimetableGenerator from './tools/student/TimetableGenerator'
import StudySchedule from './tools/student/StudySchedule'
import StudentPomodoroTimer from './tools/student/StudentPomodoroTimer'
import StudentTodoList from './tools/student/StudentTodoList'
import StudentExamCountdown from './tools/student/StudentExamCountdown'
import GpaCgpaCalculator from './tools/student/GpaCgpaCalculator'
import AttendanceCalculator from './tools/student/AttendanceCalculator'
import MarketingToolPage from './tools/marketing/MarketingToolPage'
import OfficeToolPage from './tools/office/OfficeToolPage'
import MarketingSeoToolPage from './tools/marketing/MarketingSeoToolPage'
import StudentAcademicsToolPage from './tools/student/StudentAcademicsToolPage'
import HouseholdToolPage from './tools/household/HouseholdToolPage'
import { OFFICE_TOOLS } from './office/officeConfig'
import { MARKETING_SEO_TOOLS } from './marketing/marketingSeoConfig'
import { STUDENT_ACADEMICS_TOOLS } from './students/studentAcademicsConfig'
import { HOUSEHOLD_TOOLS } from './household/householdConfig'
import PdfGenericToolPage from './tools/pdf/PdfGenericToolPage'
import { PDF_NEW_TOOLS } from './pdf/pdfConfig'
import { fallbackTemplate, templateRegistry } from '../components/templates'
import { findRegistryTool, type RegistryTool } from '../lib/toolRegistry'
import type { ComponentType } from 'react'

const staticImplementations: Record<string, ComponentType> = {
  'image-to-pdf': ImageToPdf,
  'pdf-to-image': PdfToImage,
  'merge-split': PdfMergeSplit,
  'pdf-merge-split': PdfMergeSplit,
  compress: PdfCompress,
  'pdf-compress': PdfCompress,
  'word-to-pdf': WordToPdf,
  'pdf-to-word': PdfToWord,
  'pdf-watermark': PdfWatermark,
  'pdf-split': PdfSplit,
  'page-reorder': PdfPageReorder,
  'pdf-page-reorder': PdfPageReorder,
  'page-numberer': PdfPageNumberer,
  'pdf-page-numberer': PdfPageNumberer,
  'page-crop': PdfPageCrop,
  'pdf-page-crop': PdfPageCrop,
  'password-protect': PdfPasswordProtect,
  'pdf-password-protect': PdfPasswordProtect,
  'password-remove': PdfPasswordRemove,
  'pdf-password-remove': PdfPasswordRemove,
  redactor: PdfRedactor,
  'pdf-redactor': PdfRedactor,
  ocr: PdfOcr,
  'pdf-ocr': PdfOcr,
  'table-extract': PdfTableExtract,
  'pdf-table-extract': PdfTableExtract,
  'form-fill': PdfFormFill,
  'pdf-form-fill': PdfFormFill,
  summarizer: PdfAiSummarizer,
  'pdf-ai-summarizer': PdfAiSummarizer,
  'passport-photo': PassportPhoto,
  'background-remover': BackgroundRemover,
  'resizer-compressor': ImageResizer,
  'image-resizer': ImageResizer,
  'watermark': Watermark,
  'pdf/watermark': PdfWatermark,
  'format-converter': FormatConverter,
  'resume-builder': ResumeBuilder,
  'invoice-generator': InvoiceGenerator,
  'cover-letter': CoverLetter,
  'pregnancy-calculator': PregnancyCalculator,
  'ovulation-tracker': OvulationTracker,
  'water-calorie': WaterCalorie,
  'vaccination-planner': VaccinationPlanner,
  'budget-tracker': BudgetTracker,
  'text-to-speech': TextToSpeech,
  'word-counter': WordCounter,
  'qr-code': QRCodeGenerator,
  'bill-tracker': BillTracker,
  'currency-converter': CurrencyConverter,
  'daily-budget': DailyBudget,
  'debt-payoff-planner': DebtPayoffPlanner,
  'discount-calculator': DiscountCalculator,
  'emi-calculator': EmiCalculator,
  'emergency-fund-planner': EmergencyFundPlanner,
  'expense-tracker': ExpenseTracker,
  'gold-value-calculator': GoldValueCalculator,
  'hourly-pay-calculator': HourlyPayCalculator,
  'loan-calculator': LoanCalculator,
  'markup-calculator': MarkupCalculator,
  'monthly-budget': MonthlyBudget,
  'sale-price-calculator': SalePriceCalculator,
  'savings-goal': SavingsGoal,
  'tax-estimator': TaxEstimator,
  'profit-calculator': ProfitCalculator,
  'zakat-calculator': ZakatCalculator,
  'freelance-rate-calculator': FreelanceRateCalculator,
  'salary-calculator': SalaryCalculator,
  'freezer-inventory': FreezerInventory,
  'fridge-inventory': FridgeInventory,
  'kitchen-inventory': KitchenInventory,
  'cleaning-schedule': CleaningSchedule,
  'declutter-checklist': DeclutterChecklist,
  'grocery-list-maker': GroceryListMaker,
  'home-expense-splitter': HomeExpenseSplitter,
  'home-maintenance-planner': HomeMaintenancePlanner,
  'home-stock-checklist': HomeStockChecklist,
  'household-chore-planner': HouseholdChorePlanner,
  'laundry-planner': LaundryPlanner,
  'meal-planner': MealPlanner,
  'monthly-home-planner': MonthlyHomePlanner,
  'pantry-tracker': PantryTracker,
  'plant-care-planner': PlantCarePlanner,
  'room-cleaning-timer': RoomCleaningTimer,
  'shopping-budget': ShoppingBudget,
  'utility-bill-splitter': UtilityBillSplitter,
  'watering-schedule': WateringSchedule,
  'weekly-menu-maker': WeeklyMenuMaker,
  'baking-timer': BakingTimer,
  'breakfast-planner': BreakfastPlanner,
  'cooking-measurement-converter': CookingMeasurementConverter,
  'cooking-timer': CookingTimer,
  'dinner-planner': DinnerPlanner,
  'grocery-cost-estimator': GroceryCostEstimator,
  'ingredient-converter': IngredientConverter,
  'ingredient-substitute-finder': IngredientSubstituteFinder,
  'kitchen-shopping-list': KitchenShoppingList,
  'kitchen-unit-converter': KitchenUnitConverter,
  'leftover-planner': LeftoverPlanner,
  'lunchbox-planner': LunchboxPlanner,
  'meal-prep-planner': MealPrepPlanner,
  'oven-temperature-converter': OvenTemperatureConverter,
  'portion-calculator': PortionCalculator,
  'recipe-cost-calculator': RecipeCostCalculator,
  'recipe-organizer': RecipeOrganizer,
  'recipe-scaler': RecipeScaler,
  'serving-calculator': ServingCalculator,
  'spice-substitute-finder': SpiceSubstituteFinder,
  'assignment-planner': AssignmentPlanner,
  'cgpa-calculator': CgpaCalculator,
  'citation-checklist': CitationChecklist,
  'class-timetable': ClassTimetable,
  'course-planner': CoursePlanner,
  'essay-word-counter': EssayWordCounter,
  'exam-countdown': ExamCountdown,
  'flashcard-maker': FlashcardMaker,
  'gpa-calculator': GpaCalculator,
  'grade-calculator': GradeCalculator,
  'homework-tracker': HomeworkTracker,
  'percentage-calculator': PercentageCalculator,
  'pomodoro-timer': PomodoroTimer,
  'presentation-planner': PresentationPlanner,
  'quiz-maker': QuizMaker,
  'reading-timer': ReadingTimer,
  'revision-planner': RevisionPlanner,
  'scholarship-checklist': ScholarshipChecklist,
  'study-hours-tracker': StudyHoursTracker,
  'study-planner': StudyPlanner,
  'cv-builder': CvBuilder,
  'career-goal-planner': CareerGoalPlanner,
  'cover-letter-builder': CoverLetterBuilder,
  'freelance-invoice-maker': FreelanceInvoiceMaker,
  'freelance-proposal-maker': FreelanceProposalMaker,
  'interview-question-generator': InterviewQuestionGenerator,
  'interview-timer': InterviewTimer,
  'job-application-tracker': JobApplicationTracker,
  'leave-balance-calculator': LeaveBalanceCalculator,
  'linkedin-bio-maker': LinkedInBioMaker,
  'meeting-agenda-maker': MeetingAgendaMaker,
  'overtime-calculator': OvertimeCalculator,
  'portfolio-checklist': PortfolioChecklist,
  'professional-bio-generator': ProfessionalBioGenerator,
  'resume-checker': ResumeChecker,
  'salary-negotiation-calculator': SalaryNegotiationCalculator,
  'skill-gap-checker': SkillGapChecker,
  'work-hours-calculator': WorkHoursCalculator,
  'work-task-planner': WorkTaskPlanner,
  'workday-planner': WorkdayPlanner,
  'bmi-calculator': BmiCalculator,
  'maximum-heart-rate': MaximumHeartRate,
  'heart-health-score': HeartHealthScore,
  'sleep-debt-calculator': SleepDebtCalculator,
  'ideal-bedtime-planner': IdealBedtimePlanner,
  'blood-sugar-hba1c-converter': BloodSugarConverter,
  'homa-ir-insulin-resistance': HomaIrCalculator,
  'burnout-self-check': BurnoutSelfCheck,
  'wellness-daily-check-in': WellnessDailyCheckIn,
  'medication-schedule-planner': MedicationScheduler,
  'medication-half-life-estimator': MedicationHalfLife,
  'glasgow-coma-scale': GlasgowComaScale,
  'curb-65-score': Curb65Score,
  'tooth-brushing-timer': ToothBrushingTimer,
  'dental-checkup-planner': DentalCheckupPlanner,
  'fever-temperature-assessment': FeverAssessment,
  'symptom-duration-log': SymptomDurationLog,
  'body-fat-us-navy': BodyFatUsNavy,
  'waist-to-height-ratio': WaistToHeightRatio,
  'ideal-body-weight': IdealBodyWeight,
  'lean-body-mass-ffmi': LeanBodyMassFfmi,
  'waist-to-hip-ratio': WaistToHipRatio,
  'body-surface-area': BodySurfaceArea,
  'bmr-tdee-calculator': BmrTdeeCalculator,
  'caloric-deficit-planner': CaloricDeficitPlanner,
  'calorie-burn-estimator': CalorieBurnEstimator,
  'target-heart-rate-zone': TargetHeartRateZone,
  'hydration-calculator': HydrationCalculator,
  'macro-splitter': MacroSplitter,
  'macro-swap-planner': MacroSwapPlanner,
  'intermittent-fasting-planner': IntermittentFastingPlanner,
  'meal-calorie-splitter': MealCalorieSplitter,
  'pregnancy-lactation-calories': PregnancyLactationCalories,
  'pediatric-growth-checker': PediatricGrowthChecker,
  'muscle-genetic-potential': MuscleGeneticPotential,
  'weight-loss-plateau-diagnoser': WeightLossPlateauDiagnoser,
  'stain-removal-solver': StainRemovalSolver,
  'stitching-fabric-estimator': StitchingFabricEstimator,
  'washing-load-detergent': WashingLoadDetergent,
  'laundry-drying-time': LaundryDryingTime,
  'fabric-care-ironing': FabricCareIroning,
  'plant-watering-scheduler': PlantWateringScheduler,
  'rug-carpet-size': RugCarpetSize,
  'curtain-rod-pleat': CurtainRodPleat,
  'storage-bin-capacity': StorageBinCapacity,
  'surface-safe-cleaner': SurfaceSafeCleaner,
  'room-deep-cleaning-time': RoomDeepCleaningTime,
  'home-maintenance-tracker': HomeMaintenanceTracker,
  'sunscreen-reapplication-timer': SunscreenReapplicationTimer,
  'skincare-layering-planner': SkincareLayeringPlanner,
  'active-ingredient-conflict-checker': ActiveIngredientConflictChecker,
  'hydration-barrier-score': HydrationBarrierScore,
  'comedogenic-scanner': ComedogenicScanner,
  'skin-cycling-planner': SkinCyclingPlanner,
  'cosmetic-expiry-pao-tracker': CosmeticExpiryTracker,
  'foundation-shade-matcher': FoundationShadeMatcher,
  'undertone-shade-matcher': UndertoneShadeMatcher,
  'brush-sanitation-tracker': BrushSanitationTracker,
  'perfume-layering-matcher': PerfumeLayeringMatcher,
  'contour-eyeliner-guide': ContourEyelinerGuide,
  'hair-porosity-selector': HairPorositySelector,
  'heat-styling-temp-advisor': HeatStylingTempAdvisor,
  'scalp-oil-dosage-estimator': ScalpOilDosageEstimator,
  'hair-dye-developer-calculator': HairDyeDeveloperCalculator,
  'hard-water-hair-advisor': HardWaterHairAdvisor,
  'diy-mask-formulator': DiyMaskFormulator,
  'ferriman-gallwey-score': FerrimanGallweyScore,
  'pcos-insulin-resistance': PcosInsulinResistance,
  'pmos-caloric-adjuster': PmosCaloricAdjuster,
  'pcos-seed-cycling': PcosSeedCycling,
  'pcos-supplement-advisor': PcosSupplementAdvisor,
  'cortisol-belly-score': CortisolBellyScore,
  'estrogen-dominance-checker': EstrogenDominanceChecker,
  'diastasis-recti-safety': DiastasisRectiSafety,
  'postpartum-wellness-checker': PostpartumWellnessChecker,
  'endometriosis-pelvic-pain-tracker': EndometriosisPelvicPainTracker,
  'sql-excel-formula-generator': SqlExcelFormulaGenerator,
  'json-csv-parser-validator': JsonCsvParserValidator,
  'regex-visualizer-tester': RegexVisualizerTester,
  'api-payload-http-header-formatter': ApiHttpHeaderFormatter,
  'cron-generator-humanizer': CronGeneratorHumanizer,
  'jwt-base64-inspector': JwtBase64Inspector,
  'code-diff-comparer': CodeDiffComparer,
  'freelance-rate-margin-calculator': FreelanceRateMarginCalculator,
  'corporate-tax-salary-deduction': CorporateTaxSalaryDeduction,
  'area-unit-converter': AreaUnitConverter,
  'barcode-generator': BarcodeGenerator,
  'base64-encoder-decoder': Base64EncoderDecoder,
  'binary-decimal-hex-converter': BinaryDecimalHexConverter,
  'ai-study-planner': AiStudyPlanner,
  'notes-summarizer': NotesSummarizer,
  'pdf-summarizer': PdfSummarizer,
  'lecture-notes-generator': LectureNotesGenerator,
  'flashcard-generator': FlashcardGenerator,
  'quiz-generator': QuizGenerator,
  'mcq-generator': McqGenerator,
  'question-paper-generator': QuestionPaperGenerator,
  'answer-explainer': AnswerExplainer,
  'chapter-summarizer': ChapterSummarizer,
  'essay-writer': EssayWriter,
  'assignment-helper': AssignmentHelper,
  'grammar-checker': GrammarChecker,
  'paraphrasing-tool': ParaphrasingTool,
  'citation-generator': CitationGenerator,
  'reference-generator': ReferenceGenerator,
  'email-letter-writer': EmailLetterWriter,
  'presentation-content-generator': PresentationContentGenerator,
  'research-topic-generator': ResearchTopicGenerator,
  'research-question-generator': ResearchQuestionGenerator,
  'literature-review-helper': LiteratureReviewHelper,
  'abstract-generator': AbstractGenerator,
  'thesis-statement-generator': ThesisStatementGenerator,
  'survey-question-generator': SurveyQuestionGenerator,
  'questionnaire-generator': QuestionnaireGenerator,
  'math-problem-solver': MathProblemSolver,
  'equation-solver': EquationSolver,
  'chemistry-equation-balancer': ChemistryEquationBalancer,
  'physics-problem-solver': PhysicsProblemSolver,
  'unit-converter': UnitConverter,
  'statistics-calculator': StatisticsCalculator,
  'graph-generator': GraphGenerator,
  'cv-resume-builder': CvResumeBuilder,
  'cover-letter-generator': CoverLetterGenerator,
  'linkedin-bio-generator': LinkedinBioGenerator,
  'student-interview-question-generator': StudentInterviewQuestionGenerator,
  'interview-practice-simulator': InterviewPracticeSimulator,
  'career-path-finder': CareerPathFinder,
  'timetable-generator': TimetableGenerator,
  'study-schedule': StudySchedule,
  'student-pomodoro-timer': StudentPomodoroTimer,
  'student-to-do-list': StudentTodoList,
  'student-exam-countdown': StudentExamCountdown,
  'gpa-cgpa-calculator': GpaCgpaCalculator,
  'attendance-calculator': AttendanceCalculator,
  'schema-markup-generator': MarketingToolPage,
  'internal-link-equity-calculator': MarketingToolPage,
  'redirect-path-checker': MarketingToolPage,
  'anchor-text-planner': MarketingToolPage,
  'canonical-hreflang-generator': MarketingToolPage,
  'robots-sitemap-builder': MarketingToolPage,
  'core-web-vitals-estimator': MarketingToolPage,
  'serp-pixel-width-checker': MarketingToolPage,
  'heading-structure-analyzer': MarketingToolPage,
  'knowledge-graph-entity-finder': MarketingToolPage,
  'aida-copywriting-generator': MarketingToolPage,
  'pas-framework-writer': MarketingToolPage,
  'email-subject-line-tester': MarketingToolPage,
  'content-decay-analyzer': MarketingToolPage,
  'topic-cluster-planner': MarketingToolPage,
  'persona-alignment-checker': MarketingToolPage,
  'tone-of-voice-adjuster': MarketingToolPage,
  'sentence-density-analyzer': MarketingToolPage,
  'cta-generator': MarketingToolPage,
  'optimal-posting-time-estimator': MarketingToolPage,
  'profile-grid-previewer': MarketingToolPage,
  'emoji-sentiment-analyzer': MarketingToolPage,
  'social-character-counter': MarketingToolPage,
  'shorts-hook-generator': MarketingToolPage,
  'giveaway-winner-picker': MarketingToolPage,
  'content-calendar-planner': MarketingToolPage,
  'bio-link-builder': MarketingToolPage,
  'carousel-content-generator': MarketingToolPage,
  'cac-calculator': MarketingToolPage,
  'ltv-calculator': MarketingToolPage,
  'ltv-cac-ratio': MarketingToolPage,
  'break-even-roas': MarketingToolPage,
  'ppc-budget-estimator': MarketingToolPage,
  'ad-fatigue-calculator': MarketingToolPage,
  'target-cpl-estimator': MarketingToolPage,
  'roas-profit-matrix': MarketingToolPage,
  'ad-copy-previewer': MarketingToolPage,
  'cohort-retention-calculator': MarketingToolPage,
  'ab-split-significance': MarketingToolPage,
  'bounce-vs-exit-analyzer': MarketingToolPage,
  'utm-link-creator': MarketingToolPage,
  'conversion-funnel-calculator': MarketingToolPage,
  'organic-paid-roi-comparator': MarketingToolPage,
  'ga4-event-formatter': MarketingToolPage,
  'referral-reward-multiplier': MarketingToolPage,
}

for (const officeTool of OFFICE_TOOLS) {
  staticImplementations[officeTool.id] = OfficeToolPage
}

for (const seoTool of MARKETING_SEO_TOOLS) {
  staticImplementations[seoTool.id] = MarketingSeoToolPage
}

for (const academicTool of STUDENT_ACADEMICS_TOOLS) {
  staticImplementations[academicTool.id] = StudentAcademicsToolPage
}

for (const householdTool of HOUSEHOLD_TOOLS) {
  staticImplementations[householdTool.id] = HouseholdToolPage
}

for (const pdfTool of PDF_NEW_TOOLS) {
  staticImplementations[pdfTool.id] = PdfGenericToolPage
}

for (const wordTool of DOCUMENT_WORD_TOOLS) {
  staticImplementations[wordTool.id] =
    wordTool.id === 'word-document-fixer' ? WordDocumentFixer : DocumentWordToolPage
}

for (const aiTool of AI_TOOLS) {
  staticImplementations[aiTool.id] = AiToolPage
}

for (const devTool of DEV_CLOUD_TOOLS) {
  staticImplementations[devTool.id] = DevCloudToolPage
}

for (const cyberTool of CYBER_SECURITY_TOOLS) {
  staticImplementations[cyberTool.id] = CyberSecurityToolPage
}

for (const greenTool of GREEN_ENERGY_TOOLS) {
  staticImplementations[greenTool.id] = GreenEnergyToolPage
}

for (const finTool of FINTECH_TOOLS) {
  staticImplementations[finTool.id] = FintechToolPage
}

for (const civicTool of CIVIC_TOOLS) {
  staticImplementations[civicTool.id] = CivicToolPage
}

for (const healthKey of Object.keys(allHealthToolConfigs)) {
  const healthConfig = allHealthToolConfigs[healthKey]
  staticImplementations[healthKey] = function HealthNewPage() {
    return <HealthGenericTool config={healthConfig} />
  }
}

export default function DynamicToolPage() {
  const { category, subcategory, toolSlug } = useParams<{ category: string; subcategory?: string; toolSlug: string }>()
  const [tool, setTool] = useState<RegistryTool | null | undefined>(undefined)

  const staticComp =
    (category && subcategory && toolSlug ? staticImplementations[`${category}/${subcategory}/${toolSlug}`] : undefined) ??
    (category && toolSlug ? staticImplementations[`${category}/${toolSlug}`] : undefined) ??
    (toolSlug ? staticImplementations[toolSlug] : undefined)

  useEffect(() => {
    let mounted = true
    setTool(undefined)
    if (toolSlug && !staticComp) {
      findRegistryTool(toolSlug).then((found) => {
        if (mounted) setTool(found)
      })
    }
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolSlug, staticComp])

  if (staticComp) {
    const Comp = staticComp
    return <Comp />
  }

  if (tool === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" /> Loading tool…
        </div>
      </div>
    )
  }

  if (tool === null) {
    return <NotFoundPage />
  }

  const Template = templateRegistry[tool.templateType] ?? fallbackTemplate

  return <Template key={tool.id} tool={tool} />
}