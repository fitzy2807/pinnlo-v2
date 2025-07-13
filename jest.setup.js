import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      pathname: '/',
    }
  },
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock window.performance.memory for memory tests
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024, // 1MB
    totalJSHeapSize: 2 * 1024 * 1024, // 2MB
    jsHeapSizeLimit: 4 * 1024 * 1024, // 4MB
  },
  writable: true,
})

// Mock window event listeners
const eventListeners = {}
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

window.addEventListener = jest.fn((event, callback) => {
  if (!eventListeners[event]) {
    eventListeners[event] = []
  }
  eventListeners[event].push(callback)
  return originalAddEventListener.call(window, event, callback)
})

window.removeEventListener = jest.fn((event, callback) => {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter(cb => cb !== callback)
  }
  return originalRemoveEventListener.call(window, event, callback)
})

// Mock document.hasFocus
document.hasFocus = jest.fn(() => true)

// Cleanup function for tests
global.cleanupEventListeners = () => {
  Object.keys(eventListeners).forEach(event => {
    eventListeners[event].forEach(callback => {
      window.removeEventListener(event, callback)
    })
    eventListeners[event] = []
  })
}