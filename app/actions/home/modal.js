
export const triggerHideModal = () => ({ type: 'MODAL_TRIGGER_HIDE' });

export const triggerShowModal = (payload) => ({ type: 'MODAL_TRIGGER_SHOW', payload });

export const triggerShowAutoAcro = () => triggerShowModal({ display: 'autoAcro', screen: 'acroList' });

export const triggerShowPreview = () => triggerShowModal({ display: 'preview', screen: 'preview' });