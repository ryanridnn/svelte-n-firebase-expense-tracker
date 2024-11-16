import { writable } from "svelte/store";

const HIDE_AMOUNT_KEY = "hideAmount"

const getSavedHideAmount = () => {
  return localStorage.getItem(HIDE_AMOUNT_KEY) === "true"
}

export const hideAmount = writable<boolean>(getSavedHideAmount())

export const toggleHideAmount = () => {
  hideAmount.update(prev => {
    localStorage.setItem(HIDE_AMOUNT_KEY, String(!prev))

    return !prev
  })
}
