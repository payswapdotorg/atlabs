import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BackpackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeClosedIcon,
  HamburgerMenuIcon,
  ImageIcon,
  LayersIcon,
  PersonIcon,
  PlayIcon,
  ReaderIcon,
  RocketIcon,
  StarIcon,
} from '@radix-ui/react-icons'
import AuthGuard from './components/AuthGuard'
import { AtlabsButton } from './components/AtlabsButton'
import AtlabsTooltip from './components/AtlabsTooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/DropdownMenu'
import { useAuth } from './lib/auth'
import { cn } from './lib/utils'

/* ------------------------------------------------------------------ */
/* Per-page top bar slot: pages can set title + contextual actions    */
/* ------------------------------------------------------------------ */

interface PageHeaderContextValue {
  title: string | null
  setTitle: (title: string | null) => void
  actions: React.ReactNode
  setActions: (node: React.ReactNode) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(
  undefined,
)

/**
 * Pages inside the AppShell use this to drive the top bar:
 *
 *   const { setTitle, setActions } = usePageHeader()
 *   useEffect(() => { setTitle('My Stories'); setActions(<NewStoryButton/>) }, [])
 */
export const usePageHeader = (): PageHeaderContextValue => {
  const ctx = useContext(PageHeaderContext)
  if (!ctx) throw new Error('usePageHeader must be used within AppShell')
  return ctx
}

const ROUTE_TITLES: Record<string, string> = {
  '/app': 'Home',
  '/projects': 'My Stories',
  '/new-story': 'New Story',
  '/story-flow': 'Story Flow',
  '/story': 'Story',
  '/new': 'New',
  '/new-audio': 'New Audio',
  '/new-video-captions': 'New Video Captions',
  '/generating': 'Generating',
  '/duplicate': 'Duplicate',
  '/preview': 'Preview',
  '/account': 'Account',
  '/onboarding': 'Onboarding',
  '/library': 'Library',
  '/library/actors': 'Actors',
  '/tools': 'Tools',
  '/avatar-video': 'Avatar Video',
  '/lip-sync': 'Lip Sync',
  '/motion': 'Motion',
  '/motion-control': 'Motion Control',
  '/modify-video': 'Modify Video',
  '/reframe': 'Reframe',
  '/inpaint': 'Inpaint',
  '/upscale': 'Upscale',
  '/music': 'Music',
  '/image': 'Image',
  '/voices': 'Voices',
  '/lora-training': 'LoRA Training',
  '/brand': 'Brand',
  '/deck': 'Deck',
  '/ugc-ads': 'UGC Ads',
  '/product-ad-flow': 'Product Ad Flow',
  '/paparazzi-sighting': 'Paparazzi Sighting',
  '/credits': 'Credits',
  '/pricing': 'Pricing',
  '/subscribe': 'Pricing',
  '/redeem': 'Redeem',
  '/mcp': 'MCP',
}

const titleFromPath = (pathname: string): string => {
  const exact = ROUTE_TITLES[pathname]
  if (exact) return exact
  const segments = pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1] ?? 'Atlabs'
  return last
    .replace(/[-:]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ------------------------------------------------------------------ */
/* Sidebar spec                                                       */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string
  icon: React.ReactNode
  to?: string
  disabled?: boolean
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'My Stories', to: '/projects', icon: <ReaderIcon width={17} height={17} /> },
  { label: 'Workflows', disabled: true, icon: <LayersIcon width={17} height={17} /> },
  { label: 'Video', disabled: true, icon: <PlayIcon width={17} height={17} /> },
  { label: 'Image', disabled: true, icon: <ImageIcon width={17} height={17} /> },
  { label: 'Library', to: '/library', icon: <BackpackIcon width={17} height={17} /> },
  { label: 'MCP', to: '/mcp', icon: <StarIcon width={17} height={17} />, badge: 'NEW' },
  { label: 'Pricing', to: '/subscribe', icon: <RocketIcon width={17} height={17} /> },
]

/* ------------------------------------------------------------------ */
/* AppShell                                                           */
/* ------------------------------------------------------------------ */

