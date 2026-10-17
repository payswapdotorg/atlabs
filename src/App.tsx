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
              <Route path="/account" element={<PlaceholderPage title="Account" />} />
              <Route path="/onboarding" element={<PlaceholderPage title="Onboarding" />} />

              {/* Library routes */}
              <Route path="/library" element={<PlaceholderPage title="Library" />} />
              <Route path="/library/actors" element={<PlaceholderPage title="Library Actors" />} />

              {/* Tools routes */}
              <Route path="/tools" element={<PlaceholderPage title="Tools" />} />
              <Route path="/avatar-video" element={<PlaceholderPage title="Avatar Video" />} />
              <Route path="/lip-sync" element={<PlaceholderPage title="Lip Sync" />} />
              <Route path="/motion" element={<PlaceholderPage title="Motion" />} />
              <Route path="/motion-control" element={<PlaceholderPage title="Motion Control" />} />
              <Route path="/modify-video" element={<PlaceholderPage title="Modify Video" />} />
              <Route path="/reframe" element={<PlaceholderPage title="Reframe" />} />
              <Route path="/inpaint" element={<PlaceholderPage title="Inpaint" />} />
              <Route path="/upscale" element={<PlaceholderPage title="Upscale" />} />
              <Route path="/music" element={<PlaceholderPage title="Music" />} />
              <Route path="/image" element={<PlaceholderPage title="Image" />} />
              <Route path="/voices" element={<PlaceholderPage title="Voices" />} />
              <Route path="/lora-training" element={<PlaceholderPage title="Lora Training" />} />
              <Route path="/brand" element={<PlaceholderPage title="Brand" />} />
              <Route path="/deck" element={<PlaceholderPage title="Deck" />} />
              <Route path="/ugc-ads" element={<PlaceholderPage title="UGC Ads" />} />
              <Route path="/product-ad-flow" element={<PlaceholderPage title="Product Ad Flow" />} />
              <Route path="/paparazzi-sighting" element={<PlaceholderPage title="Paparazzi Sighting" />} />

              {/* Commerce routes */}
              <Route path="/credits" element={<PlaceholderPage title="Credits" />} />
              <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
              <Route path="/subscribe" element={<PlaceholderPage title="Subscribe" />} />
              <Route path="/redeem" element={<PlaceholderPage title="Redeem" />} />

              {/* Other routes */}
              <Route path="/mcp" element={<PlaceholderPage title="MCP" />} />
            </Route>

            <Route path="*" element={<PlaceholderPage title="404" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
