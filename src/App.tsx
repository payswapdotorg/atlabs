import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ToastProvider } from './components/Toast'
import PlaceholderPage from './components/PlaceholderPage'
import AppShell from './AppShell'
import Landing from './pages/landing/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerifyEmail from './pages/auth/VerifyEmail'
import Welcome from './pages/welcome/Welcome'

// WO-2 creation core (owned routes: /app, /new-story, /story-flow, /story,
// /new, /new-audio, /new-video-captions, /generating, /duplicate, /preview,
// /create/:createSlug, /projects)
import AppHome from './pages/app/AppHome'
import NewStory from './pages/app/NewStory'
import Generating from './pages/app/Generating'
import StoryDetail from './pages/app/StoryDetail'
import NewAudio from './pages/app/NewAudio'
import NewVideoCaptions from './pages/app/NewVideoCaptions'
import Duplicate from './pages/app/Duplicate'
import Preview from './pages/app/Preview'
import CreateEntry from './pages/app/CreateEntry'
import Projects from './pages/projects/Projects'

// WO-3 content surface (owned routes: /library, /library/actors, /tools,
// and the 17 mini tool routes)
import Library from './pages/library/Library'
import ToolsHub from './pages/tools/ToolsHub'
import AvatarVideo from './pages/tools/AvatarVideo'
import LipSync from './pages/tools/LipSync'
import Motion from './pages/tools/Motion'
import MotionControl from './pages/tools/MotionControl'
import ModifyVideo from './pages/tools/ModifyVideo'
import Reframe from './pages/tools/Reframe'
import Inpaint from './pages/tools/Inpaint'
import Upscale from './pages/tools/Upscale'
import Music from './pages/tools/Music'
import Image from './pages/tools/Image'
import Voices from './pages/tools/Voices'
import LoraTraining from './pages/tools/LoraTraining'
import Brand from './pages/tools/Brand'
import Deck from './pages/tools/Deck'
import UgcAds from './pages/tools/UgcAds'
import ProductAdFlow from './pages/tools/ProductAdFlow'
import PaparazziSighting from './pages/tools/PaparazziSighting'

// WO-4 commerce + integration (owned routes: /credits, /pricing, /subscribe,
// /redeem, /mcp, /account, /onboarding)
import CreditsPage from './pages/credits/CreditsPage'
import SubscribePage from './pages/subscribe/SubscribePage'
import RedeemPage from './pages/redeem/RedeemPage'
import McpPage from './pages/mcp/McpPage'
import AccountPage from './pages/account/AccountPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/verify_email" element={<VerifyEmail />} />

            {/* App shell routes — guarded by AuthGuard inside AppShell */}
            <Route element={<AppShell />}>
              {/* WO-2 creation core routes */}
              <Route path="/app" element={<AppHome />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/new-story" element={<NewStory />} />
              <Route path="/story-flow" element={<Navigate to="/new-story" replace />} />
              <Route path="/story/:id" element={<StoryDetail />} />
              <Route path="/story" element={<StoryDetail />} />
              <Route path="/new" element={<Navigate to="/app" replace />} />
              <Route path="/new-audio/:storyId" element={<NewAudio />} />
              <Route path="/new-audio" element={<NewAudio />} />
              <Route path="/new-video-captions" element={<NewVideoCaptions />} />
              <Route path="/generating" element={<Generating />} />
              <Route path="/duplicate" element={<Duplicate />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/create/:createSlug" element={<CreateEntry />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* WO-3 library routes */}
              <Route path="/library" element={<Library />} />
              <Route path="/library/actors" element={<Library />} />

              {/* WO-3 tools routes */}
              <Route path="/tools" element={<ToolsHub />} />
              <Route path="/avatar-video" element={<AvatarVideo />} />
              <Route path="/lip-sync" element={<LipSync />} />
              <Route path="/motion" element={<Motion />} />
              <Route path="/motion-control" element={<MotionControl />} />
              <Route path="/modify-video" element={<ModifyVideo />} />
              <Route path="/reframe" element={<Reframe />} />
              <Route path="/inpaint" element={<Inpaint />} />
              <Route path="/upscale" element={<Upscale />} />
              <Route path="/music" element={<Music />} />
              <Route path="/image" element={<Image />} />
              <Route path="/voices" element={<Voices />} />
              <Route path="/lora-training" element={<LoraTraining />} />
              <Route path="/brand" element={<Brand />} />
              <Route path="/deck" element={<Deck />} />
              <Route path="/ugc-ads" element={<UgcAds />} />
              <Route path="/product-ad-flow" element={<ProductAdFlow />} />
              <Route path="/paparazzi-sighting" element={<PaparazziSighting />} />

              {/* Commerce routes — WO-4 */}
              <Route path="/credits" element={<CreditsPage />} />
              <Route path="/pricing" element={<SubscribePage />} />
              <Route path="/subscribe" element={<SubscribePage />} />
              <Route path="/redeem" element={<RedeemPage />} />

              {/* Other routes — WO-4 */}
              <Route path="/mcp" element={<McpPage />} />
            </Route>

            <Route path="*" element={<PlaceholderPage title="404" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
