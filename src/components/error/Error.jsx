import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { clearError, selectErrorMessage } from '../../redux/slices/errorSlice';
import {
  clearNotification,
  selectNotificationMessage,
} from '../../redux/slices/notificationSlice';

const Error = () => {
  const errorMessage = useSelector(selectErrorMessage);
  const notificationMessage = useSelector(selectNotificationMessage);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notificationMessage) {
      toast.success(notificationMessage);
      dispatch(clearNotification());
    }
    if (errorMessage) {
      toast.warn(errorMessage);
      dispatch(clearError());
    }
  }, [notificationMessage, errorMessage, dispatch]);

  return <ToastContainer position="top-right" autoClose={2000} />;
};

export default Error;
