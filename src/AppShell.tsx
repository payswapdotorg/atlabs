import React from 'react'
import { Outlet } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'

const AppShell: React.FC = () => {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-1">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-a6">
          <div className="p-6">
            <div className="text-2xl font-bold text-yellow-9">atlabs</div>
          </div>
          
          <nav className="mt-8">
            <div className="px-4 py-2 text-xs font-semibold text-gray-12 uppercase tracking-wider">
              Main
            </div>
            <a href="/projects" className="flex items-center px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2">
              <span className="ml-3">My Stories</span>
            </a>
            <button className="flex items-center w-full px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2 disabled:opacity-50" disabled>
              <span className="ml-3">Workflows</span>
            </button>
            <button className="flex items-center w-full px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2 disabled:opacity-50" disabled>
              <span className="ml-3">Video</span>
            </button>
            <button className="flex items-center w-full px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2 disabled:opacity-50" disabled>
              <span className="ml-3">Image</span>
            </button>
            <a href="/library" className="flex items-center px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2">
              <span className="ml-3">Library</span>
            </a>
            <a href="/mcp" className="flex items-center px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2 relative">
              <span className="ml-3">MCP</span>
              <span className="absolute top-3 right-3 bg-yellow-9 text-white text-xs px-2 py-1 rounded-full">NEW</span>
            </a>
            <a href="/subscribe" className="flex items-center px-4 py-3 text-gray-11 hover:text-gray-12 hover:bg-gray-2">
              <span className="ml-3">Pricing</span>
            </a>
          </nav>
          
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-a6">
            <button className="w-full mb-2 px-4 py-2 text-sm text-gray-11 hover:text-gray-12 hover:bg-gray-2 rounded">
              SUPPORT
            </button>
            <button className="w-full mb-2 px-4 py-2 text-sm text-yellow-9 hover:bg-yellow-1 rounded">
              UPGRADE
            </button>
            <div className="flex items-center px-4 py-2 text-sm text-gray-11">
              <div className="w-8 h-8 rounded-full bg-gray-2 flex items-center justify-center">
                Y
              </div>
              <span className="ml-3">Yaslen Catty</span>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="bg-white border-b border-gray-a6 px-6 py-4">
            <h1 className="text-xl font-semibold">App Title</h1>
          </header>
          
          {/* Page content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

export default AppShell