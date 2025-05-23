import { createSlice } from "@reduxjs/toolkit";
import { globalStates as GlobalStates } from "./states";
import {  globalAction as GlobalActions } from "./actions";

export const globalSlices = createSlice({
  name: 'global',
  initialState: GlobalStates,
  reducers: GlobalActions,
})

export const globalActions = globalSlices.actions
export default globalSlices.reducer