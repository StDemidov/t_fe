import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

/**
 * Маршруты новых фич — добавляйте сюда, не трогая legacy-маршруты в App.jsx.
 *
 * Пример:
 *
 * const MyFeaturePage = lazy(() =>
 *   import('../../pages/MyFeaturePage/MyFeaturePage')
 * );
 *
 * <Route
 *   path="tools/my-feature"
 *   element={withSuspense(MyFeaturePage)}
 * />
 */
const withSuspense = (LazyComponent) => (
  <Suspense fallback={null}>
    <LazyComponent />
  </Suspense>
);

const ProductCardsPage = lazy(() => import('../../pages/ProductCardsPage'));

export function NewAppRoutes() {
  return (
    <>
      <Route
        path="tools/cards"
        element={withSuspense(ProductCardsPage)}
      />
      {/* Новые маршруты — ниже */}
    </>
  );
}

export { withSuspense, lazy };
