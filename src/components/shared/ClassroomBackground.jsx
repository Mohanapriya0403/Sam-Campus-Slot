// ---------------------------------------------------------------------------
// ONE global brand background: a realistic modern engineering-college smart
// classroom (smart board, desks, windows, ceiling lights). Mounted exactly
// once, in MainLayout, so it sits behind literally every route without any
// individual page having to think about it.
//
// It is theme-aware but requires no state of its own — the tint/scrim colors
// are CSS custom properties re-declared under the `.dark` class that
// ThemeContext already toggles on <html>, so Light / Dark / System all just
// work by inheriting the same mechanism the rest of the app uses.
// ---------------------------------------------------------------------------

const CLASSROOM_IMAGE =
  'https://images.unsplash.com/photo-1779358296802-715fc9fbc152?fm=jpg&q=80&w=2400&auto=format&fit=crop';

export default function ClassroomBackground() {
  return (
    <div className="classroom-bg" aria-hidden="true">
      <img src={CLASSROOM_IMAGE} alt="" className="classroom-bg__img" loading="eager" />
      <div className="classroom-bg__tint" />
      <div className="classroom-bg__grid" />
      <div className="classroom-bg__scrim" />
    </div>
  );
}