const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [actions, setActions] = useState<React.ReactNode>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Reset per-page overrides on navigation; fall back to the route map.
  useEffect(() => {
    setPageTitle(null)
    setActions(null)
  }, [location.pathname])

  const setTitle = useCallback((title: string | null) => setPageTitle(title), [])
  const setHeaderActions = useCallback(
    (node: React.ReactNode) => setActions(node),
    [],
  )

  const headerContext: PageHeaderContextValue = {
    title: pageTitle,
    setTitle,
    actions,
    setActions: setHeaderActions,
  }

  const resolvedTitle = pageTitle ?? titleFromPath(location.pathname)
  const credits = user?.credit_summary?.balance ?? 0
  const initial = (user?.name ?? user?.email ?? 'A').trim().charAt(0).toUpperCase()

  const navLinkClass = (isActive: boolean): string =>
    cn(
      'relative flex items-center gap-3 rounded-control px-2.5 py-2 text-sm transition-colors',
      'mx-2 my-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      isActive
        ? 'bg-gray-3 font-medium text-gray-12'
        : 'text-gray-11 hover:bg-gray-2 hover:text-gray-12',
    )

  return (
    <AuthGuard>
      <PageHeaderContext.Provider value={headerContext}>
        <div className="flex min-h-screen bg-gray-1">
          {/* ---------------- Sidebar ---------------- */}
          <aside
            className={cn(
              'sticky top-0 flex h-screen shrink-0 flex-col border-r border-gray-a6 bg-white',
              'transition-[width] duration-200 ease-in-out',
              collapsed ? 'w-16' : 'w-[230px]',
            )}
          >
            {/* Wordmark */}
            <div
              className={cn(
                'flex h-14 items-center border-b border-gray-a6 px-3',
                collapsed ? 'justify-center' : 'justify-between px-4',
              )}
            >
              <Link to="/app" className="flex items-center gap-2" aria-label="atlabs home">
                <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-yellow-9 shadow-sm">
                  <PlayIcon width={13} height={13} className="text-gray-1" />
                </span>
                {!collapsed ? (
                  <span className="text-lg font-bold lowercase tracking-tight text-gray-12">
                    atlabs
                  </span>
                ) : null}
              </Link>
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse sidebar"
                  className="hidden h-7 w-7 items-center justify-center rounded-control text-gray-9 transition-colors hover:bg-gray-2 hover:text-gray-11 md:inline-flex"
                >
                  <ChevronLeftIcon width={14} height={14} />
                </button>
              ) : null}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3">
              {collapsed ? (
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  aria-label="Expand sidebar"
                  className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-control text-gray-9 transition-colors hover:bg-gray-2 hover:text-gray-11"
                >
                  <ChevronRightIcon width={14} height={14} />
                </button>
              ) : null}

              {NAV_ITEMS.map((item) => {
                const content = item.to ? (
                  <NavLink
                    to={item.to}
                    end={item.to === '/projects'}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    {!collapsed && item.badge ? (
                      <span className="ml-auto rounded-full bg-yellow-9 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gray-1">
                        {item.badge}
                      </span>
                    ) : null}
                    {collapsed && item.badge ? (
                      <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-yellow-9" />
                    ) : null}
                  </NavLink>
                ) : (
                  <AtlabsTooltip content={`${item.label} — coming soon`} side="right">
                    <span className={navLinkClass(false)}>
                      <span className="shrink-0 opacity-50">{item.icon}</span>
                      {!collapsed ? (
                        <span className="truncate opacity-50">{item.label}</span>
                      ) : null}
                      {!collapsed && item.badge ? (
                        <span className="ml-auto rounded-full bg-yellow-9 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gray-1">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                  </AtlabsTooltip>
                )
                return <div key={item.label}>{content}</div>
              })}
            </nav>

            {/* Sidebar bottom */}
            <div className="border-t border-gray-a6 p-3">
              <AtlabsTooltip content="Support" side="right">
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center rounded-control px-2.5 py-2 text-xs font-semibold uppercase tracking-wide',
                    'text-gray-11 transition-colors hover:bg-gray-2 hover:text-gray-12',
                    collapsed ? 'justify-center' : 'gap-3',
                  )}
                >
                  <EnvelopeClosedIcon width={16} height={16} className="shrink-0" />
                  {!collapsed ? <span>Support</span> : null}
                </button>
              </AtlabsTooltip>

              {!collapsed ? (
                <AtlabsButton
                  variant="primary"
                  size="sm"
                  className="mt-2 w-full font-semibold uppercase tracking-wide"
                  onClick={() => navigate('/subscribe')}
                >
                  Upgrade
                </AtlabsButton>
              ) : (
                <AtlabsTooltip content="Upgrade" side="right">
                  <div className="mt-2 flex justify-center">
                    <AtlabsButton
                      variant="primary"
                      size="sm"
                      aria-label="Upgrade"
                      className="w-9 px-0"
                      onClick={() => navigate('/subscribe')}
                    >
                      <RocketIcon width={15} height={15} />
                    </AtlabsButton>
                  </div>
                </AtlabsTooltip>
              )}

              {!collapsed ? (
                <div className="mt-3 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-a6 px-3 py-1 text-xs font-medium text-gray-11">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-9" />
                    {credits} FREE
                  </span>
                </div>
              ) : null}

              <div className={cn('mt-3 flex items-center', collapsed ? 'justify-center' : 'gap-2.5 px-1')}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Account menu"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-12 text-sm font-semibold text-gray-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {initial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={collapsed ? 'center' : 'start'} side="top">
                    <DropdownMenuLabel>
                      {user?.name ?? 'Signed in'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate('/account')}>
                      <PersonIcon width={14} height={14} />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        logout()
                        navigate('/login')
                      }}
                    >
                      <RocketIcon width={14} height={14} className="rotate-90" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-12">
                      {user?.name ?? 'Signed in user'}
                    </p>
                    <p className="truncate text-xs text-gray-9">
                      {user?.email ?? ''}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          {/* ---------------- Main column ---------------- */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Top bar — per-page title + contextual actions slot */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-a6 bg-white px-4 md:px-6">
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label="Toggle sidebar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-gray-11 transition-colors hover:bg-gray-2 hover:text-gray-12 md:hidden"
              >
                <HamburgerMenuIcon width={16} height={16} />
              </button>
              <h1 className="min-w-0 truncate text-base font-semibold text-gray-12">
                {resolvedTitle}
              </h1>
              <div className="ml-auto flex items-center gap-2">{actions}</div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </PageHeaderContext.Provider>
    </AuthGuard>
  )
}

export default AppShell
