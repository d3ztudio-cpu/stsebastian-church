import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const normalizeExternalUrl = (value, fallback) => {
  const raw = (value || '').toString().trim();
  if (!raw) return fallback;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `https://${raw}`;
};

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'global_settings', 'socialLinks'));
        if (snapshot.exists()) {
          setSocialLinks(snapshot.data());
        }
      } catch (error) {
        console.error('Unable to load social links:', error);
      }
    };

    loadSocialLinks();
  }, []);

  const socials = [
    {
      name: 'Facebook',
      href: normalizeExternalUrl(socialLinks.facebook, 'https://facebook.com'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H7.9v-2.9h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34v7.03C18.34 21.19 22 17.06 22 12.07z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: normalizeExternalUrl(socialLinks.telegram, 'https://t.me/palli_media_puranattukkara'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M21.8 4.6c.2-.8-.6-1.4-1.3-1.1L2.9 10.2c-.9.3-.9 1.5 0 1.8l4.6 1.5 1.7 5.2c.3.9 1.5 1 2 .2l2.6-3.8 4.7 3.4c.7.5 1.7.1 1.9-.7l1.9-13.2zM8.7 12.8l9.5-6.1-7.8 7.3-.3 3.6-1.4-4.2z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: normalizeExternalUrl(socialLinks.instagram, 'https://instagram.com'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.4 3 3v10c0 1.7-1.4 3-3 3H7c-1.7 0-3-1.4-3-3V7c0-1.7 1.4-3 3-3zm5 2.3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.8-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: normalizeExternalUrl(socialLinks.youtube, 'https://youtube.com'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M21.6 7.2a3 3 0 00-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 00-2.1 2.1A31.6 31.6 0 002 12a31.6 31.6 0 00.4 4.8 3 3 0 002.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 002.1-2.1A31.6 31.6 0 0022 12a31.6 31.6 0 00-.4-4.8zM10 15.5V8.5l6 3.5-6 3.5z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: normalizeExternalUrl(socialLinks.whatsapp, 'https://wa.me/'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1120 12a8 8 0 01-8 8zm4.4-6.1c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.9.9-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.1-.3 0-.4.1-.5l.4-.4c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.1 1.6 2.5 3.9 3.5.5.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-.9.2-.4.2-.8.1-.9-.1-.1-.2-.2-.4-.3z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <footer className="bg-sapphire text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div className="space-y-2">
              <p>
                Website was developed and deployed by{' '}
                <a href="https://d3ztudio-main.web.app/" className="text-gold hover:underline" target="_blank" rel="noreferrer">
                  D3ZTUDIO
                </a>
              </p>
              <p className="text-sm text-white/80">© 2026 St. Sebastian Church. All copyrights reserved.</p>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-wide text-white/90">Social</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3 md:justify-start">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:border-gold hover:bg-white/15"
                  >
                    {social.icon}
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-wide text-white/90">Contact Developer</p>
              <div className="mt-3 flex flex-col items-center gap-2 md:items-start">
                <a href="mailto:d3ztudio@gmail.com" className="inline-flex items-center gap-2 text-white/90 hover:text-gold">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span>d3ztudio@gmail.com</span>
                </a>
                <a href="tel:9188081324" className="inline-flex items-center gap-2 text-white/90 hover:text-gold">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.5 2.7.8 4.2.8.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.5 22 2 13.5 2 3c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.4.3 2.9.8 4.2.1.4 0 .9-.2 1.2L6.6 10.8z" />
                  </svg>
                  <span>9188081324</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 md:items-end">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sapphire text-white shadow-xl transition hover:-translate-y-1 hover:bg-gold"
            aria-label={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>
    </>
  );
};

export default Footer;
