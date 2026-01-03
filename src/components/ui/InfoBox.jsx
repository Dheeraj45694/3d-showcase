import React from 'react'
import './InfoBox.css'

/**
 * Glassmorphism info box component
 * Displays content with a frosted glass effect
 */
export default function InfoBox({
    children,
    title,
    side = 'left',
    className = ''
}) {
    return (
        <div className={`info-box info-box-${side} ${className}`}>
            {title && <h3 className="info-box-title">{title}</h3>}
            <div className="info-box-content">
                {children}
            </div>
        </div>
    )
}
