import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { IconMapPin, IconShieldCheck } from './Icons';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--bg-surface)', 
      borderTop: '1px solid var(--border-subtle)', 
      marginTop: 'auto',
      color: 'var(--text-secondary)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '3.5rem 1.5rem 2rem' }}>
        
        {/* Top Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          
          {/* Brand & Mission */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: '1rem' }}>
              <BrandLogo size="md" />
            </div>
            <p style={{ 
              fontSize: '0.92rem', 
              lineHeight: 1.65, 
              color: 'var(--text-muted)',
              marginBottom: '1.25rem' 
            }}>
              A human-first mutual aid ecosystem for Jahangirnagar University. Borrow tools, lend books, buy course notes, and share free supplies with verified peers.
            </p>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.45rem 0.85rem', 
              borderRadius: '9999px',
              backgroundColor: 'var(--accent-emerald-subtle)',
              border: '1px solid rgba(37, 122, 84, 0.25)',
              fontSize: '0.8rem',
              color: 'var(--accent-emerald-text)',
              fontWeight: 600
            }}>
              <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />
              <span>Campus Green Loop • Zero Waste</span>
            </div>
          </div>

          {/* 5 Core Pillars */}
          <div>
            <h4 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              marginBottom: '1rem' 
            }}>
              Campus Exchange
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/borrow" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  🤝 Borrow Items (ধার নিন)
                </Link>
              </li>
              <li>
                <Link to="/lend" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  🤲 Lend Your Gear (ধার দিন)
                </Link>
              </li>
              <li>
                <Link to="/buy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  🛒 Buy Peer Goods (কিনুন)
                </Link>
              </li>
              <li>
                <Link to="/sell" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  🏷️ Sell Used Gear (বিক্রি)
                </Link>
              </li>
              <li>
                <Link to="/free" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  🎁 Free Giveaways (দান/উপহার)
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Campus Safety */}
          <div>
            <h4 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              marginBottom: '1rem' 
            }}>
              Trust & Meetups
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <IconMapPin size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Recommended Spots: Bottola, TSC, Central Library, Shaheed Minar</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <IconShieldCheck size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Peer Trust System: Student ID & Hall verification for honest loans</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/create-resource" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.84rem', display: 'inline-flex' }}>
                  + Post a Campus Listing
                </Link>
              </div>
            </div>
          </div>

          {/* Student Warmth & Halls */}
          <div>
            <h4 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              marginBottom: '1rem' 
            }}>
              Residential Halls
            </h4>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              Active across all JU residential halls:
              Al-Beruni, Mir Mosharraf Hossain, Salam-Barkat, Shaheed Rafiq-Jabbar, Pritilata, Fazilatunnesa, Sufia Kamal, Nawab Faizunnesa & New Hall complexes.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              ☕ <em>"চায়ের কাপে শেয়ারিং, আড্ডায় মিলে সমাধান"</em>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid var(--border-subtle)', 
          paddingTop: '1.75rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          fontSize: '0.86rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--text-main)' }}>CholoShareKori (চলো শেয়ার করি)</strong>. Crafted with human empathy for campus peers.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>0% Commission</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>100% Student-to-Student</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
