import { Campaign, GlobalState, ProgramState, Transaction } from "@/utils/interfaces";
import { PayloadAction } from "@reduxjs/toolkit";

export const globalAction = {
    setCampaign: (state: GlobalState, action: PayloadAction<Campaign>) => {
        state.campaign = action.payload
    },
    setDonations: (state: GlobalState, action: PayloadAction<Transaction[]>) => {
        state.donations = action.payload
    },
    setWithdrawls: (state: GlobalState, action: PayloadAction<Transaction[]>) => {
        state.withdrawals = action.payload
    },
    setStates: (state: GlobalState, action: PayloadAction<ProgramState>) => {
        state.programCounter = action.payload
    },
    setDelModal: (state: GlobalState, action: PayloadAction<string>) => {
        state.delModal = action.payload
    },
    setWithdrawModal: (state: GlobalState, action: PayloadAction<string>) => {
        state.withdrawModal = action.payload
    },
}