import React from 'react'


export const useImageLazyLoad = (ref, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.add('loaded')
        observer.unobserve(img)
      }
    }, defaultOptions)

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, defaultOptions])
}

export const lazyLoadComponent = (importFunc, retries = 3) => {
  return React.lazy(() =>
    importFunc().catch(error => {
      if (retries <= 1) throw error
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(lazyLoadComponent(importFunc, retries - 1))
        }, 1500)
      })
    })
  )
}

export const preloadComponent = (importFunc) => {
  importFunc()
}

export default {
  useImageLazyLoad,
  lazyLoadComponent,
  preloadComponent
}
