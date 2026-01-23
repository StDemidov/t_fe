import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Home from './components/home/Home';
import NotFound from './components/not-found/NotFound';
import MainLayout from './layouts/MainLayout';
import './App.css';
import VendorCodesList from './components/vendorcodes-list/VendorCodesList';
import CategoriesListWMetrics from './components/categories_list_w_metrics/CategoriesListWMetrics';
import Error from './components/error/Error';
import SingleVendorCode from './components/single-vendorcode/SingleVendorCode';
import PriceControlPage from './components/price-cotrol-page/PriceControlPage';
import TasksDrain from './components/tasks_drain/TasksDrain';
import TaskEditDrain from './components/tasks_drain/task-edit-drain/TaskEditDrain';
import Tools from './components/tools/Tools';
import AbcPage from './components/abc_page/AbcPage';
import TaskCreateDrain from './components/tasks_drain/task-create/TaskCreateDrain';
import { selectUser } from './redux/slices/authSlice';
import LoginPage from './components/login_page/LoginPage';
import SingleTaskDrainInfo from './components/tasks_drain/tasks_table_drain/single-task-drain-info/SingleTaskDrainInfo';
import BarcodesListNew from './components/barcodes_list_new/BarcodesListNew';

import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import EbitdaSettings from './components/ebitda_settings/EbitdaSettings';
import TasksHoldStocks from './components/tasks_hold_stocks/TasksHoldStocks';
import TaskHoldStocksCreate from './components/tasks_hold_stocks/task_hold_stocks_create/TaskHoldStocksCreate';
import TaskHoldStocksEdit from './components/tasks_hold_stocks/task_hold_stocks_edit/TaskHoldStocksEdit';
import SingleTaskHoldStocksInfo from './components/tasks_hold_stocks/tasks_table_hold_stocks/single_task_hold_stocks_info/SingleTaskHoldStocksInfo';
import TagsPage from './components/tags_page/TagsPage';
import TooltipManager from './TooltipManager/TooltipManager';
import UploadImagePage from './components/upload_image_page/UploadImagePage';
import AbTestsMainPage from './components/ab_tests/AbTestsMainPage';
import AbTestCreate from './components/ab_tests/ab_test_create/AbTestCreate';
import AbTestsSingleTest from './components/ab_tests/ab_tests_single_test/AbTestsSingleTest';
import CampaignsList from './components/campaigns/CampaignsList';
import CampaignsCreate from './components/campaigns/CampaignsCreate/CampaignsCreate';
import CampaignPage from './components/campaigns/CampaignPage/CampaignPage';

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
                  x
                  <Route path="barcodes" element={<BarcodesListNew />} />
                  <Route path="tools/ab_tests" element={<AbTestsMainPage />} />
                  <Route
                    path="tools/ab_tests/create"
                    element={<AbTestCreate />}
                  />
                  <Route path="tools/campaigns" element={<CampaignsList />} />
                  <Route
                    path="tools/campaigns/:id"
                    element={<CampaignPage />}
                  />
                  <Route
                    path="tools/campaigns/create"
                    element={<CampaignsCreate />}
                  />
                  <Route
                    path="tools/ab_tests/info/:id"
                    element={<AbTestsSingleTest />}
                  />
                  <Route
                    path="categories"
                    element={<CategoriesListWMetrics />}
                  />
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
                  <Route path="tools/tasks_drain" element={<TasksDrain />} />
                  <Route path="tools/tags_setup" element={<TagsPage />} />
                  <Route
                    path="tools/upload_photo"
                    element={<UploadImagePage />}
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
            <TooltipManager />
          </div>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
