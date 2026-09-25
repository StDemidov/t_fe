import { Outlet } from 'react-router-dom';
import AppMenu from '../widgets/AppMenu';

const MainLayout = () => {
  return (
    <>
      <AppMenu />
      <Outlet />
    </>
  );
};

export default MainLayout;
