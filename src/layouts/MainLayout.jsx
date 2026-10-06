import ClassroomBackground from '../components/shared/ClassroomBackground';

// The ONE place the classroom background is mounted. Wraps every route
// (public pages, auth, and both dashboard layouts), so no page — not
// GetStarted, not Login, not any future page — needs to render its own copy.
//
//   App
//    └─ Providers (Theme / Language / Auth / Toast)
//        └─ Router
//            └─ MainLayout
//                ├─ ClassroomBackground   (fixed, z:-10, theme-aware)
//                └─ Routes / page content
export default function MainLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      <ClassroomBackground />
      {children}
    </div>
  );
}
