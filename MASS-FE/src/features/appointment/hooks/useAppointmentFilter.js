import { useReducer } from 'react';

const initialState = {
  date: '',
  specialtyId: 'ALL',
  status: 'ALL',
  page: 0,
  size: 6,
};

const appointmentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, date: action.payload, page: 0 };
    case 'SET_SPECIALTY':
      return { ...state, specialtyId: action.payload, page: 0 };
    case 'SET_STATUS':
      return { ...state, status: action.payload, page: 0 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const useAppointmentFilter = () => {
  const [filters, dispatch] = useReducer(appointmentReducer, initialState);
  return { filters, dispatch };
};

export default useAppointmentFilter;
