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
const SkusPage = lazy(() => import('../../pages/SkusPage'));
const SkuDetailPage = lazy(() => import('../../pages/SkuDetailPage'));
const CategoriesPage = lazy(() => import('../../pages/CategoriesPage'));
const OrdersToProcessorsPage = lazy(() => import('../../pages/OrdersToProcessorsPage'));

export function NewAppRoutes() {
  return (
    <>
      <Route
        path="tools/cards"
        element={withSuspense(ProductCardsPage)}
      />
      <Route
        path="skus"
        element={withSuspense(SkusPage)}
      />
      <Route
        path="skus/:sku"
        element={withSuspense(SkuDetailPage)}
      />
      <Route
        path="categories_new"
        element={withSuspense(CategoriesPage)}
      />
      <Route
        path="categories"
        element={withSuspense(CategoriesPage)}
      />
      <Route
        path="tools/orders_to_processors"
        element={withSuspense(OrdersToProcessorsPage)}
      />
      {/* Новые маршруты — ниже */}
    </>
  );
}

export { withSuspense, lazy };
