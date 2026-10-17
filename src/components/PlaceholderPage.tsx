import React from 'react'

interface PlaceholderPageProps {
  title: string
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-1">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-11">Under construction by worker lane</p>
      </div>
    </div>
  )
}

export default PlaceholderPage