export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    
    if (timeout) {
      clearTimeout(timeout)
    }

    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        timeout = null
        try {
          const result = func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, wait)
    })
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced as T & { cancel: () => void }
}