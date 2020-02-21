/// <reference types="Electron" />

declare interface Window extends Preload {
    Entry: Entry;
    createjs: any;
    EntryStatic: any;
    Lang: any;
    isOsx: boolean;
}

declare interface Preload {
    dialog: Electron.Dialog;
    onPageLoaded(callback: () => void): void;
    getSharedObject(): GlobalConfigurations;
    initNativeMenu(): void;
    getLang(key: string): string;
}

declare var entrylms: any;
declare var Lang: any;
declare var createjs: any;
declare var EntryStatic: any;
