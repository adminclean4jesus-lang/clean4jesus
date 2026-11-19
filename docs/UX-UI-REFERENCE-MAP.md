# Clean4Jesus UX/UI reference map

The HTML references are visual specifications. Native behavior remains owned by the Expo Router, Supabase and platform protection services.

| Reference | Product surface | Existing implementation |
| --- | --- | --- |
| screen-01 | Welcome / value promise | `src/features/onboarding/WelcomeAuthScreen.tsx`, `app/index.tsx` |
| screen-02 | Registration and sign-in | `src/features/auth/CommunityAuthGate.tsx` |
| screen-03 | Protection explanation | Android/iOS gate in `app/index.tsx` |
| screen-04 | PIN protection | Guardian flow in `app/pin-setup.tsx`; visual language only, never local PIN creation |
| screen-05 | Email confirmation | Confirmation state in `CommunityAuthGate.tsx` and `app/auth/callback.tsx` |
| screen-06 | Refugio status | `app/(tabs)/index.tsx` |
| screen-07 | Profile and settings | `app/(tabs)/perfil.tsx`, `app/settings.tsx` |
| screen-08 | Trusted person | `app/trusted-person.tsx` |
| screen-09 | Community access | Global auth gate; Community never owns authentication again |
| screen-10 | Community content states | `app/(tabs)/community.tsx` and community state cards |
| screen-11 | Create community post | `CommunityComposerModal.tsx` |
| screen-12 | Palabra catalog | `app/(tabs)/devotional.tsx` |
| screen-13 | Plan detail and itinerary | `app/plans/[id].tsx`, `app/plans/[id]/day/[day].tsx` |

## Product constraints preserved

- Account authentication precedes guardian PIN and protection setup.
- Guardian PIN is generated remotely and delivered only to the trusted person.
- Android base protection requires PIN plus local VPN; Accessibility remains an explicit optional feature and is never a banking prerequisite.
- Native iOS Family Controls and Android protection services retain their current behavior.
- The persistent navigation has exactly four modules: Refugio, Palabra, Comunidad and Perfil.

## Shared visual contract

- Deep navy `#02174B`, gold `#D9A441`, soft gold `#FFDEA5`, surface `#F8F9FA`, white `#FFFFFF`, ink `#191C1D`.
- Montserrat 600/700 for headings and actions; Inter 400/500 for body and utility copy.
- Mobile margin 24, spacing rhythm 8/16/24/32, 16-radius cards, pill primary actions.
- Responsive content is centered at a maximum width of 760 on large screens.
- Loading, empty, error and success states use the same card, icon and type hierarchy.
