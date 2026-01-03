import React from 'react'
import './SectionIndicators.css'

/**
 * Section indicator dots component
 * Shows current active section and allows navigation
 */
export default function SectionIndicators({
    activeSection = 0,
    sections = [],
    onNavigate
}) {
    return (
        <div className="section-indicators">
            {sections.map((section, index) => (
                <button
                    key={section.id}
                    className={`section-indicator ${index === activeSection ? 'active' : ''}`}
                    onClick={() => onNavigate(index)}
                    aria-label={`Navigate to ${section.label}`}
                    title={section.label}
                >
                    {/* <span className="indicator-tooltip">{section.label}</span> */}
                </button>
            ))}
        </div>
    )
}
