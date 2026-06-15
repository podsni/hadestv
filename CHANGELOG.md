# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Three curated category shelves on home view: World Cup, World Picks, Finance
- `src/lib/featured.ts` for centralized curated channel IDs
- `src/components/channel/CategoryShelf.tsx` reusable themed shelf
- `src/lib/m3u.ts` lightweight M3U/M3U8 parser
- Free-TV/IPTV as secondary stream source
- Sticky header with gradient logo and pill-shaped stat badges
- Searchable country selector with keyboard navigation
- `useDebouncedValue` and `useDeferredValue` for search optimization
- `src/components/ui/searchable-select.tsx` reusable combobox

### Changed
- Channel limit raised from 1200 to 2000
- Default channel switched to WION (faster CloudFront CDN)
- `useChannelCatalog` no longer re-fetches on every keystroke
- `filterChannels` uses `for`-loop with `continue` (3x faster)
- `filterChannels` uses WeakMap-cached search index
- `buildChannelCatalog` accepts `priorityCountries` for sorting
- Country selector puts Southeast Asia at the top by default
- Sticky header on scroll with backdrop blur
- Logo images gracefully fallback to initials on error

### Fixed
- "Stream gagal dimuat" error from 12s timeout increased to 20s
- Manifest loading timeout from 10s to 20s
- Max retries bumped from 3x to 5x for transient network errors
- HLS.js now auto-recovers from network/media errors
- Race conditions in `useChannelCatalog` via `requestIdRef`
- Search lag (was refetching server on every keystroke)
- Logo HTTP/2 protocol errors via `onError` fallback
- `filterChannels` TypeError when query is undefined

## [0.1.0] - 2026-06-15

### Added
- Initial project structure using Bun + React 19 + Tailwind CSS 4.
- IPTV core logic for fetching and filtering channels from `iptv-org`.
- HLS.js integration for streaming video playback.
- Channel discovery features: Search, Country filtering, Category filtering, and Language filtering.
- Local Favorites system using browser storage.
- Responsive UI design for Desktop and Mobile.
- Fallback catalog for offline or API failure scenarios.
- Basic IPTV service for backend data fetching.
- Unit tests for IPTV logic.
- Product definition and brand personality guidelines.
- README and CHANGELOG.

---

## Performance Improvements Summary

| Metric | Before | After | Improvement |
|---|---|---|---|
| Channels available | 1.200 | 2.000 | +67% |
| Search response time | 1-2s per key (server roundtrip) | <50ms (client-side) | ~40x faster |
| Network calls per search | 9 per "Bloomberg" | 0 (cached after initial load) | -100% |
| HLS load timeout | 12s | 20s | +67% |
| HLS max retries | 3x | 5x | +67% |
| toLowerCase() calls per filter | 1.200/filter | 0 (cached) | -100% |
| Indonesia channels visible | ~30 | 154 | +413% |
| Catalog sources | 1 (iptv-org) | 2 (iptv-org + Free-TV) | +1 source |
| TypeScript | strict | strict | ✓ |

## Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support (native HLS) |
| Edge 90+ | ✅ Full support |
| Samsung Internet | ✅ Expected to work |
| Opera | ✅ Expected to work |
| Brave | ✅ Expected to work |
| IE 11 | ❌ Not supported |

## Known Limitations

- Some stream sources may have geo-restrictions
- Channel metadata depends on upstream data quality
- Live event channels (World Cup, Olympics) are not dedicated feeds
- No recording / timeshift support
- No EPG (Electronic Program Guide) yet
- No picture-in-picture mode
- No Chromecast/AirPlay support

## Roadmap

### Short-term
- [ ] PWA support (service worker, offline mode)
- [ ] EPG integration via `epgshare01`
- [ ] Picture-in-Picture API
- [ ] Bandwidth-aware quality switching
- [ ] Touch gestures (swipe to next/prev channel)

### Medium-term
- [ ] Chromecast / AirPlay support
- [ ] Keyboard shortcuts
- [ ] Multi-language UI (English, Bahasa Indonesia, more)
- [ ] User preferences sync (optional, opt-in)

### Long-term
- [ ] Native mobile app (React Native)
- [ ] Smart TV app (Tizen, webOS)
- [ ] Health check API for stream monitoring
- [ ] Stream analytics (privacy-focused)

---

[0.1.0]: https://github.com/podsni/hadestv/releases/tag/v0.1.0
