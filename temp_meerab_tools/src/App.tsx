import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ToolsPage from './pages/ToolsPage'
import DynamicToolPage from './pages/DynamicToolPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPage from './pages/PrivacyPage'
import BlogListPage from './pages/blogs/BlogListPage'
import BlogArticlePage from './pages/blogs/BlogArticlePage'
import BlogSubmitPage from './pages/blogs/BlogSubmitPage'
import CategoryPage from './pages/win/CategoryPage'
import SubcategoryPage from './pages/win/SubcategoryPage'
import WinToolPage from './pages/win/WinToolPage'
import WomenHomePage from './pages/women/WomenHomePage'
import WomenSubcategoryPage from './pages/women/WomenSubcategoryPage'
import StudentHomePage from './pages/students/StudentHomePage'
import StudentCategoryPage from './pages/students/StudentCategoryPage'
import StudentSubcategoryPage from './pages/students/StudentSubcategoryPage'
import StudentAcademicsHomePage from './pages/students/StudentAcademicsHomePage'
import StudentAcademicsSubcategoryPage from './pages/students/StudentAcademicsSubcategoryPage'
import MarketingHomePage from './pages/marketing/MarketingHomePage'
import MarketingSubcategoryPage from './pages/marketing/MarketingSubcategoryPage'
import OfficeHomePage from './pages/office/OfficeHomePage'
import OfficeModulePage from './pages/office/OfficeModulePage'
import OfficeSubcategoryPage from './pages/office/OfficeSubcategoryPage'
import HealthHomePage from './pages/health/HealthHomePage'
import HealthSubcategoryPage from './pages/health/HealthSubcategoryPage'
import HouseholdHomePage from './pages/household/HouseholdHomePage'
import HouseholdSubcategoryPage from './pages/household/HouseholdSubcategoryPage'
import HouseholdToolPage from './pages/tools/household/HouseholdToolPage'
import ImageToolsHomePage from './pages/image-tools/ImageToolsHomePage'
import ImageToolsSubcategoryPage from './pages/image-tools/ImageToolsSubcategoryPage'
import ImageToolPage from './pages/tools/image/ImageToolPage'
import AiToolsHomePage from './pages/ai-tools/AiToolsHomePage'
import AiToolsSubcategoryPage from './pages/ai-tools/AiToolsSubcategoryPage'
import AiToolPage from './pages/tools/ai/AiToolPage'
import DevCloudHomePage from './pages/dev-cloud/DevCloudHomePage'
import DevCloudSubcategoryPage from './pages/dev-cloud/DevCloudSubcategoryPage'
import DevCloudToolPage from './pages/tools/dev-cloud/DevCloudToolPage'
import CyberSecurityHomePage from './pages/cyber-security/CyberSecurityHomePage'
import CyberSecuritySubcategoryPage from './pages/cyber-security/CyberSecuritySubcategoryPage'
import CyberSecurityToolPage from './pages/tools/cyber/CyberSecurityToolPage'
import GreenEnergyHomePage from './pages/green-energy/GreenEnergyHomePage'
import GreenEnergySubcategoryPage from './pages/green-energy/GreenEnergySubcategoryPage'
import GreenEnergyToolPage from './pages/tools/green/GreenEnergyToolPage'
import FintechHomePage from './pages/fintech-venture/FintechHomePage'
import FintechSubcategoryPage from './pages/fintech-venture/FintechSubcategoryPage'
import FintechToolPage from './pages/tools/fintech/FintechToolPage'
import CivicHomePage from './pages/civic-lifestyle/CivicHomePage'
import CivicSubcategoryPage from './pages/civic-lifestyle/CivicSubcategoryPage'
import CivicToolPage from './pages/tools/civic/CivicToolPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ProfilePage from './pages/auth/ProfilePage'
import ProtectedRoute from './components/auth/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      /* Public Routes: Landing Page, Auth Pages, & Blogs */
      { index: true, element: <HomePage /> },
      { path: 'home', element: <Navigate to="/" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'blogs', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogArticlePage /> },
      { path: 'blogs/:slug', element: <BlogArticlePage /> },

      /* Strictly Protected Routes: All tools, workspaces, hubs, & user dashboards */
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'tools', element: <ToolsPage /> },
          { path: 'tools/:category', element: <ToolsPage /> },
          { path: 'tools/:category/:toolSlug', element: <DynamicToolPage /> },
          { path: 'tools/:category/:subcategory/:toolSlug', element: <DynamicToolPage /> },
          { path: 'pdf-utilities', element: <Navigate to="/tools/pdf" replace /> },
          { path: 'tools/ms-word-tools', element: <Navigate to="/tools/document-word" replace /> },
          { path: 'ms-word-tools', element: <Navigate to="/tools/document-word" replace /> },
          { path: 'ai-tools', element: <AiToolsHomePage /> },
          { path: 'ai-tools/:subcategory', element: <AiToolsSubcategoryPage /> },
          { path: 'ai-tools/:subcategory/:tool', element: <AiToolPage /> },
          { path: 'dev-cloud', element: <DevCloudHomePage /> },
          { path: 'dev-cloud/:subcategory', element: <DevCloudSubcategoryPage /> },
          { path: 'dev-cloud/:subcategory/:tool', element: <DevCloudToolPage /> },
          { path: 'cyber-security', element: <CyberSecurityHomePage /> },
          { path: 'cyber-security/:subcategory', element: <CyberSecuritySubcategoryPage /> },
          { path: 'cyber-security/:subcategory/:tool', element: <CyberSecurityToolPage /> },
          { path: 'green-energy', element: <GreenEnergyHomePage /> },
          { path: 'green-energy/:subcategory', element: <GreenEnergySubcategoryPage /> },
          { path: 'green-energy/:subcategory/:tool', element: <GreenEnergyToolPage /> },
          { path: 'fintech-venture', element: <FintechHomePage /> },
          { path: 'fintech-venture/:subcategory', element: <FintechSubcategoryPage /> },
          { path: 'fintech-venture/:subcategory/:tool', element: <FintechToolPage /> },
          { path: 'civic-lifestyle', element: <CivicHomePage /> },
          { path: 'civic-lifestyle/:subcategory', element: <CivicSubcategoryPage /> },
          { path: 'civic-lifestyle/:subcategory/:tool', element: <CivicToolPage /> },
          { path: 'women', element: <WomenHomePage /> },
          { path: 'women/:subcategory', element: <WomenSubcategoryPage /> },
          { path: 'students', element: <StudentHomePage /> },
          { path: 'students/:mainCategory', element: <StudentCategoryPage /> },
          { path: 'students/:mainCategory/:sub', element: <StudentSubcategoryPage /> },
          { path: 'students-academics', element: <StudentAcademicsHomePage /> },
          { path: 'students-academics/:subcategory', element: <StudentAcademicsSubcategoryPage /> },
          { path: 'marketers-seo', element: <MarketingHomePage /> },
          { path: 'marketers-seo/:subcategory', element: <MarketingSubcategoryPage /> },
          { path: 'office-corporate', element: <OfficeHomePage /> },
          { path: 'office-corporate/:moduleId', element: <OfficeModulePage /> },
          {
            path: 'office-corporate/:moduleId/:subcategoryId',
            element: <OfficeSubcategoryPage />,
          },
          { path: 'health', element: <HealthHomePage /> },
          { path: 'health/:subcategory', element: <HealthSubcategoryPage /> },
          { path: 'image-tools', element: <ImageToolsHomePage /> },
          { path: 'image-tools/:subcategory', element: <ImageToolsSubcategoryPage /> },
          { path: 'image-tools/:subcategory/:tool', element: <ImageToolPage /> },
          { path: 'household', element: <HouseholdHomePage /> },
          { path: 'household/:subcategory', element: <HouseholdSubcategoryPage /> },
          { path: 'household/:subcategory/:tool', element: <HouseholdToolPage /> },
          { path: 'category', element: <CategoryPage /> },
          { path: 'category/:category', element: <CategoryPage /> },
          { path: 'category/:category/:subcategory', element: <SubcategoryPage /> },
          {
            path: 'category/:category/:subcategory/:tool',
            element: <WinToolPage />,
          },
          { path: 'blogs/submit', element: <BlogSubmitPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'account', element: <Navigate to="/profile" replace /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])