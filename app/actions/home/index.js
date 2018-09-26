// @flow
export * from './alert';
export * from './autoAcro';
export * from './cache';
export * from './images';
export * from './modal';
export * from './options';
export * from './scripts';
export * from './wordConverter';

export const setTextContent = (payload) => ({ type: 'SET_TEXTCONTENT', payload });
export const setClipboard = (payload) => ({ type: 'SET_CLIPBOARD', payload });
export const undo = () => ({ type: 'UNDO' });