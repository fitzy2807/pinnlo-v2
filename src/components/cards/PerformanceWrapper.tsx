'use client'

import React, { useEffect, useRef, memo } from 'react'

interface PerformanceWrapperProps {
  componentName: string
  children: React.ReactNode
  warnThreshold?: number
}

/**
 * Performance monitoring wrapper that tracks component render times
 * and warns about slow renders in development
 */
export const PerformanceWrapper = memo(function PerformanceWrapper({
  componentName,
  children,
  warnThreshold = 100
}: PerformanceWrapperProps) {
  const renderStartRef = useRef<number>(performance.now())
  const renderCountRef = useRef<number>(0)
  const isMountedRef = useRef<boolean>(false)

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current
    renderCountRef.current++

    if (process.env.NODE_ENV === 'development') {
      // Log initial mount time
      if (!isMountedRef.current) {
        console.log(`[Performance] ${componentName} initial mount: ${renderTime.toFixed(2)}ms`)
        isMountedRef.current = true
      } else if (renderTime > warnThreshold) {
        // Warn about slow re-renders
        console.warn(
          `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`
        )
      }

      // Log render count in development
      if (renderCountRef.current > 10) {
        console.warn(
          `[Performance] ${componentName} has rendered ${renderCountRef.current} times. Consider optimization.`
        )
      }
    }

    // Update render start time for next render
    renderStartRef.current = performance.now()
  })

  // Track unmount time
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Performance] ${componentName} unmounting after ${renderCountRef.current} renders`
        )
      }
    }
  }, [componentName])

  return <>{children}</>
})

// HOC version for class components or easier wrapping
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => (
    <PerformanceWrapper componentName={componentName || Component.displayName || Component.name || 'Unknown'}>
      <Component {...props} />
    </PerformanceWrapper>
  )

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Performance metrics hook for custom monitoring
export function usePerformanceMetrics(metricName: string) {
  const startTimeRef = useRef<number>(performance.now())
  const metricsRef = useRef<{
    renders: number
    totalTime: number
    maxTime: number
    minTime: number
  }>({
    renders: 0,
    totalTime: 0,
    maxTime: 0,
    minTime: Infinity
  })

  useEffect(() => {
    const renderTime = performance.now() - startTimeRef.current
    const metrics = metricsRef.current

    metrics.renders++
    metrics.totalTime += renderTime
    metrics.maxTime = Math.max(metrics.maxTime, renderTime)
    metrics.minTime = Math.min(metrics.minTime, renderTime)

    if (process.env.NODE_ENV === 'development' && metrics.renders % 10 === 0) {
      console.table({
        metric: metricName,
        renders: metrics.renders,
        avgTime: (metrics.totalTime / metrics.renders).toFixed(2) + 'ms',
        maxTime: metrics.maxTime.toFixed(2) + 'ms',
        minTime: metrics.minTime.toFixed(2) + 'ms'
      })
    }

    startTimeRef.current = performance.now()
  })

  return metricsRef.current
}