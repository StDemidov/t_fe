import { Outlet } from 'react-router-dom';
import Menu from '../components/menu/Menu';

const MainLayout = () => {
  return (
    <>
      <Menu />
      <Outlet />
    </>
  );
};

export default MainLayout;
