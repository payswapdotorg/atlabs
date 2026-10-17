import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import PlaceholderPage from './components/PlaceholderPage'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PlaceholderPage title="Landing" />} />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="/signup" element={<PlaceholderPage title="Signup" />} />
          <Route path="/welcome" element={<PlaceholderPage title="Welcome" />} />
          <Route path="/verify_email" element={<PlaceholderPage title="Verify Email" />} />
          
          {/* App shell routes */}
          <Route path="/app" element={<PlaceholderPage title="App" />} />
          <Route path="/new-story" element={<PlaceholderPage title="New Story" />} />
          <Route path="/story-flow" element={<PlaceholderPage title="Story Flow" />} />
          <Route path="/story" element={<PlaceholderPage title="Story" />} />
          <Route path="/new" element={<PlaceholderPage title="New" />} />
          <Route path="/new-audio/:storyId" element={<PlaceholderPage title="New Audio" />} />
          <Route path="/new-audio" element={<PlaceholderPage title="New Audio" />} />
          <Route path="/new-video-captions" element={<PlaceholderPage title="New Video Captions" />} />
          <Route path="/generating" element={<PlaceholderPage title="Generating" />} />
          <Route path="/duplicate" element={<PlaceholderPage title="Duplicate" />} />
          <Route path="/preview" element={<PlaceholderPage title="Preview" />} />
          <Route path="/create/:createSlug" element={<PlaceholderPage title="Create" />} />
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
          <Route path="*" element={<PlaceholderPage title="404" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App