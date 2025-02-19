import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Home from './components/home/Home';
import NotFound from './components/not-found/NotFound';
import MainLayout from './layouts/MainLayout';
import './App.css';
import VendorCodesList from './components/vendorcodes-list/VendorCodesList';
import BarcodesList from './components/barcodes_list/BarcodesList';
import CategoriesList from './components/categories-list/CategoriesList';
import Error from './components/error/Error';
import SingleCategory from './components/single-category/SingleCategory';
import SingleVendorCode from './components/single-vendorcode/SingleVendorCode';
import PriceControlPage from './components/price-cotrol-page/PriceControlPage';
import TasksA28 from './components/price-cotrol-page/tasks-a-28/TasksA28';
import TasksB28 from './components/price-cotrol-page/tasks-b-28/TasksB28';
import TasksDrain from './components/tasks_drain/TasksDrain';
import TaskCreate from './components/price-cotrol-page/tasks-b-28/task-create/TaskCreate';
import TaskEditDrain from './components/tasks_drain/task-edit-drain/TaskEditDrain';
import TaskCreateA28 from './components/price-cotrol-page/tasks-a-28/task-create/TaskCreateA28';
import Tools from './components/tools/Tools';
import AbcPage from './components/abc_page/AbcPage';
import TaskCreateDrain from './components/tasks_drain/task-create/TaskCreateDrain';
import TaskB28Edit from './components/price-cotrol-page/tasks-b-28/task-b28-edit/TaskB28Edit';
import TaskA28Edit from './components/price-cotrol-page/tasks-a-28/task-a28-edit/TaskA28Edit';
import { selectUser } from './redux/slices/authSlice';
import LoginPage from './components/login_page/LoginPage';
import SingleTaskDrainInfo from './components/tasks_drain/tasks_table_drain/single-task-drain-info/SingleTaskDrainInfo';
import SingleTaskB28Info from './components/price-cotrol-page/tasks-b-28/tasks_table/single-task-b28-info/SingleTaskB28Info';
import SingleTaskA28Info from './components/price-cotrol-page/tasks-a-28/tasks_table_a28/single-task-a28-info/SingleTaskA28Info';

import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import EbitdaSettings from './components/ebitda_settings/EbitdaSettings';
import AutoCampaignsList from './components/autocampaigns_list/AutoCampaignsList';
import AutoCampaignCreate from './components/autocampaign_create/AutoCampaignCreate';
import TasksHoldStocks from './components/tasks_hold_stocks/TasksHoldStocks';
import TaskHoldStocksCreate from './components/tasks_hold_stocks/task_hold_stocks_create/TaskHoldStocksCreate';
import TaskHoldStocksEdit from './components/tasks_hold_stocks/task_hold_stocks_edit/TaskHoldStocksEdit';
import SingleTaskHoldStocksInfo from './components/tasks_hold_stocks/tasks_table_hold_stocks/single_task_hold_stocks_info/SingleTaskHoldStocksInfo';

function App() {
  const currentUser = useSelector(selectUser);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <div className="App">
            {currentUser.username ? (
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="vendorcodes" element={<VendorCodesList />} />
                  <Route
                    path="vendorcodes/:id"
                    element={<SingleVendorCode />}
                  />
                  <Route path="barcodes" element={<BarcodesList />} />
                  <Route path="categories" element={<CategoriesList />} />
                  <Route path="categories/:id" element={<SingleCategory />} />
                  <Route path="tools" element={<Tools />} />
                  <Route path="tools/abc_page" element={<AbcPage />} />
                  <Route
                    path="tools/ebitda_settings"
                    element={<EbitdaSettings />}
                  />
                  <Route
                    path="tools/tasks_hold_stocks"
                    element={<TasksHoldStocks />}
                  />
                  <Route
                    path="tools/tasks_hold_stocks/create"
                    element={<TaskHoldStocksCreate />}
                  />
                  <Route
                    path="tools/tasks_hold_stocks/edit/:id"
                    element={<TaskHoldStocksEdit />}
                  />
                  <Route
                    path="tools/tasks_hold_stocks/:id"
                    element={<SingleTaskHoldStocksInfo />}
                  />
                  <Route
                    path="tools/price_control"
                    element={<PriceControlPage />}
                  />
                  <Route
                    path="tools/auto_campaigns"
                    element={<AutoCampaignsList />}
                  />
                  <Route
                    path="tools/auto_campaigns/create"
                    element={<AutoCampaignCreate />}
                  />
                  <Route path="tools/tasks_a_28" element={<TasksA28 />} />
                  <Route
                    path="tools/tasks_a_28/:id"
                    element={<SingleTaskA28Info />}
                  />
                  <Route path="tools/tasks_b_28" element={<TasksB28 />} />
                  <Route
                    path="tools/tasks_b_28/:id"
                    element={<SingleTaskB28Info />}
                  />
                  <Route path="tools/tasks_drain" element={<TasksDrain />} />
                  <Route
                    path="tools/tasks_b_28/create"
                    element={<TaskCreate />}
                  />
                  <Route
                    path="tools/tasks_b_28/edit/:id"
                    element={<TaskB28Edit />}
                  />
                  <Route
                    path="tools/tasks_a_28/create"
                    element={<TaskCreateA28 />}
                  />
                  <Route
                    path="tools/tasks_a_28/edit/:id"
                    element={<TaskA28Edit />}
                  />
                  <Route
                    path="tools/tasks_drain/:id"
                    element={<SingleTaskDrainInfo />}
                  />
                  <Route
                    path="tools/tasks_drain/create"
                    element={<TaskCreateDrain />}
                  />
                  <Route
                    path="tools/tasks_drain/edit/:id"
                    element={<TaskEditDrain />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            ) : (
              <Routes>
                <Route path="*" element={<LoginPage />} />
              </Routes>
            )}
            <Error />
          </div>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
