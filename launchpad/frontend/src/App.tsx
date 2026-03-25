import { LaunchPadHome } from "@/pages/LaunchPadHome"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PlaceholderPage } from "@/pages/PlaceholderPage"
import { SandboxDetail } from "@/pages/SandboxDetail"
import { SideHustleDetail } from "@/pages/SideHustleDetail"
import { StudentHome } from "@/pages/StudentHome"
import { ToolPage } from "@/pages/ToolPage"
import { BrowserRouter, Route, Routes } from "react-router"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/launchpad" element={<LaunchPadHome />} />
        <Route
          path="/launchpad/sandboxes/:sandboxId"
          element={<SandboxDetail />}
        />
        <Route
          path="/launchpad/sidehustles/:sideHustleId"
          element={<SideHustleDetail />}
        />
        <Route
          path="/launchpad/sandboxes/:sandboxId/tools/:toolType"
          element={<ToolPage />}
        />
        <Route
          path="/launchpad/sandboxes"
          element={
            <PlaceholderPage
              title="My Sandboxes"
              description="This listing page is planned in the LaunchPad implementation phases and will be enabled with full filtering and navigation."
            />
          }
        />
        <Route
          path="/launchpad/sidehustles"
          element={
            <PlaceholderPage
              title="My SideHustles"
              description="This listing page is planned in the LaunchPad implementation phases and will be enabled with full filtering and navigation."
            />
          }
        />
        <Route
          path="/launchpad/teams"
          element={
            <PlaceholderPage
              title="My Teams"
              description="Team collaboration pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/launchpad/events"
          element={
            <PlaceholderPage
              title="Upcoming Events"
              description="Event discovery is planned but not enabled yet in this build."
            />
          }
        />
        <Route
          path="/launchpad/classifieds"
          element={
            <PlaceholderPage
              title="Classifieds"
              description="Classifieds belongs to ConnectHub integration and is currently a placeholder route."
            />
          }
        />
        <Route
          path="/launchpad/market"
          element={
            <PlaceholderPage
              title="Market Square"
              description="Market Square is not enabled yet in this build."
            />
          }
        />
        <Route
          path="/launchpad/tools"
          element={
            <PlaceholderPage
              title="Tools Library"
              description="Tools library browsing is not enabled yet in this build."
            />
          }
        />
        <Route
          path="/launchpad/organizations"
          element={
            <PlaceholderPage
              title="Organizations"
              description="Organization pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/launchpad/learning"
          element={
            <PlaceholderPage
              title="Learning Paths"
              description="Learning path pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/connecthub"
          element={
            <PlaceholderPage
              title="ConnectHub"
              description="ConnectHub navigation is visible, but this frontend build currently focuses on LaunchPad flows."
            />
          }
        />
        <Route
          path="/explore"
          element={
            <PlaceholderPage
              title="Explore"
              description="Explore pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/upgrade"
          element={
            <PlaceholderPage
              title="Upgrade"
              description="Upgrade flows are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/profile"
          element={
            <PlaceholderPage
              title="Profile"
              description="Profile pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/wallet"
          element={
            <PlaceholderPage
              title="Credential Wallet"
              description="Credential wallet pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Settings"
              description="Settings pages are not enabled yet in this build."
            />
          }
        />
        <Route
          path="/contact"
          element={
            <PlaceholderPage
              title="Contact Hatchloom"
              description="Contact and support workflows are being finalized."
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
