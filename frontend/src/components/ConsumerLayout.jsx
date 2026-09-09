import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ConsumerLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default ConsumerLayout;
