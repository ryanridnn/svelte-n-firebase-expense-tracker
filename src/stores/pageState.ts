import { writable } from "svelte/store";

export const screenLoadingState = writable<boolean>(true)

export enum RootScreenType {
  Main = 'main',
  Shortcuts = 'shortcuts'

}

export const rootScreenType = writable<RootScreenType>(RootScreenType.Main)
