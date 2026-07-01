import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import garageReducer from "./garageSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    garage: garageReducer,
  },
});
