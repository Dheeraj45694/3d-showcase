import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

export default function Loader({ onComplete }) {
    const { progress, loaded, total } = useProgress()
    const [isHidden, setIsHidden] = useState(false)

    useEffect(() => {
        if (progress === 100) {
            // Add small delay for smoother transition
            const timer = setTimeout(() => {
                setIsHidden(true)
                onComplete?.()
            }, 500)
            return () => clearTimeout(timer)
        }

        // Auto-complete if stuck at 0% (no assets to load)
        const fallbackTimer = setTimeout(() => {
            if (progress === 0 || total === 0) {
                setIsHidden(true)
                onComplete?.()
            }
        }, 1000) // Wait 1 second, then auto-complete

        return () => clearTimeout(fallbackTimer)
    }, [progress, onComplete, total])

    return (
        <div className={`loading-screen ${isHidden ? 'hidden' : ''}`}>
            {/* <div className="loading-logo">Portfolio</div> */}
            <div className="loading-bar-container">
                <div
                    className="loading-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {/* <div className="loading-percentage">
                {Math.round(progress)}%
            </div> */}
        </div>
    )
}
