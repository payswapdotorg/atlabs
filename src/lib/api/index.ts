// Mock API client with fixtures

// Mock user data
export const mockUser = {
  user_id: 179398,
  username: "yaslencatty@gmail.com",
  email: "yaslencatty@gmail.com",
  name: "yaslen Catty",
  user_brand_settings: {},
  credit_summary: {
    amount: 0,
    balance: 0
  },
  is_premium: false,
  default_image_model: "MagicX"
}

// Mock API functions with simulated delay
export const getMeta = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    location: {
      country_code: "US",
      country_name: "United States",
      continent_code: "NA",
      city: "San Francisco",
      region: "California"
    }
  }
}

export const getUserProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    first_name: "yaslen",
    last_name: "Catty",
    name: "yaslen Catty",
    email: "yaslencatty@gmail.com",
    date_joined: "2023-10-01",
    notification_preferences: {
      receive_updates: true,
      email_on_video_export: false
    },
    default_image_model: "MagicX",
    is_premium: false,
    current_subscription: null
  }
}

export const getUserDetails = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    ...mockUser,
    pusher_id: "1234567890"
  }
}

export const getUserUsageStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    credits_used: 0,
    stories_exported: 0,
    successful_mini_app_requests: 0
  }
}

export const getStories = async (_page = 1, _pageSize = 5) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    count: 0,
    next: null,
    previous: null,
    results: []
  }
}