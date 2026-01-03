import { useState, useEffect } from 'react'

const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
]

export default function Navigation({ activeSection, onNavigate, isVisible }) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!isVisible) return null

    return (
        <>
            {/* Top Navigation */}
            {/* <nav className="nav-container">
                <a href="#" className="nav-logo" onClick={() => onNavigate(0)}>
                    Portfolio
                </a>
                <ul className="nav-links">
                    {sections.map((section, index) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className={`nav-link ${activeSection === index ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onNavigate(index)
                                }}
                            >
                                {section.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav> */}

            {/* Section Indicators (right side) */}
            <div className="section-indicators">
                {sections.map((section, index) => (
                    <button
                        key={section.id}
                        className={`section-indicator ${activeSection === index ? 'active' : ''}`}
                        onClick={() => onNavigate(index)}
                        aria-label={`Navigate to ${section.label}`}
                    />
                ))}
            </div>
        </>
    )
}
